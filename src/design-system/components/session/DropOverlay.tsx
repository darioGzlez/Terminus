import React from 'react';
import { View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { fontFamily, fontSize } from '../../tokens/typography';

/** Desktop drag-and-drop overlay, shown over the chat column (never the sidebar). */
export interface DropOverlayProps {
  /** ok = accepted file types · reject = unsupported type, painted red */
  state?: 'ok' | 'reject';
  /** VT323 headline. Default "DROP TO ATTACH_" / overridden for reject, e.g. "CAN'T ATTACH .PDF_" */
  title?: string;
  message?: string;
}

export function DropOverlay({ state = 'ok', title, message }: DropOverlayProps) {
  const color = state === 'reject' ? colors.statusError : colors.gold;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        bottom: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: color,
        backgroundColor: 'rgba(11,10,7,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <Text glow="display" style={{ fontFamily: fontFamily.display, fontSize: 64, lineHeight: 64, color }}>
        {title ?? 'DROP TO ATTACH_'}
      </Text>
      {message && <Text style={{ fontSize: fontSize.small, color: colors.textMeta }}>{message}</Text>}
    </View>
  );
}
