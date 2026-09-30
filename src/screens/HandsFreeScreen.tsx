import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { HandsFreePanel, spacing } from '../design-system';

type VoiceState = 'listening' | 'thinking' | 'speaking' | 'paused';

const TRANSCRIPTS: Record<VoiceState, string> = {
  listening: 'what should I pack for two days in lisbon…',
  thinking: '',
  speaking: "The ridges run down the stem, which false chanterelles don't do as clearly.",
  paused: '',
};

/** Full-screen modal reproducing screenshots/app/03-hands-free.png. */
export function HandsFreeScreen() {
  const router = useRouter();
  const [state, setState] = React.useState<VoiceState>('listening');
  const [muted, setMuted] = React.useState(false);
  const [elapsedSec, setElapsedSec] = React.useState(0);

  React.useEffect(() => {
    const iv = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // Cycles listening -> thinking -> speaking to demo every VU meter state.
  React.useEffect(() => {
    if (muted) return;
    const sequence: VoiceState[] = ['listening', 'thinking', 'speaking'];
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % sequence.length;
      setState(sequence[i]);
    }, 4000);
    return () => clearInterval(iv);
  }, [muted]);

  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const ss = String(elapsedSec % 60).padStart(2, '0');

  return (
    <View style={{ flex: 1, padding: spacing.sp4, justifyContent: 'center' }}>
      <HandsFreePanel
        state={muted ? 'paused' : state}
        elapsed={`${mm}:${ss}`}
        muted={muted}
        transcript={TRANSCRIPTS[muted ? 'paused' : state]}
        onEnd={() => router.back()}
        onMute={() => setMuted((v) => !v)}
      />
    </View>
  );
}
