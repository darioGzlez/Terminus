import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { shape, spacing } from '../../tokens/spacing';
import { fontSize } from '../../tokens/typography';
import { useInteractiveState, webCursor } from '../../internal/useInteractiveState';
import { ActionSheetItem } from './ActionSheet';

export interface ContextMenuProps {
  visible: boolean;
  onClose: () => void;
  /** Top-left anchor, clamped by the caller to stay on-screen. */
  x: number;
  y: number;
  items: ActionSheetItem[];
  width?: number;
}

function Row({ item, activeIndex, index, onHover }: { item: ActionSheetItem; activeIndex: number; index: number; onHover: () => void }) {
  const { hovered, handlers } = useInteractiveState();
  const emphasized = hovered || activeIndex === index;
  return (
    <Pressable
      onPress={item.onSelect}
      onHoverIn={() => {
        handlers.onHoverIn();
        onHover();
      }}
      onHoverOut={handlers.onHoverOut}
      {...(webCursor('pointer') as any)}
      style={{
        height: 36,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sp2,
        paddingHorizontal: spacing.sp3,
        backgroundColor: emphasized ? colors.surfaceHover : 'transparent',
      }}
    >
      <Text style={{ color: item.danger ? colors.statusError : colors.textAccent, fontSize: fontSize.meta, width: 22 }}>
        {item.glyph}
      </Text>
      <Text style={{ flex: 1, color: item.danger ? colors.statusError : colors.textBody, fontSize: fontSize.small }}>
        {item.label}
      </Text>
      {item.shortcut && <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>{item.shortcut}</Text>}
    </Pressable>
  );
}

/** Desktop floating menu — right-click or hover "..." on a session row. */
export function ContextMenu({ visible, onClose, x, y, items, width = 240 }: ContextMenuProps) {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  React.useEffect(() => {
    if (!visible || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') setActiveIndex((i) => Math.min(items.length - 1, i + 1));
      else if (e.key === 'ArrowUp') setActiveIndex((i) => Math.max(0, i - 1));
      else if (e.key === 'Enter' && activeIndex >= 0) items[activeIndex]?.onSelect();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onClose, items, activeIndex]);

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 60 }}>
      <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View
        style={{
          position: 'absolute',
          top: y,
          left: x,
          width,
          borderWidth: shape.borderW,
          borderColor: colors.gold,
          backgroundColor: colors.surfaceApp,
        }}
      >
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {item.danger && i > 0 && !items[i - 1].danger && <View style={{ height: 1, backgroundColor: colors.borderDefault }} />}
            <Row item={item} index={i} activeIndex={activeIndex} onHover={() => setActiveIndex(i)} />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}
