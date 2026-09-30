import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { Button } from '../core/Button';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, lh, lineHeight, tracking } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

export interface DeleteConfirmSheetProps {
  visible: boolean;
  sessionId: string;
  title: string;
  messageCount: number;
  voiceCount: number;
  /** Mobile = bottom sheet with veil. Desktop = centered modal card. */
  centered?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmSheet({
  visible,
  sessionId,
  title,
  messageCount,
  voiceCount,
  centered = false,
  onCancel,
  onConfirm,
}: DeleteConfirmSheetProps) {
  if (!visible) return null;

  const card = (
    <View
      style={{
        backgroundColor: colors.surfaceApp,
        borderTopWidth: centered ? 0 : 2,
        borderTopColor: colors.statusError,
        borderWidth: centered ? 1 : 0,
        borderColor: colors.statusError,
        padding: spacing.sp4,
        gap: spacing.sp3,
        width: centered ? 420 : undefined,
      }}
    >
      <Text
        style={{
          color: colors.statusError,
          fontFamily: fontFamily.monoSemibold,
          fontSize: fontSize.small,
          letterSpacing: em(fontSize.small, tracking.label),
        }}
      >
        !! DELETE SESSION {sessionId}
      </Text>
      <Text style={{ color: colors.textBody, fontFamily: fontFamily.monoRegular, fontSize: 28 }}>{title}</Text>
      <Text style={{ color: colors.textMeta, fontSize: fontSize.body, lineHeight: lh(fontSize.body, lineHeight.body) }}>
        {messageCount} message{messageCount === 1 ? '' : 's'}
        {voiceCount > 0 ? ` and ${voiceCount} voice note${voiceCount === 1 ? '' : 's'}` : ''} will be removed from this
        device. This cannot be undone after 10 seconds.
      </Text>
      <Button variant="danger" glyph="[x]" fullWidth onClick={onConfirm}>
        DELETE
      </Button>
      <Pressable onPress={onCancel} {...(webCursor('pointer') as any)} style={{ alignItems: 'center', paddingVertical: spacing.sp2 }}>
        <Text style={{ color: colors.textBody, fontSize: fontSize.small }}>{'>'} keep it</Text>
      </Pressable>
    </View>
  );

  if (centered) {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 70, alignItems: 'center', justifyContent: 'center' }}>
        <Pressable onPress={onCancel} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,10,7,0.86)' }} />
        {card}
      </View>
    );
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 70 }}>
      <Pressable onPress={onCancel} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,10,7,0.86)' }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>{card}</View>
    </View>
  );
}
