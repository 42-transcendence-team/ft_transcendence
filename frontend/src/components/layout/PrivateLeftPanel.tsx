import type { ReactNode } from 'react';

type PrivateLeftPanelProps = {
  children: ReactNode;
};

export function PrivateLeftPanel({ children }: PrivateLeftPanelProps) {
  return <aside className="privateLayout__leftPanel">{children}</aside>;
}
