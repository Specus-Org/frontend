import React from 'react';

export default function FooterBrand(): React.ReactNode {
  return (
    <div className="max-w-xl space-y-6">
      <h3 className="text-blue-900 font-sans text-4xl font-semibold">
        Specus
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed">
        Specus is a procurement intelligence platform that transforms tender data into macro insights, procurement profiling, integrity screening, and relationship mapping across countries.
      </p>
    </div>
  );
}
