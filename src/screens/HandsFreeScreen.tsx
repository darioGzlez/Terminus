import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../design-system/internal/Text';
import { Cursor } from '../design-system/components/core/Cursor';
import { colors, em, fontFamily, fontSize, spacing, tracking } from '../design-system';
import { webCursor } from '../design-system/internal/useInteractiveState';
import { useSessionsStore } from '../state/SessionsContext';

type Phase = 'listen' | 'think' | 'speak';

const TITLES: Record<Phase, string> = { listen: 'LISTENING_', think: 'THINKING_', speak: 'SPEAKING_' };
const TABS: { key: Phase; label: string }[] = [
  { key: 'listen', label: 'LISTEN' },
  { key: 'think', label: 'THINK' },
  { key: 'speak', label: 'SPEAK' },
];
const LIVE_TRANSCRIPT = 'and what about the limescale around the tap…';
const SPOKEN_REPLY = "The ridges run down the stem, which false chanterelles don't do as clearly.";

const BAR_COUNT = 22;
const GAP_INDEX = [10, 11]; // splits the meter into two clusters, matching the reference silhouette.

function Meter({ phase, muted }: { phase: Phase; muted: boolean }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    const iv = setInterval(() => setT((n) => n + 1), 140);
    return () => clearInterval(iv);
  }, []);

  const color = phase === 'speak' ? colors.meterSpeaking : colors.meterListening;
  const maxH = 96;

  const level = (i: number) => {
    if (GAP_INDEX.includes(i)) return 0;
    if (muted || phase === 'think') return 4;
    const wave = Math.abs(Math.sin(i * 0.6 + t * 0.35)) * 0.6 + Math.abs(Math.cos(i * 0.31 - t * 0.22)) * 0.4;
    return Math.round(8 + wave * (maxH - 8));
  };

  return (
    <View style={{ height: maxH, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <View key={i} style={{ flex: 1, height: level(i), backgroundColor: color }} />
      ))}
    </View>
  );
}

function BigButton({ glyph, label, onPress }: { glyph: string; label: string; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      {...(webCursor('pointer') as any)}
      style={{
        flex: 1,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.gold,
      }}
    >
      <Text style={{ color: colors.textAccent, fontFamily: fontFamily.monoSemibold, fontSize: fontSize.small, letterSpacing: em(fontSize.small, tracking.button) }}>
        {glyph} {label}
      </Text>
    </Pressable>
  );
}

export interface HandsFreeScreenProps {
  sessionId: string;
}

export function HandsFreeScreen({ sessionId }: HandsFreeScreenProps) {
  const router = useRouter();
  const store = useSessionsStore();
  const session = store.state.sessions[sessionId];

  const [phase, setPhase] = React.useState<Phase>('listen');
  const [muted, setMuted] = React.useState(false);

  React.useEffect(() => {
    if (muted) return;
    const sequence: Phase[] = ['listen', 'think', 'speak'];
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % sequence.length;
      setPhase(sequence[i]);
    }, 4200);
    return () => clearInterval(iv);
  }, [muted]);

  const title = muted ? 'MUTED_' : TITLES[phase];
  const transcript = muted ? undefined : phase === 'listen' ? LIVE_TRANSCRIPT : phase === 'speak' ? SPOKEN_REPLY : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceApp }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: spacing.sp4,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderDefault,
        }}
      >
        <View>
          <Text style={{ color: colors.textAccent, fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label), textTransform: 'uppercase' }}>
            HANDS-FREE
          </Text>
          <Text style={{ color: colors.textMeta, fontSize: fontSize.small, marginTop: 2 }}>
            {session?.title ?? 'New session'} · {sessionId}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close hands-free mode" onPress={() => router.push(`/s/${sessionId}`)} {...(webCursor('pointer') as any)}>
          <Text style={{ color: colors.textBody, fontSize: fontSize.body }}>[x]</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {TABS.map((tab) => {
          const active = !muted && tab.key === phase;
          return (
            <View
              key={tab.key}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 44, backgroundColor: active ? colors.actionBg : 'transparent' }}
            >
              <Text
                style={{
                  color: active ? colors.actionFg : colors.textMeta,
                  fontFamily: fontFamily.monoSemibold,
                  fontSize: fontSize.small,
                  letterSpacing: em(fontSize.small, tracking.button),
                }}
              >
                {tab.label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ flex: 1, padding: spacing.sp4, justifyContent: 'center', gap: spacing.sp6 }}>
        <View style={{ gap: spacing.sp6 }}>
          <Text glow="display" style={{ fontFamily: fontFamily.display, fontSize: fontSize.display, lineHeight: fontSize.display, color: muted ? colors.textDisabled : colors.gold }}>
            {title}
          </Text>

          <Meter phase={phase} muted={muted} />

          <View style={{ minHeight: 56 }}>
            {transcript ? (
              <Text style={{ fontSize: 17, lineHeight: 17 * 1.5, color: colors.textBody }}>
                <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>{phase === 'listen' ? 'YOU · LIVE\n' : '● AGENT\n'}</Text>
                {transcript}
                {phase === 'listen' && <Cursor />}
              </Text>
            ) : (
              muted && (
                <Text style={{ color: colors.statusRec, fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label) }}>
                  MIC MUTED
                </Text>
              )
            )}
          </View>
        </View>
      </View>

      <View style={{ padding: spacing.sp4, gap: spacing.sp3 }}>
        <Text style={{ textAlign: 'center', color: colors.textMeta, fontSize: fontSize.small }}>
          PAUSE TO SEND · TALK OVER THE AGENT TO INTERRUPT
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sp3 }}>
          <BigButton glyph={muted ? '[▶]' : '[‖]'} label="MUTE" onPress={() => setMuted((m) => !m)} />
          <BigButton glyph="[■]" label="END" onPress={() => router.push(`/s/${sessionId}`)} />
        </View>
      </View>
    </View>
  );
}
