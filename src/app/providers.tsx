'use client';

import { ReactNode } from 'react';
import { BrainAIProvider } from '@/contexts/BrainAIContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <BrainAIProvider>
      {children}
    </BrainAIProvider>
  );
}
