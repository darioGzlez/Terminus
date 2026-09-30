import React from 'react';
import { colors, fontSize } from '../design-system';
import { Cursor } from '../design-system/components/core/Cursor';
import { Text } from '../design-system/internal/Text';
import { fontFamily } from '../design-system/tokens/typography';

/** The product name has no logo yet: `TERMINUS_` in VT323, gold, with a trailing block cursor. */
export function Wordmark({ size = fontSize.title }: { size?: number }) {
  return (
    <Text
      glow="display"
      style={{ fontFamily: fontFamily.display, fontSize: size, lineHeight: size, color: colors.gold }}
    >
      TERMINUS
      <Cursor color={colors.gold} />
    </Text>
  );
}
