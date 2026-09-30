import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontFamily, fontSize, lh, lineHeight } from '../../tokens/typography';

/** Zero-state block: empty session list, new session prompt, no search results. */
export interface EmptyStateProps {
  eyebrow?: string;
  /** VT323 headline with display glow. Omit for a plain copy-only empty state. */
  title?: string;
  body?: React.ReactNode;
  /** Buttons, suggestion chips, or inline links. */
  actions?: React.ReactNode;
  titleSize?: number;
}

export function EmptyState({ eyebrow, title, body, actions, titleSize = fontSize.displayMobile }: EmptyStateProps) {
  return (
    <View style={{ gap: spacing.sp4 }}>
      {eyebrow && (
        <Text style={{ color: colors.textMeta, fontFamily: fontFamily.monoRegular, fontSize: fontSize.small }}>{eyebrow}</Text>
      )}
      {title && (
        <Text
          glow="display"
          style={{ fontFamily: fontFamily.display, fontSize: titleSize, lineHeight: titleSize, color: colors.gold }}
        >
          {title}
        </Text>
      )}
      {body && (
        <Text style={{ fontSize: fontSize.body, lineHeight: lh(fontSize.body, lineHeight.body), color: colors.textBody }}>
          {body}
        </Text>
      )}
      {actions && <View style={{ gap: spacing.sp2, marginTop: spacing.sp2 }}>{actions}</View>}
    </View>
  );
}
