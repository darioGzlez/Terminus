import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, lh, lineHeight, tracking } from '../../tokens/typography';

function UserHeader({ left, right, accent }: { left: string; right?: string; accent?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sp3 }}>
      <Text
        style={{
          color: accent ? colors.textAccent : colors.textMeta,
          fontSize: fontSize.label,
          letterSpacing: em(fontSize.label, tracking.label),
          textTransform: 'uppercase',
        }}
      >
        {left}
      </Text>
      {right && (
        <Text
          style={{
            color: colors.textMeta,
            fontSize: fontSize.label,
            letterSpacing: em(fontSize.label, tracking.label),
            textTransform: 'uppercase',
          }}
        >
          {right}
        </Text>
      )}
    </View>
  );
}

/** A message written by the user: caps header + framed body. */
export interface UserMessageProps {
  /** Header label. Default "You". */
  label?: string;
  /** "14:02:11" */
  time?: string;
  children?: React.ReactNode;
  /** ImageFrame / VoiceNote rendered above the text */
  media?: React.ReactNode;
  /** Not sent yet (503 failure / offline / rate-limit queue): dashed border. */
  dashed?: boolean;
}

export function UserMessage({ label = 'You', time, children, media, dashed = false }: UserMessageProps) {
  return (
    <View style={{ flexDirection: 'column', gap: spacing.sp2 }}>
      <UserHeader left={label} right={time} />
      {media}
      {children != null && (
        <View
          style={{
            borderWidth: 1,
            borderStyle: dashed ? 'dashed' : 'solid',
            borderColor: colors.borderInput,
            backgroundColor: colors.surfacePanel,
            paddingVertical: spacing.sp3,
            paddingHorizontal: 14,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.body,
              lineHeight: lh(fontSize.body, lineHeight.body),
              color: colors.textBody,
              fontFamily: fontFamily.monoRegular,
            }}
          >
            {children}
          </Text>
        </View>
      )}
    </View>
  );
}
