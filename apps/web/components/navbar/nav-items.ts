export interface NavItem {
  labelKey: string;
  value: string;
  href: string;
}

export const navItems: NavItem[] = [
  {
    labelKey: 'Bangladesh',
    value: 'bangladesh',
    href: '/bangladesh',
  },
  {
    labelKey: 'Indonesia',
    value: 'indonesia',
    href: '/indonesia',
  },
  {
    labelKey: 'Paraguay',
    value: 'paraguay',
    href: '/paraguay',
  },
  {
    labelKey: 'AML Screening',
    value: 'aml',
    href: '/aml',
  },
];
