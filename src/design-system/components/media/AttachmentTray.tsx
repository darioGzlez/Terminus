import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontSize } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

const hatchTile = require('../../assets/hatch-placeholder.png');

/** Pending photo thumbnails above the composer (max 4). */
export interface AttachmentItem {
  src?: string;
  name?: string;
}
export interface AttachmentTrayProps {
  items: AttachmentItem[];
  onRemove?: (index: number) => void;
  onAdd?: () => void;
  /** Default 4 */
  max?: number;
}

export function AttachmentTray({ items = [], onRemove, onAdd, max = 4 }: AttachmentTrayProps) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sp2, alignItems: 'flex-start' }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'column', gap: spacing.sp1 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderWidth: 1,
              borderColor: i === 0 ? colors.gold : colors.borderInput,
              overflow: 'hidden',
            }}
          >
            {it.src ? (
              <Image source={{ uri: it.src }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
            ) : (
              <Image source={hatchTile} resizeMode="repeat" style={{ width: '100%', height: '100%' }} />
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${it.name || 'photo'}`}
            onPress={() => onRemove && onRemove(i)}
            style={webCursor('pointer')}
          >
            <Text style={{ fontSize: 10, color: colors.textMeta }}>{String(i + 1).padStart(2, '0')} [x]</Text>
          </Pressable>
        </View>
      ))}
      {items.length < max && onAdd && (
        <View style={{ flexDirection: 'column', gap: spacing.sp1 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            onPress={onAdd}
            style={[
              {
                width: 64,
                height: 64,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: colors.borderInput,
                alignItems: 'center',
                justifyContent: 'center',
              },
              webCursor('pointer'),
            ]}
          >
            <Text style={{ color: colors.textAccent, fontSize: fontSize.small }}>[+]</Text>
          </Pressable>
          <Text style={{ fontSize: 10, color: colors.textMeta }}>add</Text>
        </View>
      )}
    </View>
  );
}
