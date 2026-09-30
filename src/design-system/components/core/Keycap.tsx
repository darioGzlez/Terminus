import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { fontFamily, fontSize, lh } from '../../tokens/typography';

/** Keyboard key hint for desktop shortcuts. */
export interface KeycapProps {
  children: React.ReactNode;
}

export function Keycap({ children }: KeycapProps) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingTop: 2,
        paddingBottom: 2,
        borderWidth: 1,
        borderBottomWidth: 3,
        borderColor: colors.borderInput,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontFamily: fontFamily.monoRegular,
          fontSize: fontSize.meta,
          lineHeight: lh(fontSize.meta, 1.4),
          color: colors.textBody,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
