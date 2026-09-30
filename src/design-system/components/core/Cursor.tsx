import React from 'react';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { motion } from '../../tokens/spacing';
import { useReducedMotion } from '../../internal/useReducedMotion';

/** Solid block cursor — trails streaming agent text and focused prompts. */
export interface CursorProps {
  /** Default true. Disabled automatically under prefers-reduced-motion. */
  blink?: boolean;
  color?: string;
}

// Rendered as a Text node (not a View) so it can sit inline inside surrounding
// streaming text, e.g. `<Text>{partial}{streaming && <Cursor />}</Text>`.
export function Cursor({ blink = true, color = colors.gold }: CursorProps) {
  const reduced = useReducedMotion();
  const animate = blink && !reduced;
  const [blinkOn, setBlinkOn] = React.useState(true);

  React.useEffect(() => {
    if (!animate) return undefined;
    const iv = setInterval(() => setBlinkOn((v) => !v), motion.blinkDuration / 2);
    return () => clearInterval(iv);
  }, [animate]);

  const visible = animate ? blinkOn : true;

  return (
    <Text
      glow="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ backgroundColor: color, opacity: visible ? 1 : 0 }}
    >
      {' '}
    </Text>
  );
}
