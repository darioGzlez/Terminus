import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize } from '../../tokens/typography';

/** Centered session event divider. */
export interface SystemLineProps {
  children: React.ReactNode;
}

export function SystemLine({ children }: SystemLineProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp3 }}>
      <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: colors.borderDefault }} />
      <Text
        style={{
          fontFamily: fontFamily.monoRegular,
          fontSize: fontSize.label,
          letterSpacing: em(fontSize.label, 0.1),
          color: colors.textMeta,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Text>
      <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: colors.borderDefault }} />
    </View>
  );
}
