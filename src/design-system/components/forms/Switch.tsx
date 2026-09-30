import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, tracking } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

/** Segmented ON|OFF toggle for settings that apply immediately. */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  onLabel?: string;
  offLabel?: string;
  disabled?: boolean;
}

export function Switch({
  checked = false,
  onChange,
  label,
  onLabel = 'ON',
  offLabel = 'OFF',
  disabled = false,
}: SwitchProps) {
  const seg = (active: boolean): ViewStyle => ({
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: active ? (checked ? colors.actionBg : colors.surfaceRaised) : 'transparent',
  });
  const segColor = (active: boolean) => (active ? (checked ? colors.actionFg : colors.textBody) : colors.textDisabled);
  const labelStyle = { fontFamily: fontFamily.monoSemibold, fontSize: fontSize.meta, letterSpacing: em(fontSize.meta, tracking.button) };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp3 }}>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked, disabled }}
        disabled={disabled}
        onPress={() => onChange && onChange(!checked)}
        style={[
          {
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: checked ? colors.gold : colors.borderInput,
            opacity: disabled ? 0.5 : 1,
          },
          webCursor(disabled ? 'not-allowed' : 'pointer'),
        ]}
      >
        <View style={seg(checked)}>
          <Text style={[labelStyle, { color: segColor(checked) }]}>{onLabel}</Text>
        </View>
        <View style={seg(!checked)}>
          <Text style={[labelStyle, { color: segColor(!checked) }]}>{offLabel}</Text>
        </View>
      </Pressable>
      {label ? <Text style={{ fontSize: fontSize.body, color: colors.textBody }}>{label}</Text> : null}
    </View>
  );
}
