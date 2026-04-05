import React from 'react';

export default function FooterBottom(): React.ReactNode {
  return (
    <div className="mt-12 flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
      <p className="text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} Specus. All right reserved.
      </p>
    </div>
  );
}
