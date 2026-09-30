/** Appends an 8-bit alpha channel to a `#rrggbb` hex color, e.g. withAlpha('#F4B41A', 0.4). */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
