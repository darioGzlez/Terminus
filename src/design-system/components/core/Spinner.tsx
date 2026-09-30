import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontFamily } from '../../tokens/typography';

/** Classic |/-\ ASCII spinner for indeterminate work. */
export interface SpinnerProps {
  label?: string;
  color?: string;
  /** ms per frame. Default 150. */
  speed?: number;
}

const FRAMES = ['|', '/', '-', '\\'];

export function Spinner({ label, color = colors.gold, speed = 150 }: SpinnerProps) {
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % 4), speed);
    return () => clearInterval(t);
  }, [speed]);

  return (
    <View
      accessibilityLabel={label ?? 'loading'}
      accessibilityLiveRegion="polite"
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp2 }}
    >
      <Text style={{ color, fontFamily: fontFamily.monoRegular }}>{FRAMES[i]}</Text>
      {label ? <Text style={{ color: colors.textMeta, fontFamily: fontFamily.monoRegular }}>{label}</Text> : null}
    </View>
  );
}
