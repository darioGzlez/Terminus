import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontFamily, fontSize } from '../../tokens/typography';
import { useInteractiveState, webCursor } from '../../internal/useInteractiveState';

export interface MessageAction {
  glyph: string;
  label: string;
  onClick?: () => void;
  /** Forces gold text even when not hovered, e.g. "continue" after a stop. */
  accent?: boolean;
}

function Action({ glyph, label, onClick, accent }: MessageAction) {
  const { hovered, handlers } = useInteractiveState();
  return (
    <Pressable
      onPress={onClick}
      {...handlers}
      style={[
        { paddingVertical: 6, paddingHorizontal: 8, backgroundColor: hovered ? colors.surfaceHover : 'transparent' },
        webCursor('pointer'),
      ]}
    >
      <Text style={{ fontFamily: fontFamily.monoRegular, fontSize: fontSize.meta, color: hovered || accent ? colors.textAccent : colors.textMeta }}>
        {glyph} {label}
      </Text>
    </Pressable>
  );
}

/** Row of ASCII-glyph text actions under a message. */
export interface MessageActionsProps {
  /** Default: copy, play, retry */
  actions?: MessageAction[];
}

export function MessageActions({ actions }: MessageActionsProps) {
  const list = actions || [
    { glyph: '[⧉]', label: 'copy' },
    { glyph: '[▶]', label: 'play' },
    { glyph: '[↻]', label: 'retry' },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sp1, flexWrap: 'wrap' }}>
      {list.map((a, i) => (
        <Action key={i} {...a} />
      ))}
    </View>
  );
}
