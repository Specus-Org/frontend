import Link from 'next/link';
import React from 'react';
import { NavItem } from '@/components/navbar/nav-items';

interface DesktopNavProps {
  items: NavItem[];
  currentPath: string;
}

export default function DesktopNav({ items, currentPath }: DesktopNavProps): React.ReactNode {
  return (
    <div className="hidden md:flex flex-row items-center">
      {items.map((navigation, index) => (
        <div key={index} className="inline-flex flex-col gap-3">
          <Link
            href={navigation.href}
            className={
              'text-sm font-medium transition-all px-4 duration-200 hover:cursor-pointer hover:opacity-40'
            }
          >
            {navigation.labelKey}
          </Link>
          <div
            className={`h-0.5 w-full rounded-md ${
              currentPath.startsWith(navigation.href) ? 'bg-blue-900' : 'bg-transparent'
            }`}
          />
        </div>
      ))}
    </div>
  );
}
