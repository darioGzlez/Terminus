import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, lh, lineHeight, tracking } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

/** Code or command output inside an agent message. */
export interface CodeBlockProps {
  language?: string;
  code: string;
  onCopy?: () => void;
}

export function CodeBlock({ language = 'shell', code, onCopy }: CodeBlockProps) {
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      return;
    }
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
  };

  return (
    <View style={{ flexDirection: 'column', borderWidth: 1, borderColor: colors.borderDefault }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 6,
          paddingHorizontal: spacing.sp3,
          backgroundColor: colors.surfacePanel,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderDefault,
        }}
      >
        <Text
          style={{
            fontSize: fontSize.label,
            letterSpacing: em(fontSize.label, tracking.button),
            color: colors.textMeta,
            fontFamily: fontFamily.monoRegular,
          }}
        >
          ── {language} ──
        </Text>
        <Pressable onPress={handleCopy} style={webCursor('pointer')}>
          <Text style={{ color: colors.textAccent, fontFamily: fontFamily.monoRegular, fontSize: fontSize.label }}>
            [⧉] copy
          </Text>
        </Pressable>
      </View>
      <View style={{ paddingVertical: spacing.sp3, paddingHorizontal: 14 }}>
        <Text
          style={{
            fontSize: fontSize.small,
            lineHeight: lh(fontSize.small, lineHeight.body),
            color: colors.textCode,
            fontFamily: fontFamily.monoRegular,
          }}
        >
          {code}
        </Text>
      </View>
    </View>
  );
}
