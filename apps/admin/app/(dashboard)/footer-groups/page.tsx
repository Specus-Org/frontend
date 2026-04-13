'use client';

import { useState } from 'react';
import { Loader2, PanelsTopLeft, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { Button } from '@specus/ui/components/button';
import { Badge } from '@specus/ui/components/badge';
import { fetcher } from '@/lib/fetcher';
import { FooterGroupsTable } from '@/components/footer-groups/footer-groups-table';
import type { FooterGroup, FooterGroupListResponse } from '@/components/footer-groups/types';

const FooterGroupDialog = dynamic(() =>
  import('@/components/footer-groups/footer-group-dialog').then((m) => m.FooterGroupDialog),
);

export default function FooterGroupsPage() {
  const { data, error, isLoading, mutate } = useSWR<FooterGroupListResponse>(
    '/api/cms/footer-groups',
    fetcher,
  );

  const footerGroups = data?.items ?? [];
  const integrationReady = data?.integration_ready ?? false;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [editingFooterGroup, setEditingFooterGroup] = useState<FooterGroup | null>(null);

  function openCreateDialog() {
    setEditingFooterGroup(null);
    setDialogKey((key) => key + 1);
    setDialogOpen(true);
  }

  function openEditDialog(footerGroup: FooterGroup) {
    setEditingFooterGroup(footerGroup);
    setDialogKey((key) => key + 1);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Footer Groups</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize which content links appear together in the site footer.
          </p>
        </div>
        <Button onClick={openCreateDialog} size="sm" disabled={!integrationReady}>
          <Plus className="size-4" />
          Add Footer Group
        </Button>
      </div>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-md border">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button variant="outline" onClick={() => mutate()}>
            Try again
          </Button>
        </div>
      ) : (
        <FooterGroupsTable
          footerGroups={footerGroups}
          isLoading={false}
          actionsDisabled={!integrationReady}
          onEdit={openEditDialog}
          onDeleted={() => mutate()}
        />
      )}

      <FooterGroupDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        footerGroup={editingFooterGroup}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
