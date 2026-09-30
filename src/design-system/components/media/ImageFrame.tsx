import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontSize, lh, lineHeight } from '../../tokens/typography';
import { webCursor } from '../../internal/useInteractiveState';

const hatchTile = require('../../assets/hatch-placeholder.png');

/**
 * Photo with terminal file header. Uploading shows a top-down, line-by-line reveal.
 */
export interface ImageFrameProps {
  src?: string;
  alt?: string;
  /** "IMG_0142.JPG" */
  filename?: string;
  /** "2.4 MB · 4032×3024" */
  meta?: string;
  caption?: React.ReactNode;
  /** agent → gold frame + gold filename */
  from?: 'user' | 'agent';
  /** 0–100 while uploading/receiving; omit or 100 when done */
  progress?: number;
  onCancel?: () => void;
  onOpen?: () => void;
  /** Image area height px. Default 220 */
  height?: number;
  /** 413-style failure: dashed red border. `errorSlot` renders the ErrorLine/action below. */
  error?: boolean;
  errorSlot?: React.ReactNode;
}

export function ImageFrame({
  src,
  alt = '',
  filename,
  meta,
  caption,
  from = 'user',
  progress,
  onCancel,
  onOpen,
  height = 220,
  error = false,
  errorSlot,
}: ImageFrameProps) {
  const agent = from === 'agent';
  const edge = error ? colors.statusError : agent ? colors.gold : colors.borderInput;
  const uploading = typeof progress === 'number' && progress < 100;
  const cells = 10;
  const n = Math.round(((progress || 0) / 100) * cells);

  return (
    <View style={{ borderWidth: 1, borderStyle: error ? 'dashed' : 'solid', borderColor: edge, backgroundColor: agent ? 'transparent' : colors.surfacePanel }}>
      {(filename || meta) && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: spacing.sp2,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderBottomWidth: 1,
            borderStyle: error ? 'dashed' : 'solid',
            borderBottomColor: edge,
          }}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ flexShrink: 1, color: error ? colors.statusError : agent ? colors.textAccent : colors.textBody, fontSize: fontSize.label }}
          >
            {filename}
          </Text>
          <Text numberOfLines={1} style={{ color: error ? colors.statusError : colors.textMeta, fontSize: fontSize.label }}>
            {meta}
          </Text>
        </View>
      )}

      <Pressable onPress={onOpen} disabled={!onOpen} style={onOpen ? webCursor('pointer') : undefined}>
        <View style={{ position: 'relative', height, overflow: 'hidden' }}>
          {src ? (
            <Image source={{ uri: src }} resizeMode="cover" accessibilityLabel={alt} style={{ width: '100%', height: '100%', backgroundColor: colors.surfaceViewer }} />
          ) : (
            <Image source={hatchTile} resizeMode="repeat" style={{ width: '100%', height: '100%' }} />
          )}
          {!src && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: fontSize.label, color: colors.textMeta }}>[ photo ]</Text>
            </View>
          )}
          {uploading && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: `${100 - (progress ?? 0)}%`,
                backgroundColor: colors.bg1,
                borderTopWidth: 2,
                borderTopColor: colors.gold,
              }}
            />
          )}
        </View>
      </Pressable>

      {uploading && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            paddingVertical: 10,
            paddingHorizontal: spacing.sp3,
            borderTopWidth: 1,
            borderTopColor: edge,
          }}
        >
          <Text style={{ color: colors.textAccent, fontSize: fontSize.meta }}>
            [{'█'.repeat(n)}
            {'░'.repeat(cells - n)}]
          </Text>
          <Text style={{ color: colors.textBody, fontSize: fontSize.meta }}>{Math.round(progress ?? 0)}%</Text>
          {onCancel && (
            <Pressable accessibilityRole="button" accessibilityLabel="Cancel upload" onPress={onCancel} style={webCursor('pointer')}>
              <Text style={{ color: colors.textMeta, fontSize: fontSize.meta }}>[x]</Text>
            </Pressable>
          )}
        </View>
      )}

      {caption && !uploading && (
        <View style={{ paddingVertical: 10, paddingHorizontal: spacing.sp3, borderTopWidth: 1, borderTopColor: edge }}>
          <Text style={{ fontSize: fontSize.body, lineHeight: lh(fontSize.body, lineHeight.body), color: colors.textBody }}>
            {caption}
          </Text>
        </View>
      )}

      {errorSlot && (
        <View style={{ paddingVertical: 10, paddingHorizontal: spacing.sp3, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: edge }}>
          {errorSlot}
        </View>
      )}
    </View>
  );
}
