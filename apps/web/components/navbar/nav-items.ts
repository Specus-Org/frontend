export interface NavItem {
  labelKey: string;
  value: string;
  href: string;
}

export const navItems: NavItem[] = [
  {
    labelKey: 'Insights',
    value: 'insight',
    href: '/insight',
  },
  {
    labelKey: 'Resources',
    value: 'resources',
    href: '/resources',
  },
  {
    labelKey: 'Profiling',
    value: 'profiling',
    href: '/profiling',
  },
  {
    labelKey: 'AML Screening',
    value: 'aml',
    href: '/aml',
  },
];
