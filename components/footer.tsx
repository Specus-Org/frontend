import React from 'react';
import FooterBrand from '@/components/footer/footer-brand';
import FooterLinks from '@/components/footer/footer-links';
import FooterBottom from '@/components/footer/footer-bottom';

export default function Footer(): React.ReactNode {
  return (
    <footer className="bg-secondary">
      <div className="mx-auto p-8">
        {/* Main footer content */}
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          {/* Left side - Logo and description */}
          <FooterBrand />

          {/* Right side - Links */}
          <FooterLinks />
        </div>

        {/* Bottom bar */}
        <FooterBottom />
      </div>
    </footer>
  );
}
