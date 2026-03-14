import React from 'react';

interface HorizontalDividerProps {
  className?: string;
}

export function HorizontalDivider({ className }: HorizontalDividerProps): React.ReactNode {
  return <div className={`my-auto h-14 w-0 border-l ${className ?? 'hidden lg:block'}`} />;
}

export default HorizontalDivider;
