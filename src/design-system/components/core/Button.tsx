import React from 'react';
import { GestureResponderEvent, Pressable, ViewStyle } from 'react-native';
import { Text } from '../../internal/Text';
import { PixelIcon, PixelIconName } from './PixelIcon';
import { Spinner } from './Spinner';
import { colors } from '../../tokens/colors';
import { shape, sizing, spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, tracking } from '../../tokens/typography';
import { useCRT } from '../../internal/CRTContext';
import { glowShadow } from '../../internal/glow';
import { useInteractiveState, webCursor } from '../../internal/useInteractiveState';
import { withAlpha } from '../../internal/color';

/** Command-style button. Labels are verbs; primary/secondary/danger render in caps. */
export interface ButtonProps {
  /** primary = gold fill (one per view), secondary = gold outline, ghost = "> verb" text, danger = red outline */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** md = 44px (default, touch-safe), sm = 36px (desktop dense) */
  size?: 'md' | 'sm';
  /** ASCII glyph prefix, e.g. "[>]" */
  glyph?: string;
  /** Pixel icon prefix (overrides glyph) */
  icon?: PixelIconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  onClick?: (e: GestureResponderEvent) => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  glyph,
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  children,
}: ButtonProps) {
  const crt = useCRT();
  const { hovered, pressed, focused, handlers } = useInteractiveState();
  const h = size === 'sm' ? sizing.hitSm : sizing.hit;

  let variantStyle: ViewStyle;
  let textColor: string;
  switch (variant) {
    case 'secondary':
      variantStyle = { backgroundColor: hovered ? colors.surfaceSelected : 'transparent', borderColor: colors.gold };
      textColor = colors.textAccent;
      break;
    case 'ghost':
      variantStyle = { backgroundColor: hovered ? colors.surfaceHover : 'transparent', borderColor: 'transparent' };
      textColor = hovered ? colors.textAccent : colors.textBody;
      break;
    case 'danger':
      variantStyle = {
        backgroundColor: hovered ? withAlpha(colors.red, 0.1) : 'transparent',
        borderColor: colors.statusError,
      };
      textColor = colors.statusError;
      break;
    default:
      variantStyle = {
        backgroundColor: pressed ? colors.actionBgPressed : hovered ? colors.actionBgHover : colors.actionBg,
        borderColor: 'transparent',
        ...(hovered && !disabled ? glowShadow(crt.glowHover) : null),
      };
      textColor = colors.actionFg;
  }
  if (disabled) textColor = colors.textDisabled;

  const disabledStyle: ViewStyle | null = disabled
    ? { backgroundColor: colors.surfaceRaised, borderColor: colors.borderInput, borderStyle: 'dashed' }
    : null;

  return (
    <Pressable
      disabled={disabled}
      onPress={onClick}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...handlers}
      style={
        [
          {
            height: h,
            paddingHorizontal: variant === 'ghost' ? spacing.sp3 : spacing.sp6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sp2,
            borderRadius: shape.radius,
            borderWidth: shape.borderW,
            borderColor: 'transparent',
            width: fullWidth ? '100%' : undefined,
            transform: pressed && !disabled ? [{ translateY: 1 }] : undefined,
            ...(focused
              ? { outlineWidth: 1, outlineColor: colors.borderFocus, outlineOffset: shape.focusOffset, outlineStyle: 'solid' }
              : null),
            ...webCursor(disabled ? 'not-allowed' : 'pointer'),
          },
          variantStyle,
          disabledStyle,
        ] as ViewStyle[]
      }
    >
      {loading ? (
        <Spinner color={textColor} />
      ) : icon ? (
        <PixelIcon name={icon} size={16} color={textColor} />
      ) : glyph ? (
        <Text style={{ color: textColor, fontFamily: fontFamily.monoSemibold, fontSize: fontSize.small }}>{glyph}</Text>
      ) : null}
      {variant === 'ghost' && (
        <Text style={{ color: textColor, fontFamily: fontFamily.monoSemibold, fontSize: fontSize.small }}>{'>'}</Text>
      )}
      <Text
        style={{
          color: textColor,
          fontFamily: fontFamily.monoSemibold,
          fontSize: fontSize.small,
          letterSpacing: em(fontSize.small, tracking.button),
          textTransform: variant === 'ghost' ? 'none' : 'uppercase',
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
