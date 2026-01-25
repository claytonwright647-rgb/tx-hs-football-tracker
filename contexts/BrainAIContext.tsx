'use client';

import React, { createContext, useContext } from 'react';
import { useBrainAI, BrainAIData } from '@/hooks/useBrainAI';

interface BrainAIContextType extends BrainAIData {
  leagueId: string;
}

const BrainAIContext = createContext<BrainAIContextType | undefined>(undefined);

export function BrainAIProvider({
  children,
  leagueId = 'hs-football',
}: {
  children: React.ReactNode;
  leagueId?: string;
}) {
  const brainAIData = useBrainAI(leagueId);

  return (
    <BrainAIContext.Provider
      value={{
        ...brainAIData,
        leagueId,
      }}
    >
      {children}
    </BrainAIContext.Provider>
  );
}

/**
 * Hook to use Brain AI context
 */
export function useBrainAIContext(): BrainAIContextType {
  const context = useContext(BrainAIContext);
  if (!context) {
    throw new Error('useBrainAIContext must be used within a BrainAIProvider');
  }
  return context;
}
