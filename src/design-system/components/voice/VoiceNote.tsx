import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { PixelIcon } from '../core/PixelIcon';
import { Waveform } from './Waveform';
import { colors } from '../../tokens/colors';
import { sizing, spacing } from '../../tokens/spacing';
import { fontFamily, fontSize, lh, lineHeight } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

/** Playable audio message — user voice notes (framed) and agent spoken replies (unframed, gold button). */
export interface VoiceNoteProps {
  from?: 'user' | 'agent';
  /** "0:12" */
  duration?: string;
  /** Current position while playing, e.g. "0:06" → renders "0:06/0:12" */
  position?: string;
  samples?: number[];
  /** 0–1 */
  progress?: number;
  playing?: boolean;
  onToggle?: () => void;
  /** Collapsible transcript text — always provide one for accessibility */
  transcript?: React.ReactNode;
  defaultOpen?: boolean;
}

export function VoiceNote({
  from = 'user',
  duration = '0:12',
  position,
  samples,
  progress = 0,
  playing = false,
  onToggle,
  transcript,
  defaultOpen = false,
}: VoiceNoteProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const agent = from === 'agent';

  return (
    <View style={{ flexDirection: 'column', gap: spacing.sp2 }}>
      <View
        style={[
          { flexDirection: 'row', alignItems: 'center', gap: spacing.sp3 },
          agent
            ? { paddingVertical: 4 }
            : {
                borderWidth: 1,
                borderColor: colors.borderInput,
                backgroundColor: colors.surfacePanel,
                paddingVertical: 10,
                paddingHorizontal: spacing.sp3,
              },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Stop' : 'Play'}
          onPress={onToggle}
          style={[
            {
              width: sizing.hitSm,
              height: sizing.hitSm,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: playing || agent ? colors.actionBg : 'transparent',
              borderWidth: 1,
              borderColor: playing || agent ? 'transparent' : colors.gold,
            },
            webCursor('pointer'),
          ]}
        >
          <PixelIcon name={playing ? 'stop' : 'play'} size={16} color={playing || agent ? colors.actionFg : colors.gold} />
        </Pressable>
        <Waveform samples={samples} progress={progress} />
        <Text style={{ fontFamily: fontFamily.display, fontSize: fontSize.timer, color: colors.textBody }}>
          {position ? (
            <>
              {position}
              <Text style={{ color: colors.textDisabled, fontFamily: fontFamily.display, fontSize: fontSize.timer }}>
                /{duration}
              </Text>
            </>
          ) : (
            duration
          )}
        </Text>
      </View>
      {transcript && (
        <View style={{ flexDirection: 'column', gap: spacing.sp2 }}>
          <Pressable onPress={() => setOpen(!open)} style={webCursor('pointer')}>
            <Text style={{ fontFamily: fontFamily.monoRegular, fontSize: fontSize.meta, color: colors.textMeta }}>
              {open ? 'v' : '>'} transcript
            </Text>
          </Pressable>
          {open && (
            <Text
              style={{
                fontSize: fontSize.small,
                lineHeight: lh(fontSize.small, lineHeight.body),
                color: colors.textMeta,
                paddingLeft: spacing.sp4,
              }}
            >
              {transcript}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
