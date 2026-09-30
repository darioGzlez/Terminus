import React from 'react';
import { GestureResponderEvent, Pressable, ViewStyle } from 'react-native';
import { PixelIcon, PixelIconName } from './PixelIcon';
import { colors } from '../../tokens/colors';
import { shape, sizing } from '../../tokens/spacing';
import { useCRT } from '../../internal/CRTContext';
import { glowShadow } from '../../internal/glow';
import { useInteractiveState, webCursor } from '../../internal/useInteractiveState';

/** Square 44px (or 36px) button holding a single pixel icon. */
export interface IconButtonProps {
  icon: PixelIconName;
  /** Required accessible label */
  label: string;
  /** primary = gold fill, outline = line.strong frame, ghost = no frame, rec = red fill (recording only) */
  variant?: 'primary' | 'outline' | 'ghost' | 'rec';
  size?: 'md' | 'sm';
  /** Renders as primary (e.g. mic toggled on) */
  active?: boolean;
  disabled?: boolean;
  onClick?: (e: GestureResponderEvent) => void;
  /** Press-and-hold support (push-to-talk mic). Fired alongside onClick's own press lifecycle. */
  onPressIn?: (e: GestureResponderEvent) => void;
  onPressOut?: (e: GestureResponderEvent) => void;
}

export function IconButton({
  icon,
  label,
  variant = 'outline',
  size = 'md',
  active = false,
  disabled = false,
  onClick,
  onPressIn,
  onPressOut,
}: IconButtonProps) {
  const crt = useCRT();
  const { hovered, handlers } = useInteractiveState();
  const s = size === 'sm' ? sizing.hitSm : sizing.hit;
  const primary = variant === 'primary' || active;

  const backgroundColor = disabled
    ? colors.surfaceRaised
    : primary
      ? hovered
        ? colors.actionBgHover
        : colors.actionBg
      : variant === 'rec'
        ? colors.statusRec
        : hovered
          ? colors.surfaceHover
          : 'transparent';

  const borderColor =
    variant === 'ghost' || primary || variant === 'rec'
      ? 'transparent'
      : hovered
        ? colors.borderFocus
        : colors.borderInput;

  const iconColor = disabled ? colors.textDisabled : primary || variant === 'rec' ? colors.actionFg : colors.textAccent;

  return (
    <Pressable
      disabled={disabled}
      onPress={onClick}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      {...handlers}
      onPressIn={(e) => {
        handlers.onPressIn(e);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        handlers.onPressOut(e);
        onPressOut?.(e);
      }}
      style={
        [
          {
            width: s,
            height: s,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
            borderWidth: shape.borderW,
            borderColor,
            borderRadius: shape.radius,
            ...webCursor(disabled ? 'not-allowed' : 'pointer'),
          },
          primary && !disabled ? glowShadow(crt.glowPrimary) : null,
        ] as ViewStyle[]
      }
    >
      <PixelIcon name={icon} size={16} color={iconColor} />
    </Pressable>
  );
}
