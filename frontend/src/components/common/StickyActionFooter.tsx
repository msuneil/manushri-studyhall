import type { ReactNode } from 'react';

interface StickyActionFooterProps {
  children: ReactNode;
}

export function StickyActionFooter({ children }: StickyActionFooterProps) {
  return (
    <div className="flex gap-3">
      {children}
    </div>
  );
}
