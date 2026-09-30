import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontFamily, fontSize } from '../../tokens/typography';

/** Block-character progress bar: [██████░░░░] 58%. */
export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** Number of character cells. Default 17. */
  cells?: number;
  showPercent?: boolean;
  color?: string;
}

export function ProgressBar({ value = 0, cells = 17, showPercent = true, color = colors.gold }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value));
  const n = Math.round((v / 100) * cells);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: v }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp2 }}
    >
      <Text style={{ color, fontFamily: fontFamily.monoRegular, fontSize: fontSize.small }}>
        {'['}
        {'█'.repeat(n)}
        {'░'.repeat(cells - n)}
        {']'}
      </Text>
      {showPercent && (
        <Text style={{ color: colors.textBody, fontFamily: fontFamily.monoRegular, fontSize: fontSize.small }}>
          {Math.round(v)}%
        </Text>
      )}
    </View>
  );
}
