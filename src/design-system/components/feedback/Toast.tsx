import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontFamily, fontSize } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

/** Transient one-line confirmation. */
export interface ToastProps {
  /** ok → "OK" green, error → "!!" red, info → ">>" gold */
  kind?: 'ok' | 'error' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

const TAG: Record<NonNullable<ToastProps['kind']>, readonly [string, string]> = {
  ok: ['OK', colors.statusOk],
  error: ['!!', colors.statusError],
  info: ['>>', colors.textAccent],
};

export function Toast({ kind = 'ok', children, onClose }: ToastProps) {
  const [label, tagColor] = TAG[kind];
  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sp3,
        paddingVertical: spacing.sp3,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: kind === 'error' ? colors.statusError : colors.gold,
        backgroundColor: colors.surfaceApp,
      }}
    >
      <Text style={{ color: tagColor, fontFamily: fontFamily.monoSemibold, fontSize: fontSize.small }}>{label}</Text>
      <Text style={{ flex: 1, minWidth: 0, color: colors.textBody, fontFamily: fontFamily.monoRegular, fontSize: fontSize.small }}>
        {children}
      </Text>
      {onClose && (
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" onPress={onClose} style={webCursor('pointer')}>
          <Text style={{ color: colors.textAccent, fontFamily: fontFamily.monoRegular, fontSize: fontSize.small }}>[x]</Text>
        </Pressable>
      )}
    </View>
  );
}
