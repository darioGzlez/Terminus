import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { Spinner } from '../core/Spinner';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontFamily, fontSize } from '../../tokens/typography';

/** Shown between the user's send and the first streamed token. */
export interface ThinkingIndicatorProps {
  label?: string;
  /** "1.4s" */
  elapsed?: string;
}

export function ThinkingIndicator({ label = 'agent is thinking', elapsed }: ThinkingIndicatorProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp2 }}>
      <Spinner />
      <Text style={{ fontFamily: fontFamily.monoRegular, fontSize: fontSize.small, color: colors.textMeta }}>{label}</Text>
      {elapsed && (
        <Text style={{ fontFamily: fontFamily.monoRegular, fontSize: fontSize.small, color: colors.textDisabled }}>
          · {elapsed}
        </Text>
      )}
    </View>
  );
}
