import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { IconButton } from '../core/IconButton';
import { Waveform } from './Waveform';
import { colors } from '../../tokens/colors';
import { motion, spacing } from '../../tokens/spacing';
import { fontFamily } from '../../tokens/typography';
import { useReducedMotion } from '../../internal/useReducedMotion';

/** Replaces the Composer while a voice note is being recorded. */
export interface RecordingBarProps {
  onCancel?: () => void;
  /** Receives elapsed seconds */
  onSend?: (seconds: number) => void;
  /** Animate timer + live wave. Default true. */
  live?: boolean;
  startedAt?: number;
}

export function RecordingBar({ onCancel, onSend, live = true, startedAt }: RecordingBarProps) {
  const reduced = useReducedMotion();
  const [t, setT] = React.useState(0);
  const [samples, setSamples] = React.useState<number[]>(() => Array.from({ length: 30 }, () => 0.1));
  const [blinkOn, setBlinkOn] = React.useState(true);

  React.useEffect(() => {
    if (!live) return;
    const start = startedAt || Date.now();
    const iv = setInterval(() => {
      setT(Math.floor((Date.now() - start) / 1000));
      setSamples((s) => [...s.slice(1), Math.min(0.95, Math.abs(Math.sin(Date.now() / 180)) * 0.6 + Math.random() * 0.4)]);
    }, 120);
    return () => clearInterval(iv);
  }, [live, startedAt]);

  React.useEffect(() => {
    if (reduced) return undefined;
    const iv = setInterval(() => setBlinkOn((v) => !v), motion.blinkDuration / 2);
    return () => clearInterval(iv);
  }, [reduced]);

  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(t % 60).padStart(2, '0');

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing.sp2,
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: colors.statusRec,
        backgroundColor: colors.surfaceApp,
      }}
    >
      <IconButton icon="close" label="Discard recording" onClick={onCancel} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp2, flexShrink: 0 }}>
        <View style={{ width: 10, height: 10, backgroundColor: colors.statusRec, opacity: blinkOn ? 1 : 0 }} />
        <Text style={{ fontFamily: fontFamily.display, fontSize: 22, color: colors.statusRec }}>
          REC {mm}:{ss}
        </Text>
      </View>
      <Waveform samples={samples} progress={1} playedColor={colors.textBody} />
      <IconButton icon="send" label="Send voice note" variant="primary" onClick={() => onSend && onSend(t)} />
    </View>
  );
}
