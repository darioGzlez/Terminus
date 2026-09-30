import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, tracking } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

/** Inline error in the transcript or under a failed upload. */
export interface ErrorLineProps {
  /** e.g. "503" */
  code?: string;
  children: React.ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  retryGlyph?: string;
  /** Extra content on the right, e.g. a VT323 countdown for 429. */
  trailing?: React.ReactNode;
}

export function ErrorLine({ code, children, onRetry, retryLabel = 'RETRY', retryGlyph = '[↻]', trailing }: ErrorLineProps) {
  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.sp3,
        borderWidth: 1,
        borderColor: colors.statusError,
        paddingVertical: 10,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ color: colors.statusError, fontFamily: fontFamily.monoSemibold, fontSize: fontSize.small }}>!!</Text>
      <Text style={{ flex: 1, minWidth: 0, color: colors.textBody, fontFamily: fontFamily.monoRegular, fontSize: fontSize.small }}>
        {code ? `${code} · ` : ''}
        {children}
      </Text>
      {trailing}
      {onRetry && (
        <Pressable accessibilityRole="button" onPress={onRetry} style={webCursor('pointer')}>
          <Text
            style={{
              color: colors.textAccent,
              fontFamily: fontFamily.monoSemibold,
              fontSize: fontSize.small,
              letterSpacing: em(fontSize.small, tracking.button),
            }}
          >
            {retryGlyph} {retryLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
