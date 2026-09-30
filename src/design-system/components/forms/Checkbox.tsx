import React from 'react';
import { Pressable } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { sizing, spacing } from '../../tokens/spacing';
import { fontFamily, fontSize } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

/** Bracket checkbox — [x] / [ ] — for independent on/off options in lists and settings. */
export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
}

export function Checkbox({ checked = false, onChange, label, disabled = false }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange && onChange(!checked)}
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: spacing.sp3, minHeight: sizing.hitSm },
        webCursor(disabled ? 'not-allowed' : 'pointer'),
      ]}
    >
      <Text
        style={{
          color: disabled ? colors.textDisabled : checked ? colors.textAccent : colors.textMeta,
          fontFamily: fontFamily.monoRegular,
          fontSize: fontSize.body,
        }}
      >
        {checked ? '[x]' : '[ ]'}
      </Text>
      {label ? (
        <Text
          style={{
            color: disabled ? colors.textDisabled : checked ? colors.textBody : colors.textMeta,
            fontFamily: fontFamily.monoRegular,
            fontSize: fontSize.body,
          }}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
