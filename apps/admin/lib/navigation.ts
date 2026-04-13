import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderTree,
  Tag,
  FileType2,
  PanelsTopLeft,
  Upload,
  Activity,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        title: 'Contents',
        href: '/contents',
        icon: FileText,
      },
      {
        title: 'Authors',
        href: '/authors',
        icon: Users,
      },
      {
        title: 'Categories',
        href: '/categories',
        icon: FolderTree,
      },
      {
        title: 'Tags',
        href: '/tags',
        icon: Tag,
      },
      {
        title: 'Page Types',
        href: '/page-types',
        icon: FileType2,
      },
      {
        title: 'Footer Groups',
        href: '/footer-groups',
        icon: PanelsTopLeft,
      },
      {
        title: 'Uploads',
        href: '/uploads',
        icon: Upload,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        title: 'Health',
        href: '/health',
        icon: Activity,
      },
    ],
  },
];
