import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../design-system/internal/Text';
import {
  ActionSheet,
  ActionSheetItem,
  Button,
  ContextMenu,
  DeleteConfirmSheet,
  EmptyState,
  SessionRow,
  TextInput,
  colors,
  em,
  fontFamily,
  fontSize,
  spacing,
  tracking,
} from '../../design-system';
import { useSessionsStore } from '../../state/SessionsContext';
import { Message, MessageKind, Session } from '../../data/types';
import { groupFor, listTime } from '../../data/format';
import { webCursor } from '../../design-system/internal/useInteractiveState';

const GLYPH: Record<MessageKind, '[>]' | '[~]' | '[#]'> = { text: '[>]', voice: '[~]', photo: '[#]' };
const GROUP_ORDER = ['PINNED', 'TODAY', 'YESTERDAY', 'EARLIER'] as const;

function SectionHeader({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: colors.textMeta,
        fontSize: fontSize.label,
        letterSpacing: em(fontSize.label, tracking.label),
        textTransform: 'uppercase',
        paddingHorizontal: spacing.sp4,
        paddingTop: spacing.sp4,
        paddingBottom: 6,
      }}
    >
      {children}
    </Text>
  );
}

function messageSnippet(messages: Message[] | undefined, query: string): string | undefined {
  if (!messages || !query.trim()) return undefined;
  const q = query.trim().toLowerCase();
  const hit = messages.find(
    (m) =>
      m.text?.toLowerCase().includes(q) ||
      m.audio?.transcript?.toLowerCase().includes(q) ||
      m.photos?.some((p) => p.caption?.toLowerCase().includes(q)),
  );
  if (!hit) return undefined;
  return hit.text ?? hit.audio?.transcript ?? hit.photos?.find((p) => p.caption)?.caption;
}

export interface SessionListPaneProps {
  variant: 'mobile' | 'sidebar';
  query: string;
  activeSessionId?: string;
  onOpenSession: (id: string) => void;
  onClearSearch?: () => void;
  showPreview?: boolean;
}

export function SessionListPane({ variant, query, activeSessionId, onOpenSession, onClearSearch, showPreview = true }: SessionListPaneProps) {
  const store = useSessionsStore();
  const router = useRouter();
  const sidebar = variant === 'sidebar';

  const [sheetForId, setSheetForId] = React.useState<string | null>(null);
  const [anchorRect, setAnchorRect] = React.useState<{ top: number; height: number } | null>(null);
  const [menuFor, setMenuFor] = React.useState<{ id: string; x: number; y: number } | null>(null);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [undoSeconds, setUndoSeconds] = React.useState(0);
  const rowRefs = React.useRef<Record<string, View | null>>({});

  React.useEffect(() => {
    if (!store.state.pendingDelete) return;
    const iv = setInterval(() => {
      const left = Math.max(0, Math.ceil((store.state.pendingDelete!.expiresAt - Date.now()) / 1000));
      setUndoSeconds(left);
    }, 200);
    return () => clearInterval(iv);
  }, [store.state.pendingDelete]);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;

  const results = React.useMemo(() => {
    if (!isSearching) return store.sortedSessions;
    const q = trimmedQuery.toLowerCase();
    return store.sortedSessions.filter((s) => {
      if ((s.title ?? '').toLowerCase().includes(q)) return true;
      return Boolean(messageSnippet(store.state.messages[s.id], trimmedQuery));
    });
  }, [isSearching, store.sortedSessions, store.state.messages, trimmedQuery]);

  function openActions(session: Session, ref: View | null) {
    if (sidebar) return;
    setSheetForId(session.id);
    ref?.measureInWindow?.((_x: number, y: number, _w: number, h: number) => setAnchorRect({ top: y, height: h }));
  }

  function openMenu(session: Session, ref: View | null) {
    if (!sidebar) return;
    ref?.measureInWindow?.((x: number, y: number, w: number, h: number) => setMenuFor({ id: session.id, x: x + w - 240, y: y + h }));
  }

  function startRename(id: string, currentTitle: string | null) {
    setSheetForId(null);
    setMenuFor(null);
    setRenamingId(id);
    setRenameValue(currentTitle ?? '');
  }

  function commitRename() {
    if (renamingId) store.renameSession(renamingId, renameValue || 'New session');
    setRenamingId(null);
  }

  function actionsFor(session: Session): ActionSheetItem[] {
    return [
      { glyph: '[^]', label: session.pinned ? 'Unpin' : 'Pin to top', shortcut: 'P', onSelect: () => { store.togglePin(session.id); setSheetForId(null); setMenuFor(null); } },
      { glyph: '[r]', label: 'Rename', shortcut: 'F2', onSelect: () => startRename(session.id, session.title) },
      { glyph: '[↓]', label: 'Export transcript', shortcut: 'E', onSelect: () => { setSheetForId(null); setMenuFor(null); } },
      {
        glyph: '[x]',
        label: 'Delete session',
        shortcut: 'DEL',
        danger: true,
        onSelect: () => {
          setSheetForId(null);
          setMenuFor(null);
          setConfirmDeleteId(session.id);
        },
      },
    ];
  }

  function askAgent() {
    const id = store.createSession();
    store.sendText(id, trimmedQuery);
    onClearSearch?.();
    router.push(`/s/${id}`);
  }

  const totalSessions = store.sortedSessions.length;

  if (!isSearching && totalSessions === 0) {
    return (
      <View style={{ flex: 1, justifyContent: sidebar ? 'flex-start' : 'center', padding: spacing.sp6 }}>
        <EmptyState
          eyebrow="C:\> DIR /SESSIONS"
          title="0 SESSIONS FOUND_"
          body="Start one by text, voice or photo. Sessions stay on this device until you delete them."
          actions={
            <>
              <Button glyph="[+]" fullWidth onClick={() => router.push('/s/new')}>
                NEW SESSION
              </Button>
              <Button
                variant="secondary"
                glyph="[~]"
                fullWidth
                onClick={() => {
                  const id = store.createSession();
                  router.push(`/s/${id}/voice`);
                }}
              >
                TALK HANDS-FREE
              </Button>
            </>
          }
        />
      </View>
    );
  }

  if (isSearching && results.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: spacing.sp4, paddingVertical: spacing.sp3, borderBottomWidth: 1, borderBottomColor: colors.borderDefault }}>
          <Text style={{ color: colors.textMeta, fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label) }}>
            0 MATCHES · TITLES + MESSAGES
          </Text>
        </View>
        <View style={{ padding: spacing.sp4 }}>
          <EmptyState
            body={
              <>
                No sessions match &quot;{trimmedQuery}&quot;.{'\n\n'}Search covers titles, messages and voice transcripts.
                Photos are searched by their captions only.
              </>
            }
            actions={
              <View style={{ flexDirection: 'row', gap: spacing.sp4 }}>
                <Pressable onPress={onClearSearch} {...(webCursor('pointer') as any)}>
                  <Text style={{ color: colors.textAccent, fontSize: fontSize.small }}>{'>'} clear search</Text>
                </Pressable>
                <Pressable onPress={askAgent} {...(webCursor('pointer') as any)}>
                  <Text style={{ color: colors.textBody, fontSize: fontSize.small }}>{'>'} ask the agent</Text>
                </Pressable>
              </View>
            }
          />
        </View>
      </View>
    );
  }

  const activeSheetSession = sheetForId ? store.state.sessions[sheetForId] : null;
  const activeMenuSession = menuFor ? store.state.sessions[menuFor.id] : null;
  const deleteTarget = confirmDeleteId ? store.state.sessions[confirmDeleteId] : null;
  const deleteMessages = confirmDeleteId ? store.state.messages[confirmDeleteId] ?? [] : [];

  function renderRow(session: Session) {
    const isRenaming = renamingId === session.id;
    if (isRenaming) {
      return (
        <View key={session.id} style={{ paddingHorizontal: sidebar ? spacing.sp3 : spacing.sp4, paddingVertical: spacing.sp2, gap: 4 }}>
          <TextInput
            value={renameValue}
            onChange={(v) => setRenameValue(v.length <= 48 ? v : v.slice(0, 48))}
            prompt=">"
            autoFocus
            selectTextOnFocus
            onKeyDown={(e) => {
              if (e.nativeEvent.key === 'Enter') commitRename();
              if (e.nativeEvent.key === 'Escape') setRenamingId(null);
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>ENTER SAVE · ESC CANCEL</Text>
            <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>
              {renameValue.length}/48 {sidebar ? '' : `· ${session.id}`}
            </Text>
          </View>
        </View>
      );
    }

    const snippet = isSearching ? messageSnippet(store.state.messages[session.id], trimmedQuery) : undefined;
    const preview = snippet ?? session.lastMsg.text;

    return (
      <View
        key={session.id}
        ref={(r) => {
          rowRefs.current[session.id] = r as unknown as View;
        }}
        style={{ opacity: renamingId && renamingId !== session.id ? 0.5 : 1 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <SessionRow
              title={session.title ?? 'New session'}
              preview={preview}
              glyph={GLYPH[session.lastMsg.kind]}
              time={listTime(session.updatedAt)}
              unread={session.unread}
              active={sidebar && session.id === activeSessionId}
              density={variant}
              showPreview={showPreview}
              highlight={isSearching ? trimmedQuery : undefined}
              onOpen={() => {
                store.markRead(session.id);
                onOpenSession(session.id);
              }}
              onActions={() => openActions(session, rowRefs.current[session.id])}
            />
          </View>
          {sidebar && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Actions for ${session.title ?? 'session'}`}
              onPress={() => openMenu(session, rowRefs.current[session.id])}
              {...(webCursor('pointer') as any)}
              style={{ width: 28, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: colors.textMeta, fontSize: fontSize.small }}>[⋯]</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const list = isSearching ? (
    <View>
      <View style={{ paddingHorizontal: spacing.sp4, paddingVertical: spacing.sp3, borderBottomWidth: 1, borderBottomColor: colors.borderDefault }}>
        <Text style={{ color: colors.textMeta, fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label) }}>
          {results.length} MATCH{results.length === 1 ? '' : 'ES'} · TITLES + MESSAGES
        </Text>
      </View>
      {results.map(renderRow)}
      <Text style={{ color: colors.textMeta, fontSize: fontSize.small, textAlign: 'center', paddingVertical: spacing.sp4 }}>
        — end of results —
      </Text>
    </View>
  ) : (
    <View>
      {GROUP_ORDER.map((group) => {
        const items = results.filter((s) => groupFor(s.updatedAt, s.pinned) === group);
        if (items.length === 0) return null;
        return (
          <View key={group}>
            <SectionHeader>{group}</SectionHeader>
            {items.map(renderRow)}
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {list}

      {store.state.pendingDelete && (
        <View
          style={{
            position: 'absolute',
            left: sidebar ? spacing.sp2 : spacing.sp4,
            right: sidebar ? spacing.sp2 : spacing.sp4,
            bottom: sidebar ? spacing.sp2 : spacing.sp3,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sp3,
            borderWidth: 1,
            borderColor: colors.gold,
            backgroundColor: colors.surfaceApp,
            paddingVertical: spacing.sp3,
            paddingHorizontal: 14,
          }}
        >
          <Text style={{ color: colors.statusOk, fontFamily: fontFamily.monoSemibold, fontSize: fontSize.small }}>OK</Text>
          <Text style={{ flex: 1, color: colors.textBody, fontSize: fontSize.small }}>Session deleted.</Text>
          <Text style={{ color: colors.textDisabled, fontSize: fontSize.small }}>0:{String(undoSeconds).padStart(2, '0')}</Text>
          <Pressable onPress={store.undoDelete} {...(webCursor('pointer') as any)}>
            <Text style={{ color: colors.textAccent, fontFamily: fontFamily.monoSemibold, fontSize: fontSize.small }}>[↺] UNDO</Text>
          </Pressable>
        </View>
      )}

      <ActionSheet
        visible={!!activeSheetSession}
        onClose={() => setSheetForId(null)}
        header={
          activeSheetSession ? (
            <>
              <Text style={{ color: colors.textMeta, fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label), textTransform: 'uppercase' }}>
                SESSION {activeSheetSession.id}
              </Text>
              <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>
                {(store.state.messages[activeSheetSession.id] ?? []).length} MSGS ·{' '}
                {(store.state.messages[activeSheetSession.id] ?? []).filter((m) => m.kind === 'voice').length} VOICE
              </Text>
            </>
          ) : null
        }
        items={activeSheetSession ? actionsFor(activeSheetSession) : []}
        anchor={
          activeSheetSession && anchorRect
            ? {
                top: anchorRect.top,
                height: anchorRect.height,
                content: (
                  <View style={{ borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.surfaceSelected }}>
                    <SessionRow
                      title={activeSheetSession.title ?? 'New session'}
                      preview={activeSheetSession.lastMsg.text}
                      glyph={GLYPH[activeSheetSession.lastMsg.kind]}
                      time={listTime(activeSheetSession.updatedAt)}
                      selected
                      density="mobile"
                    />
                  </View>
                ),
              }
            : undefined
        }
      />

      <ContextMenu
        visible={!!activeMenuSession}
        onClose={() => setMenuFor(null)}
        x={menuFor?.x ?? 0}
        y={menuFor?.y ?? 0}
        items={activeMenuSession ? actionsFor(activeMenuSession) : []}
      />

      {deleteTarget && (
        <DeleteConfirmSheet
          visible
          sessionId={deleteTarget.id}
          title={deleteTarget.title ?? 'New session'}
          messageCount={deleteMessages.length}
          voiceCount={deleteMessages.filter((m) => m.kind === 'voice').length}
          centered={sidebar}
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            store.requestDelete(deleteTarget.id);
            setConfirmDeleteId(null);
          }}
        />
      )}
    </View>
  );
}
