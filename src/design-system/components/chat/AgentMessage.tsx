import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { Cursor } from '../core/Cursor';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, lh, lineHeight, tracking } from '../../tokens/typography';

function AgentHeader({ left, right, accent }: { left: string; right?: string; accent?: boolean }) {
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

/** A message written by the agent: gold "● AGENT" header, unframed body. */
export interface AgentMessageProps {
  label?: string;
  time?: string;
  /** Appends a blinking block cursor and replaces the time with "streaming". */
  streaming?: boolean;
  children?: React.ReactNode;
  /** ImageFrame / VoiceNote under the text */
  media?: React.ReactNode;
  /** Usually <MessageActions />; hidden while streaming */
  actions?: React.ReactNode;
}

export function AgentMessage({ label = 'Agent', time, streaming = false, children, media, actions }: AgentMessageProps) {
  return (
    <View style={{ flexDirection: 'column', gap: spacing.sp2 }}>
      <AgentHeader left={`● ${label}`} right={streaming ? 'streaming' : time} accent />
      {children != null && (
        <Text
          style={{
            fontSize: fontSize.body,
            lineHeight: lh(fontSize.body, lineHeight.body),
            color: colors.textBody,
            fontFamily: fontFamily.monoRegular,
          }}
        >
          {children}
          {streaming && <Cursor />}
        </Text>
      )}
      {media}
      {actions && !streaming && <View style={{ marginLeft: -8 }}>{actions}</View>}
    </View>
  );
}
