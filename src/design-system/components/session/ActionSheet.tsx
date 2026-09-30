import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { em, fontFamily, fontSize, tracking } from '../../tokens/typography';
import { useInteractiveState, webCursor } from '../../internal/useInteractiveState';

export interface ActionSheetItem {
  glyph: string;
  label: string;
  /** Desktop-only keyboard shortcut shown at the right edge. */
  shortcut?: string;
  danger?: boolean;
  onSelect: () => void;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  header?: React.ReactNode;
  items: ActionSheetItem[];
  /** Duplicate of the source row, elevated above the veil at its original position. */
  anchor?: { top: number; height: number; content: React.ReactNode };
}

function Row({ item }: { item: ActionSheetItem }) {
  const { hovered, handlers } = useInteractiveState();
  const fg = item.danger ? colors.statusError : colors.textBody;
  return (
    <Pressable
      onPress={item.onSelect}
      {...handlers}
      {...(webCursor('pointer') as any)}
      style={{
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sp3,
        paddingHorizontal: spacing.sp4,
        backgroundColor: hovered ? colors.surfaceHover : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDefault,
      }}
    >
      <Text style={{ color: item.danger ? colors.statusError : colors.textAccent, fontSize: fontSize.small, width: 28 }}>
        {item.glyph}
      </Text>
      <Text style={{ flex: 1, color: fg, fontSize: fontSize.body }}>{item.label}</Text>
      {item.shortcut && <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>{item.shortcut}</Text>}
    </Pressable>
  );
}

/** Mobile bottom action sheet — long-press on a session row. */
export function ActionSheet({ visible, onClose, header, items, anchor }: ActionSheetProps) {
  if (!visible) return null;
  return (
    <View
      accessibilityViewIsModal
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
    >
      <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,10,7,0.86)' }} />

      {anchor && (
        <View style={{ position: 'absolute', top: anchor.top, left: 0, right: 0, height: anchor.height }}>{anchor.content}</View>
      )}

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surfaceApp, borderTopWidth: 1, borderTopColor: colors.borderDefault }}>
        {header && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.sp4,
              paddingVertical: spacing.sp3,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderDefault,
            }}
          >
            {header}
          </View>
        )}
        {items.map((item, i) => (
          <Row key={i} item={item} />
        ))}
        <Pressable onPress={onClose} {...(webCursor('pointer') as any)} style={{ paddingVertical: spacing.sp4, alignItems: 'center' }}>
          <Text style={{ color: colors.textBody, fontSize: fontSize.small }}>{'>'} cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ActionSheetHeaderText({ left, right }: { left: string; right?: string }) {
  return (
    <>
      <Text
        style={{ color: colors.textMeta, fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label), textTransform: 'uppercase' }}
      >
        {left}
      </Text>
      {right && (
        <Text style={{ color: colors.textMeta, fontSize: fontSize.label, fontFamily: fontFamily.monoRegular }}>{right}</Text>
      )}
    </>
  );
}
