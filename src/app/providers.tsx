'use client';

import { ReactNode } from 'react';

import { PHProvider } from '@/providers/PostHogProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PHProvider>
      {children}
    </PHProvider>
  );
}
