// Mirrors handoff/src/tokens/typography.css + fonts.css.
// RN loads exact-weight font files (via @expo-google-fonts) instead of `font-weight`,
// so `fontFamily` below always resolves to the specific weight/style already baked in.

export const fontFamily = {
  monoRegular: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemibold: 'IBMPlexMono_600SemiBold',
  monoItalic: 'IBMPlexMono_400Regular_Italic',
  display: 'VT323_400Regular',
} as const;

// Fallback family used until Google Fonts finish loading (avoids invisible text).
export const fontFamilyFallback = {
  monoRegular: 'System',
  monoMedium: 'System',
  monoSemibold: 'System',
  monoItalic: 'System',
  display: 'System',
} as const;

export const fontSize = {
  // Display (VT323) — never below 20.
  display: 64,
  displayMobile: 48,
  title: 36,
  titleMobile: 28,
  timer: 20,
  // UI (Plex Mono)
  heading: 18,
  body: 15,
  small: 13,
  meta: 12,
  label: 11,
} as const;

// CSS unitless line-height multipliers. RN wants an absolute number, so callers do
// `fontSize * lineHeight.body` etc. `tight` (1) needs no multiplication.
export const lineHeight = {
  tight: 1,
  heading: 1.45,
  body: 1.6,
  meta: 1.35,
} as const;

// CSS letter-spacing in `em`. RN wants points, so callers do `fontSize * tracking.label`.
export const tracking = {
  label: 0.14,
  button: 0.08,
  wave: -0.04,
} as const;

/** fontSize * lineHeight multiplier -> absolute RN lineHeight. */
export function lh(size: number, multiplier: number): number {
  return Math.round(size * multiplier * 100) / 100;
}

/** fontSize * em tracking -> absolute RN letterSpacing. */
export function em(size: number, trackingEm: number): number {
  return Math.round(size * trackingEm * 100) / 100;
}
