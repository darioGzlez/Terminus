import React from 'react';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { em, tracking } from '../../tokens/typography';

const BLOCKS = '▁▂▃▄▅▆▇█';
const DEFAULT_SAMPLES = [
  0.1, 0.25, 0.4, 0.65, 0.9, 0.75, 0.5, 0.4, 0.25, 0.1, 0.25, 0.5, 0.75, 0.9, 0.9, 0.65, 0.4, 0.25, 0.1, 0.1, 0.25,
  0.4, 0.65, 0.75, 0.5, 0.25, 0.1, 0.25, 0.4,
];

/** Block-character waveform ▁▂▃▅▇ with played/unplayed split. */
export interface WaveformProps {
  /** Amplitudes 0–1, one per character */
  samples?: number[];
  /** 0–1 playback progress */
  progress?: number;
  playedColor?: string;
  unplayedColor?: string;
  /** font-size px. Default 16 */
  size?: number;
}

export function Waveform({
  samples = DEFAULT_SAMPLES,
  progress = 0,
  playedColor = colors.wavePlayed,
  unplayedColor = colors.waveUnplayed,
  size = 16,
}: WaveformProps) {
  const chars = samples.map((s) => BLOCKS[Math.max(0, Math.min(7, Math.floor(s * 8)))]);
  const cut = Math.round(chars.length * Math.max(0, Math.min(1, progress)));

  return (
    <Text
      numberOfLines={1}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ flex: 1, minWidth: 0, fontSize: size, letterSpacing: em(size, tracking.wave), lineHeight: size * 1.2 }}
    >
      <Text style={{ color: playedColor, fontSize: size }}>{chars.slice(0, cut).join('')}</Text>
      <Text style={{ color: unplayedColor, fontSize: size }}>{chars.slice(cut).join('')}</Text>
    </Text>
  );
}
