// Mirrors handoff/src/tokens/effects.css. CRT intensity levels drive glow + scanlines.
// In the reference CSS these cascade via `[data-crt]`; in RN there is no cascade, so
// `CRTContext` (internal/CRTContext.tsx) provides the active level and every glow is
// resolved through `internal/Text.tsx` or read via `useCRT()` where a shadow is needed.

export type CRTLevel = 'subtle' | 'standard' | 'full';

export interface GlowToken {
  /** RN shadow/textShadow radius in px. 0 disables the effect entirely. */
  radius: number;
  /** Opaque gold shadow color; alpha folded into `opacity`. */
  color: string;
  opacity: number;
}

export interface CRTLevelTokens {
  scanlineOpacity: number;
  glowText: GlowToken;
  glowDisplay: GlowToken;
  glowPrimary: GlowToken;
  glowHover: GlowToken;
}

const GOLD = '#F4B41A';

const off: GlowToken = { radius: 0, color: GOLD, opacity: 0 };

export const crtLevels: Record<CRTLevel, CRTLevelTokens> = {
  subtle: {
    scanlineOpacity: 0,
    glowText: off,
    glowDisplay: off,
    glowPrimary: off,
    glowHover: off,
  },
  standard: {
    scanlineOpacity: 0.18,
    glowText: { radius: 3, color: GOLD, opacity: 0.3 },
    glowDisplay: { radius: 8, color: GOLD, opacity: 0.55 },
    glowPrimary: { radius: 12, color: GOLD, opacity: 0.4 },
    glowHover: { radius: 14, color: GOLD, opacity: 0.45 },
  },
  full: {
    scanlineOpacity: 0.35,
    glowText: { radius: 6, color: GOLD, opacity: 0.6 },
    glowDisplay: { radius: 12, color: GOLD, opacity: 0.8 },
    glowPrimary: { radius: 18, color: GOLD, opacity: 0.7 },
    glowHover: { radius: 20, color: GOLD, opacity: 0.7 },
  },
};
