// Mirrors handoff/src/tokens/spacing.css. 4px base ("character cell").

export const spacing = {
  sp1: 4,
  sp2: 8,
  sp3: 12,
  sp4: 16,
  sp6: 24,
  sp8: 32,
  sp12: 48,
} as const;

// Shape — square everything. `radius` stays 0 outside CRTScreen level="full".
export const shape = {
  radius: 0,
  borderW: 1,
  borderDouble: 3,
  focusOffset: 3,
} as const;

export const sizing = {
  hit: 44,
  hitSm: 36,
  icon16: 16,
  icon24: 24,
  icon32: 32,
} as const;

export const layout = {
  chatMax: 760,
  sidebarW: 280,
  bpDesktop: 1024,
  messageGap: spacing.sp6,
  headerH: 56,
} as const;

// Motion — steps, not easing.
export const motion = {
  blinkDuration: 1060,
  durFast: 80,
  durBase: 120,
} as const;
