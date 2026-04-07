'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, File, Image, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@specus/ui/components/dialog';
import { toast } from 'sonner';
import type { CmsUploadPresignResponse } from '@specus/api-client';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

type UploadStep = 'idle' | 'presigning' | 'uploading' | 'confirming' | 'done';

const IMAGE_EXTENSIONS = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const DOCUMENT_MAX_SIZE = 50 * 1024 * 1024; // 50 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getUploadType(contentType: string): 'image' | 'document' {
  return IMAGE_EXTENSIONS.has(contentType) ? 'image' : 'document';
}

function validateFile(file: File): string | null {
  const uploadType = getUploadType(file.type);

  if (uploadType === 'image' && file.size > IMAGE_MAX_SIZE) {
    return `Image files must be smaller than 10 MB. This file is ${formatFileSize(file.size)}.`;
  }

  if (uploadType === 'document' && file.size > DOCUMENT_MAX_SIZE) {
    return `Document files must be smaller than 50 MB. This file is ${formatFileSize(file.size)}.`;
  }

  if (!file.type) {
    return 'Could not determine the file type. Please select a valid file.';
  }

  return null;
}

const STEP_LABELS: Record<UploadStep, string> = {
  idle: '',
  presigning: 'Requesting upload URL...',
  uploading: 'Uploading...',
  confirming: 'Confirming...',
  done: 'Done!',
};

export function UploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<UploadStep>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setStep('idle');
    setProgress(0);
    setError(null);
    setIsDragOver(false);
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      // Don't allow closing while upload is in progress
      if (step !== 'idle' && step !== 'done') return;
      reset();
    }
    onOpenChange(nextOpen);
  }

  function handleFileSelect(file: File) {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    // Generate preview for images
    if (getUploadType(file.type) === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function removeFile() {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  /**
   * Upload the file to the presigned S3 URL using XMLHttpRequest
   * so we can track upload progress.
   */
  function uploadToStorage(
    uploadUrl: string,
    file: File,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Storage upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        xhrRef.current = null;
        reject(new Error('Network error during file upload'));
      });

      xhr.addEventListener('abort', () => {
        xhrRef.current = null;
        reject(new Error('Upload was cancelled'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setError(null);

    const uploadType = getUploadType(selectedFile.type);

    try {
      // Step 1: Request presigned URL
      setStep('presigning');
      const presignRes = await fetch('/api/cms/uploads/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile.name,
          content_type: selectedFile.type,
          upload_type: uploadType,
          size_bytes: selectedFile.size,
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => null);
        throw new Error(
          data?.message ?? 'Failed to get upload URL from server',
        );
      }

      const presignData: CmsUploadPresignResponse = await presignRes.json();

      // Step 2: Upload file directly to storage (presigned URL)
      setStep('uploading');
      setProgress(0);
      await uploadToStorage(presignData.upload_url, selectedFile);

      // Step 3: Confirm the upload
      setStep('confirming');
      const confirmRes = await fetch(
        `/api/cms/uploads/${presignData.upload_id}/confirm`,
        { method: 'POST' },
      );

      if (!confirmRes.ok) {
        const data = await confirmRes.json().catch(() => null);
        throw new Error(data?.message ?? 'Failed to confirm upload');
      }

      // Done
      setStep('done');
      toast.success(`"${selectedFile.name}" uploaded successfully`);

      // Brief delay to show the success state, then close
      setTimeout(() => {
        onUploadComplete();
        reset();
        onOpenChange(false);
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStep('idle');
    }
  }

  const isUploading = step !== 'idle' && step !== 'done';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          {!selectedFile && (
            <div
              role="button"
              tabIndex={0}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <Upload className="mb-3 size-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drop a file here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Images up to 10 MB, documents up to 50 MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleInputChange}
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          />

          {/* Selected file preview */}
          {selectedFile && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                {/* Preview thumbnail or icon */}
                {preview ? (
                  <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-md border bg-white">
                    {getUploadType(selectedFile.type) === 'image' ? (
                      <Image className="size-8 text-muted-foreground" />
                    ) : (
                      <File className="size-8 text-muted-foreground" />
                    )}
                  </div>
                )}

                {/* File info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedFile.type || 'Unknown type'} &middot;{' '}
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Type:{' '}
                    <span className="capitalize">
                      {getUploadType(selectedFile.type)}
                    </span>
                  </p>
                </div>

                {/* Remove button (only when idle) */}
                {step === 'idle' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={removeFile}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>

              {/* Upload progress */}
              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    <span>{STEP_LABELS[step]}</span>
                    {step === 'uploading' && (
                      <span className="ml-auto font-medium">{progress}%</span>
                    )}
                  </div>
                  {step === 'uploading' && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Done state */}
              {step === 'done' && (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  <span className="font-medium">{STEP_LABELS[step]}</span>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || step === 'done'}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
