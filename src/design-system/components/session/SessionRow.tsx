import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../internal/Text';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { fontFamily, fontSize } from '../../tokens/typography';
import { useInteractiveState, webCursor } from '../../internal/useInteractiveState';

export type SessionGlyph = '[>]' | '[~]' | '[#]';

export interface SessionRowProps {
  title: string;
  preview?: string;
  glyph?: SessionGlyph;
  time: string;
  unread?: boolean;
  /** Desktop sidebar: this is the open chat. */
  active?: boolean;
  /** Emphasized during the mobile action sheet / desktop context menu. */
  selected?: boolean;
  pinned?: boolean;
  density?: 'mobile' | 'sidebar';
  showPreview?: boolean;
  /** Substring to highlight gold (search matches). */
  highlight?: string;
  onOpen?: () => void;
  /** Long-press (mobile) / "..." button or right-click (desktop). */
  onActions?: () => void;
}

function highlightParts(text: string, query?: string): { text: string; hit: boolean }[] {
  if (!query || !query.trim()) return [{ text, hit: false }];
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const parts: { text: string; hit: boolean }[] = [];
  let i = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      parts.push({ text: text.slice(i), hit: false });
      break;
    }
    if (idx > i) parts.push({ text: text.slice(i, idx), hit: false });
    parts.push({ text: text.slice(idx, idx + q.length), hit: true });
    i = idx + q.length;
  }
  return parts;
}

function Highlighted({ text, query, style }: { text: string; query?: string; style: any }) {
  const parts = highlightParts(text, query);
  return (
    <Text numberOfLines={1} ellipsizeMode="tail" style={style}>
      {parts.map((p, i) =>
        p.hit ? (
          <Text key={i} style={[style, { color: colors.textAccent, backgroundColor: colors.surfaceSelected }]}>
            {p.text}
          </Text>
        ) : (
          p.text
        ),
      )}
    </Text>
  );
}

export function SessionRow({
  title,
  preview,
  glyph = '[>]',
  time,
  unread = false,
  active = false,
  selected = false,
  density = 'mobile',
  showPreview = true,
  highlight,
  onOpen,
  onActions,
}: SessionRowProps) {
  const { hovered, pressed, handlers } = useInteractiveState();
  const sidebar = density === 'sidebar';
  const emphasized = active || selected;

  const bg = selected
    ? colors.surfaceSelected
    : active
      ? colors.surfaceSelected
      : hovered || pressed
        ? colors.surfaceHover
        : 'transparent';

  return (
    <Pressable
      onPress={onOpen}
      onLongPress={onActions}
      delayLongPress={400}
      {...handlers}
      {...(webCursor('pointer') as any)}
      style={[
        {
          paddingVertical: sidebar ? spacing.sp2 : spacing.sp3,
          paddingHorizontal: sidebar ? spacing.sp3 : spacing.sp4,
          gap: 4,
          borderBottomWidth: sidebar ? 0 : 1,
          borderBottomColor: colors.borderDefault,
          backgroundColor: bg,
          borderWidth: selected ? 1 : 0,
          borderColor: selected ? colors.gold : 'transparent',
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sp3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, minWidth: 0, gap: 4 }}>
          {sidebar && active && (
            <Text style={{ color: colors.textAccent, fontSize: fontSize.small, fontFamily: fontFamily.monoSemibold }}>{'>'}</Text>
          )}
          <Highlighted
            text={title}
            query={highlight}
            style={{
              color: emphasized ? colors.textAccent : colors.textBody,
              fontSize: sidebar ? fontSize.small : fontSize.body,
              fontFamily: unread && !sidebar ? fontFamily.monoMedium : fontFamily.monoRegular,
              flexShrink: 1,
            }}
          />
        </View>
        <Text
          numberOfLines={1}
          style={{
            color: unread ? colors.textAccent : colors.textMeta,
            fontSize: fontSize.label,
            flexShrink: 0,
          }}
        >
          {time}
        </Text>
      </View>

      {showPreview && preview && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sp2,
            paddingLeft: sidebar ? 14 : 0,
          }}
        >
          {!sidebar && <Text style={{ color: colors.textDisabled, fontSize: fontSize.small }}>{glyph}</Text>}
          <Highlighted
            text={preview}
            query={highlight}
            style={{ flex: 1, minWidth: 0, color: colors.textMeta, fontSize: sidebar ? fontSize.label : fontSize.small }}
          />
          {unread && !sidebar && (
            <View style={{ width: 8, height: 8, backgroundColor: colors.gold, shadowColor: colors.gold, shadowOpacity: 0.8, shadowRadius: 6 }} />
          )}
        </View>
      )}
    </Pressable>
  );
}
