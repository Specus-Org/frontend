import React from 'react';
import Image from 'next/image';

export default function FooterBrand(): React.ReactNode {
  return (
    <div className="max-w-xl space-y-6">
      <Image
        src="/ic_logo_transparent.png"
        alt="Specus logo"
        width={64}
        height={64}
        className="h-16 w-16"
      />

      <h3 className="text-blue-900 font-sans text-4xl font-semibold">Specus</h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed">
        Specus is a procurement intelligence platform that transforms tender data into macro
        insights, procurement profiling, integrity screening, and relationship mapping across
        countries.
      </p>
    </div>
  );
}
