import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontSize } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

const hatchTile = require('../../assets/hatch-placeholder.png');

export interface PhotoViewerPhoto {
  src?: string;
  name: string;
  bytes: number;
  w: number;
  h: number;
}

/** Full-screen photo viewer — no CRT layer, pure black backdrop. */
export interface PhotoViewerProps {
  photos: PhotoViewerPhoto[];
  index: number;
  from: 'user' | 'agent';
  time: string;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  onSave?: () => void;
  onShare?: () => void;
  onAsk?: () => void;
}

function fmtBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ActionCell({ glyph, label, onPress }: { glyph: string; label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      {...(webCursor('pointer') as any)}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sp4, borderLeftWidth: 1, borderLeftColor: colors.line }}
    >
      <Text style={{ color: colors.textBody, fontSize: fontSize.small }}>
        {glyph} {label}
      </Text>
    </Pressable>
  );
}

export function PhotoViewer({ photos, index, from, time, onClose, onIndexChange, onSave, onShare, onAsk }: PhotoViewerProps) {
  const photo = photos[index];
  const go = (delta: number) => {
    const next = Math.max(0, Math.min(photos.length - 1, index + delta));
    if (next !== index) onIndexChange?.(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.blackTrue }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.sp4 }}>
        <View>
          <Text style={{ color: from === 'agent' ? colors.textAccent : colors.textBody, fontSize: fontSize.small }}>{photo?.name}</Text>
          <Text style={{ color: colors.textMeta, fontSize: fontSize.label, marginTop: 2 }}>
            {from === 'agent' ? 'AGENT' : 'YOU'} · {time} · {photo ? fmtBytes(photo.bytes) : ''}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close viewer" onPress={onClose} {...(webCursor('pointer') as any)}>
          <Text style={{ color: colors.textBody, fontSize: fontSize.body }}>[x]</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={(e) => {
          // Left half steps back, right half steps forward.
          // @ts-expect-error RNW gives nativeEvent.offsetX on web pointer events.
          const x = e.nativeEvent.offsetX ?? e.nativeEvent.locationX;
          go(x < 200 ? -1 : 1);
        }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        {photo?.src ? (
          <Image source={{ uri: photo.src }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ width: '100%', height: '100%' }}>
            <Image source={hatchTile} resizeMode="repeat" style={{ width: '100%', height: '100%' }} />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.textMeta, fontSize: fontSize.small }}>
                [ photo {photo ? `${Math.round((photo.w / photo.h) * 10) / 10}:1` : ''} ]
              </Text>
            </View>
          </View>
        )}
      </Pressable>

      {photos.length > 1 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sp2, paddingVertical: spacing.sp3 }}>
          {photos.map((_, i) => (
            <View key={i} style={{ width: 8, height: 8, backgroundColor: i === index ? colors.gold : 'transparent', borderWidth: i === index ? 0 : 1, borderColor: colors.borderInput }} />
          ))}
          <Text style={{ color: colors.textMeta, fontSize: fontSize.label, marginLeft: spacing.sp2 }}>
            {index + 1} / {photos.length}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line }}>
        <ActionCell glyph="[↓]" label="save" onPress={onSave} />
        <ActionCell glyph="[↗]" label="share" onPress={onShare} />
        <ActionCell glyph="[>]" label="ask" onPress={onAsk} />
      </View>
    </View>
  );
}
