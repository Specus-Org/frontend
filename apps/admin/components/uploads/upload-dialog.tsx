'use client';

import { useCallback, useRef, useState } from 'react';
import { CheckCircle2, File, Image, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@specus/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@specus/ui/components/dialog';
import { Input } from '@specus/ui/components/input';
import { Label } from '@specus/ui/components/label';
import { Textarea } from '@specus/ui/components/textarea';
import { toast } from 'sonner';
import type { CmsUploadPresignResponse } from '@specus/api-client';
import type { CmsUploadUpdateRequest } from '@/types/uploads';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

type UploadStep = 'idle' | 'presigning' | 'uploading' | 'confirming' | 'confirm_failed' | 'done';

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
  confirm_failed: 'Confirmation failed',
  done: 'Done!',
};

export function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<UploadStep>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const uploadIdRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setStep('idle');
    setProgress(0);
    setError(null);
    setIsDragOver(false);
    setTitle('');
    setDescription('');
    setAltText('');
    uploadIdRef.current = null;
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      if (step !== 'idle' && step !== 'done' && step !== 'confirm_failed') {
        return;
      }
      reset();
    }
    onOpenChange(nextOpen);
  }

  function handleFileSelect(file: File) {
    setError(null);
    setTitle('');
    setDescription('');
    setAltText('');
    uploadIdRef.current = null;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    if (getUploadType(file.type) === 'image') {
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function removeFile() {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setTitle('');
    setDescription('');
    setAltText('');
    uploadIdRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function buildMetadataPayload(file: File): CmsUploadUpdateRequest {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedAltText = altText.trim();
    const isImage = getUploadType(file.type) === 'image';

    return {
      title: normalizedTitle || null,
      description: normalizedDescription || null,
      alt_text: isImage ? normalizedAltText || null : null,
    };
  }

  function hasMetadataValues(payload: CmsUploadUpdateRequest) {
    return Boolean(payload.title || payload.description || payload.alt_text);
  }

  async function saveMetadata(uploadId: string, file: File) {
    const payload = buildMetadataPayload(file);
    if (!hasMetadataValues(payload)) return;

    const res = await fetch(`/api/cms/uploads/${uploadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message ?? 'Failed to save upload metadata');
    }
  }

  async function confirmUpload(uploadId: string, file: File) {
    setStep('confirming');
    setError(null);

    try {
      const confirmRes = await fetch(`/api/cms/uploads/${uploadId}/confirm`, {
        method: 'POST',
      });

      if (!confirmRes.ok) {
        const data = await confirmRes.json().catch(() => null);
        throw new Error(data?.message ?? 'Failed to confirm upload');
      }

      try {
        await saveMetadata(uploadId, file);
        toast.success(`"${file.name}" uploaded successfully`);
      } catch {
        toast.warning('File uploaded, but metadata could not be saved. You can edit it later.');
      }

      setStep('done');
      onUploadComplete();

      setTimeout(() => {
        reset();
        onOpenChange(false);
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}. The file is still uploaded and remains pending until confirmation succeeds.`
          : 'Confirmation failed. The file is uploaded and remains pending until confirmation succeeds.',
      );
      setStep('confirm_failed');
      onUploadComplete();
    }
  }

  function uploadToStorage(uploadUrl: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
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
        throw new Error(data?.message ?? 'Failed to get upload URL from server');
      }

      const presignData: CmsUploadPresignResponse = await presignRes.json();
      uploadIdRef.current = presignData.upload_id;

      setStep('uploading');
      setProgress(0);
      await uploadToStorage(presignData.upload_url, selectedFile);

      await confirmUpload(presignData.upload_id, selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStep('idle');
    }
  }

  async function handleRetryConfirmation() {
    if (!selectedFile || !uploadIdRef.current) return;
    await confirmUpload(uploadIdRef.current, selectedFile);
  }

  const isUploading = step === 'presigning' || step === 'uploading' || step === 'confirming';
  const isImageUpload = selectedFile && getUploadType(selectedFile.type) === 'image';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? (
            <div
              role="button"
              tabIndex={0}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
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
              <p className="text-sm font-medium">Drop a file here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Images up to 10 MB, documents up to 50 MB
              </p>
            </div>
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleInputChange}
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
          />

          {selectedFile ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                {preview ? (
                  <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="size-full object-cover" />
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

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedFile.type || 'Unknown type'} &middot;{' '}
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Type: <span className="capitalize">{getUploadType(selectedFile.type)}</span>
                  </p>
                </div>

                {step === 'idle' ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={removeFile}
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </div>

              {isUploading ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    <span>{STEP_LABELS[step]}</span>
                    {step === 'uploading' ? (
                      <span className="ml-auto font-medium">{progress}%</span>
                    ) : null}
                  </div>
                  {step === 'uploading' ? (
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 'done' ? (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  <span className="font-medium">{STEP_LABELS[step]}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {selectedFile ? (
            <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Optional metadata</h3>
                <p className="text-xs text-muted-foreground">
                  Add details now or edit them later from the uploads library.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="upload-metadata-title">Title</Label>
                <Input
                  id="upload-metadata-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Optional title"
                  disabled={isUploading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="upload-metadata-description">Description</Label>
                <Textarea
                  id="upload-metadata-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  disabled={isUploading}
                />
              </div>

              {isImageUpload ? (
                <div className="grid gap-2">
                  <Label htmlFor="upload-metadata-alt-text">Alt text</Label>
                  <Input
                    id="upload-metadata-alt-text"
                    value={altText}
                    onChange={(event) => setAltText(event.target.value)}
                    placeholder="Describe the image for accessibility"
                    disabled={isUploading}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 'confirm_failed' ? (
            <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-800 dark:text-yellow-300">
              The file uploaded successfully, but the CMS could not confirm it. It remains available
              as a pending upload. Retry confirmation now, or close this dialog and revisit it later
              from the uploads library.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isUploading}>
            {step === 'confirm_failed' ? 'Close' : 'Cancel'}
          </Button>

          {step === 'confirm_failed' ? (
            <Button onClick={handleRetryConfirmation} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Retrying
                </>
              ) : (
                'Retry Confirmation'
              )}
            </Button>
          ) : (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
