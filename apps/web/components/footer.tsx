import React from 'react';
import { publicGetFooter } from '@specus/api-client';
import FooterBrand from '@/components/footer/footer-brand';
import FooterLinks from '@/components/footer/footer-links';
import FooterBottom from '@/components/footer/footer-bottom';
import {
  normalizeFooterGroups,
  type FooterLinkGroup,
} from '@/components/footer/footer-link-groups';

export default async function Footer(): Promise<React.ReactNode> {
  let groups: FooterLinkGroup[] = [];

  try {
    const response = await publicGetFooter();
    groups = normalizeFooterGroups(response.data?.groups);
  } catch {
    groups = [];
  }

  return (
    <footer className="bg-secondary">
      <div className="mx-auto p-8">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          <FooterBrand />
          <FooterLinks groups={groups} />
        </div>

        {/* Bottom bar */}
        <FooterBottom />
      </div>
    </footer>
  );
}
