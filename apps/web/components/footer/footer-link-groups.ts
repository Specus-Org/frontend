import type { CmsFooterGroupWithItems } from '@specus/api-client';

export interface FooterLinkItem {
  id: string;
  title: string;
  urlPath: string;
}

export interface FooterLinkGroup {
  id: string;
  name: string;
  items: FooterLinkItem[];
}

export function normalizeFooterGroups(
  groups: CmsFooterGroupWithItems[] | null | undefined,
): FooterLinkGroup[] {
  return (groups ?? [])
    .map((group) => ({
      id: group.id,
      name: group.name,
      items: group.items
        .filter((item) => item.title.trim().length > 0 && item.url_path.trim().length > 0)
        .map((item) => ({
          id: item.id,
          title: item.title,
          urlPath: item.url_path,
        })),
    }))
    .filter((group) => group.items.length > 0);
}
