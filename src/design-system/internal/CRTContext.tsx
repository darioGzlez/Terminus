import React from 'react';
import { CRTLevel, CRTLevelTokens, crtLevels } from '../tokens/effects';

const CRTContext = React.createContext<CRTLevelTokens>(crtLevels.standard);

export function CRTLevelProvider({
  level,
  children,
}: {
  level: CRTLevel;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => crtLevels[level], [level]);
  return <CRTContext.Provider value={value}>{children}</CRTContext.Provider>;
}

/** Resolved glow/scanline tokens for the nearest ancestor `<CRTScreen level=…>`. */
export function useCRT(): CRTLevelTokens {
  return React.useContext(CRTContext);
}
