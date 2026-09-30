import { ViewStyle } from 'react-native';
import { GlowToken } from '../tokens/effects';
import { withAlpha } from './color';

/** `box-shadow` equivalent of a `--glow-*` token, for View-level glow (buttons, panels). */
export function glowShadow(token: GlowToken): ViewStyle {
  if (token.radius <= 0) return {};
  return { boxShadow: `0px 0px ${token.radius}px ${withAlpha(token.color, token.opacity)}` };
}
