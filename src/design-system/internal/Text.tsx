import React from 'react';
import { Platform, Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useCRT } from './CRTContext';
import { withAlpha } from './color';
import { colors } from '../tokens/colors';
import { fontFamily } from '../tokens/typography';

export type GlowVariant = 'text' | 'display' | 'none';

export interface TextProps extends RNTextProps {
  /**
   * 'text' (default) = subtle body glow every glyph gets under CRTScreen, matching the
   * reference's inherited `text-shadow: var(--glow-text)`. 'display' = the stronger
   * VT323 glow (wordmark, HANDS-FREE state word). 'none' opts out.
   */
  glow?: GlowVariant;
}

/**
 * Base text primitive used by every design-system component instead of RN's `Text`.
 * Centralizes the CRT-level-driven glow so individual components never read the CRT
 * level themselves — same contract as the CSS original, where glow flows from a single
 * `[data-crt]` ancestor via inheritance.
 */
export function Text({ glow = 'text', style, ...rest }: TextProps) {
  const crt = useCRT();
  const token = glow === 'none' ? null : glow === 'display' ? crt.glowDisplay : crt.glowText;
  // react-native-web prefers the unified CSS-syntax `textShadow` string and warns on the
  // fragmented props; core React Native's Text style has no such prop, so native keeps
  // the fragmented form (the only one it understands) and web gets the string form.
  const glowStyle =
    token && token.radius > 0
      ? Platform.OS === 'web'
        ? { textShadow: `0px 0px ${token.radius}px ${withAlpha(token.color, token.opacity)}` }
        : {
            textShadowColor: withAlpha(token.color, token.opacity),
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: token.radius,
          }
      : null;
  return <RNText {...rest} style={[styles.base, glowStyle, style]} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontFamily.monoRegular,
    color: colors.textBody,
  },
});
