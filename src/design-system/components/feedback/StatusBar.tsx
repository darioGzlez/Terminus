import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, tracking } from '../../tokens/typography';

/** Inverted gold status line — desktop footer of the chat window. */
export interface StatusBarProps {
  /** Short caps segments, spread edge to edge. */
  items: React.ReactNode[];
}

export function StatusBar({ items = [] }: StatusBarProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sp3,
        paddingVertical: 6,
        paddingHorizontal: spacing.sp3,
        backgroundColor: colors.actionBg,
      }}
    >
      {items.map((it, i) => (
        <Text
          key={i}
          numberOfLines={1}
          style={{
            color: colors.actionFg,
            fontFamily: fontFamily.monoSemibold,
            fontSize: fontSize.label,
            letterSpacing: em(fontSize.label, tracking.button),
            textTransform: 'uppercase',
          }}
        >
          {it}
        </Text>
      ))}
    </View>
  );
}
