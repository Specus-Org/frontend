'use client';

import { useEffect, useState } from 'react';
import { Loader2, PanelsTopLeft, Unlink } from 'lucide-react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { Button } from '@specus/ui/components/button';
import { Badge } from '@specus/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@specus/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@specus/ui/components/select';
import { fetcher } from '@/lib/fetcher';
import type {
  ContentFooterGroupResponse,
  FooterGroupListResponse,
} from '@/components/footer-groups/types';

interface FooterGroupCardProps {
  contentId: string;
}

export function FooterGroupCard({ contentId }: FooterGroupCardProps) {
  const {
    data: footerGroupsData,
    error: footerGroupsError,
    isLoading: footerGroupsLoading,
    mutate: mutateFooterGroups,
  } = useSWR<FooterGroupListResponse>('/api/cms/footer-groups', fetcher);

  const {
    data: membershipData,
    error: membershipError,
    isLoading: membershipLoading,
    mutate: mutateMembership,
  } = useSWR<ContentFooterGroupResponse>(`/api/cms/contents/${contentId}/footer-group`, fetcher);

  const [selectedFooterGroupId, setSelectedFooterGroupId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (membershipData?.current_footer_group_id) {
      setSelectedFooterGroupId(membershipData.current_footer_group_id);
    }
  }, [membershipData?.current_footer_group_id]);

  const footerGroups = footerGroupsData?.items ?? [];
  const integrationReady =
    (footerGroupsData?.integration_ready ?? false) && (membershipData?.integration_ready ?? false);
  const loading = footerGroupsLoading || membershipLoading;
  const error = footerGroupsError ?? membershipError;
  const currentFooterGroup =
    membershipData?.current_footer_group ??
    footerGroups.find(
      (footerGroup) => footerGroup.id === membershipData?.current_footer_group_id,
    ) ??
    null;
  const selectableFooterGroups =
    currentFooterGroup &&
    !footerGroups.some((footerGroup) => footerGroup.id === currentFooterGroup.id)
      ? [currentFooterGroup, ...footerGroups]
      : footerGroups;

  async function handleAssign() {
    if (!selectedFooterGroupId) {
      toast.error('Select a footer group first');
      return;
    }

    setIsAssigning(true);

    try {
      const response = await fetch(`/api/cms/contents/${contentId}/footer-group`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ footer_group_id: selectedFooterGroupId }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(data?.message ?? 'Failed to assign footer group');
        return;
      }

      toast.success('Footer group assigned');
      await Promise.all([mutateMembership(), mutateFooterGroups()]);
    } catch {
      toast.error('Network error');
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleRemove() {
    setIsRemoving(true);

    try {
      const response = await fetch(`/api/cms/contents/${contentId}/footer-group`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok && response.status !== 204) {
        toast.error(data?.message ?? 'Failed to remove footer group');
        return;
      }

      toast.success('Footer group removed');
      setSelectedFooterGroupId('');
      await mutateMembership();
    } catch {
      toast.error('Network error');
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <PanelsTopLeft className="size-4" />
              Footer Group
            </CardTitle>
            <CardDescription className="mt-1">
              Place this content in one footer group, or remove it from the footer entirely.
            </CardDescription>
          </div>
          <Badge variant={integrationReady ? 'default' : 'secondary'}>
            {integrationReady ? 'Connected' : 'Scaffolded'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading footer assignment...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-destructive">
            {error instanceof Error ? error.message : 'Failed to load footer assignment'}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-dashed bg-muted/20 p-4">
              <p className="text-sm font-medium">Current footer group</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentFooterGroup
                  ? `${currentFooterGroup.name} (${currentFooterGroup.slug})`
                  : 'This content is not currently assigned to a footer group.'}
              </p>
              {!integrationReady && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {membershipData?.message ??
                    footerGroupsData?.message ??
                    'The footer-group API surface is scaffolded and waiting for the generated client contract.'}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="content-footer-group" className="text-sm font-medium">
                Footer group
              </label>
              <Select value={selectedFooterGroupId} onValueChange={setSelectedFooterGroupId}>
                <SelectTrigger id="content-footer-group">
                  <SelectValue placeholder="Select one footer group" />
                </SelectTrigger>
                <SelectContent>
                  {selectableFooterGroups.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      No footer groups available
                    </SelectItem>
                  ) : (
                    selectableFooterGroups.map((footerGroup) => (
                      <SelectItem key={footerGroup.id} value={footerGroup.id}>
                        {footerGroup.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleAssign}
                // disabled={!integrationReady || !canAssign || isAssigning}
              >
                {isAssigning ? 'Assigning...' : 'Assign to Footer Group'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                disabled={
                  !integrationReady || !membershipData?.is_assigned || isRemoving
                }
              >
                <Unlink className="mr-2 size-4" />
                {isRemoving ? 'Removing...' : 'Remove from Footer'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
