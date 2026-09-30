import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { Button } from '../core/Button';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, lh, lineHeight, tracking } from '../../tokens/typography';

const LABELS = { listening: 'LISTENING', thinking: 'THINKING', speaking: 'SPEAKING', paused: 'PAUSED' } as const;
const FRAMES = ['|', '/', '-', '\\'];
const METER_HEIGHT = 120;
const SEGMENT_H = 4;
const SEGMENT_GAP = 2;

function MeterBar({ heightPct, color }: { heightPct: number; color: string }) {
  const totalHeight = METER_HEIGHT * (Math.max(0, Math.min(100, heightPct)) / 100);
  const count = Math.max(0, Math.floor(totalHeight / (SEGMENT_H + SEGMENT_GAP)));
  return (
    <View style={{ flex: 1, height: '100%', justifyContent: 'flex-end', gap: SEGMENT_GAP }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ height: SEGMENT_H, backgroundColor: color }} />
      ))}
    </View>
  );
}

/**
 * Continuous hands-free voice conversation panel with phosphor VU meter.
 */
export interface HandsFreePanelProps {
  /** listening: ink meter from mic · thinking: flat + spinner · speaking: gold meter from agent audio · paused: meter hidden */
  state?: 'listening' | 'thinking' | 'speaking' | 'paused';
  /** "04:12" */
  elapsed?: string;
  muted?: boolean;
  onEnd?: () => void;
  onMute?: () => void;
  /** Live transcript of the current utterance */
  transcript?: React.ReactNode;
  /** Meter columns. Default 28 */
  bars?: number;
}

export function HandsFreePanel({
  state = 'listening',
  elapsed = '00:00',
  muted = false,
  onEnd,
  onMute,
  transcript,
  bars = 28,
}: HandsFreePanelProps) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const iv = setInterval(() => setT((n) => n + 1), 140);
    return () => clearInterval(iv);
  }, []);

  const color = state === 'speaking' ? colors.meterSpeaking : colors.meterListening;
  const level = (i: number) => {
    if (state === 'thinking') return 4;
    if (state === 'paused' || (state === 'listening' && muted)) return 2;
    const x = Math.sin(i * 12.9898 + t * 78.233) * 43758.5453;
    return Math.round(
      6 +
        (Math.abs(Math.sin(i * 0.55 + t * 0.45) * Math.sin(i * 0.21 - t * 0.3)) * 0.8 + (x - Math.floor(x)) * 0.2) *
          90,
    );
  };

  return (
    // Double gold border approximation: RN has no `border-style: double`, so two
    // concentric 1px gold frames with a 2px gap stand in for the 3px double rule.
    <View style={{ borderWidth: 1, borderColor: colors.gold, padding: 2 }}>
      <View style={{ borderWidth: 1, borderColor: colors.gold }}>
        <View style={{ flexDirection: 'column', gap: spacing.sp6, padding: spacing.sp8, backgroundColor: colors.surfaceApp }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label), color: colors.textMeta }}>
              HANDS-FREE MODE
            </Text>
            <Text style={{ fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label), color: colors.textMeta }}>
              {elapsed} ELAPSED
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14 }}>
            <Text
              glow="display"
              accessibilityLiveRegion="polite"
              style={{
                fontFamily: fontFamily.display,
                fontSize: fontSize.display,
                lineHeight: fontSize.display,
                color: state === 'paused' ? colors.textMeta : color,
              }}
            >
              {LABELS[state]}
            </Text>
            {state === 'thinking' && (
              <Text style={{ fontFamily: fontFamily.display, fontSize: 40, color: colors.gold }}>{FRAMES[t % 4]}</Text>
            )}
            {muted && (
              <Text style={{ fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label), color: colors.statusRec }}>
                MIC MUTED
              </Text>
            )}
          </View>

          <View
            style={{
              height: METER_HEIGHT,
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 4,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderInput,
              opacity: state === 'paused' ? 0 : 1,
            }}
          >
            {Array.from({ length: bars }, (_, i) => (
              <MeterBar key={i} heightPct={level(i)} color={color} />
            ))}
          </View>

          {transcript && (
            <Text style={{ fontSize: fontSize.body, lineHeight: lh(fontSize.body, lineHeight.body), color: colors.textBody, minHeight: 48 }}>
              {transcript}
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button glyph="[■]" onClick={onEnd}>
              End session
            </Button>
            <Button variant="secondary" onClick={onMute}>
              {muted ? 'Unmute mic' : 'Mute mic'}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
