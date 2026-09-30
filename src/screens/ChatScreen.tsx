import React from 'react';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sidebar } from '../components/session-list/Sidebar';
import { Text } from '../design-system/internal/Text';
import { webCursor } from '../design-system/internal/useInteractiveState';
import {
  ActionSheet,
  ActionSheetItem,
  AttachmentItem,
  AttachmentTray,
  Composer,
  ContextMenu,
  DeleteConfirmSheet,
  DropOverlay,
  EmptyState,
  ErrorLine,
  IconButton,
  ImageFrame,
  MessageActions,
  PixelIcon,
  RecordingBar,
  StatusBar,
  SystemLine,
  TextInput,
  ThinkingIndicator,
  Toast,
  UserMessage,
  AgentMessage,
  VoiceNote,
  colors,
  em,
  fontFamily,
  fontSize,
  layout,
  spacing,
  tracking,
} from '../design-system';
import { useSessionsStore } from '../state/SessionsContext';
import { SUGGESTIONS, hexId } from '../data/mock';
import { fmtBytes, mmss, timeHHMMSS } from '../data/format';
import { Message } from '../data/types';

const OVERSIZE_PATTERN = [2.4, 3.1, 31.8, 1.2]; // MB — index 2 is always over the 20 MB cap, on purpose.

function HeaderMeta({ id, net, reconnectSeconds }: { id: string; net: string; reconnectSeconds?: number }) {
  if (reconnectSeconds !== undefined) {
    return (
      <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>
        {id} · <Text style={{ color: colors.textMeta }}>○ reconnecting · {reconnectSeconds}s</Text>
      </Text>
    );
  }
  return (
    <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>
      {id} · <Text style={{ color: net === 'online' ? colors.statusOk : colors.textDisabled }}>{net === 'online' ? '● online' : '○ offline'}</Text>
    </Text>
  );
}

function RateLimitBanner({ secondsLeft }: { secondsLeft: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sp3,
        borderWidth: 1,
        borderColor: colors.statusError,
        paddingVertical: 10,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ color: colors.statusError, fontFamily: fontFamily.monoSemibold, fontSize: fontSize.small }}>!!</Text>
      <Text style={{ flex: 1, color: colors.textBody, fontSize: fontSize.small }}>
        429 · too many requests. Sending is paused.
      </Text>
      <Text style={{ fontFamily: fontFamily.display, fontSize: fontSize.timer, color: colors.textBody }}>{mmss(secondsLeft)}</Text>
    </View>
  );
}

function PushToTalkBar({ elapsedSec, onCancel, onLock }: { elapsedSec: number; onCancel: () => void; onLock: () => void }) {
  return (
    <View style={{ padding: 10, gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>RELEASE TO SEND · TAP TO DISCARD</Text>
        <Pressable onPress={onLock} {...(webCursor('pointer') as any)}>
          <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>[^] lock</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.statusError, padding: 10 }}>
        <Pressable onPress={onCancel} {...(webCursor('pointer') as any)}>
          <Text style={{ color: colors.textMeta, fontSize: fontSize.small }}>{'<<'} CANCEL</Text>
        </Pressable>
        <Text style={{ fontFamily: fontFamily.display, fontSize: 22, color: colors.statusRec }}>REC {mmss(elapsedSec)}</Text>
        <View style={{ width: 64, height: 64, backgroundColor: colors.actionBg, alignItems: 'center', justifyContent: 'center' }}>
          <PixelIcon name="mic" size={24} color={colors.actionFg} />
        </View>
      </View>
    </View>
  );
}

export interface ChatScreenProps {
  sessionId?: string;
  isNew?: boolean;
}

export function ChatScreen({ sessionId, isNew = false }: ChatScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const store = useSessionsStore();
  const isDesktop = width >= layout.bpDesktop;

  const [previewId] = React.useState(() => hexId());
  const [liveId, setLiveId] = React.useState<string | undefined>(sessionId);
  const effectiveId = sessionId ?? liveId;
  const displayId = effectiveId ?? previewId;

  const session = effectiveId ? store.state.sessions[effectiveId] : undefined;
  const messages = effectiveId ? store.state.messages[effectiveId] ?? [] : [];
  const agentPhase = effectiveId ? store.state.agentPhase[effectiveId] ?? 'idle' : 'idle';
  const reconnectSeconds = effectiveId ? store.state.reconnectSeconds[effectiveId] : undefined;
  const rateLimitUntil = effectiveId ? store.state.rateLimitUntil[effectiveId] : undefined;

  const [composerText, setComposerText] = React.useState('');
  const [attachments, setAttachments] = React.useState<AttachmentItem[]>([]);
  const [pendingFiles, setPendingFiles] = React.useState<{ name: string; bytes: number; w: number; h: number }[]>([]);
  const attachCounter = React.useRef(0);

  const [recorder, setRecorder] = React.useState<'idle' | 'holding' | 'locked'>('idle');
  const [holdElapsed, setHoldElapsed] = React.useState(0);
  const holdStartRef = React.useRef(0);
  const holdTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const armTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = React.useState<Record<string, boolean>>({});
  const [rateLimitLeft, setRateLimitLeft] = React.useState(0);
  const [thinkingElapsed, setThinkingElapsed] = React.useState(0);
  const [atBottom, setAtBottom] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);
  const [dropState, setDropState] = React.useState<'ok' | 'reject' | null>(null);
  const [clock, setClock] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!isDesktop) return undefined;
    const iv = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [isDesktop]);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState<{ x: number; y: number } | null>(null);
  const [renaming, setRenaming] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState('');

  const startRenaming = React.useCallback(() => {
    setRenameValue(session?.title ?? '');
    setRenaming(true);
  }, [session?.title]);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const menuAnchorRef = React.useRef<View>(null);

  const scrollRef = React.useRef<ScrollView>(null);

  const showToast = React.useCallback((text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const scrollToEnd = React.useCallback((animated = true) => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated }));
  }, []);

  React.useEffect(() => {
    if (atBottom) scrollToEnd();
  }, [messages.length, atBottom, scrollToEnd]);

  React.useEffect(() => {
    if (agentPhase !== 'thinking') return undefined;
    const started = Date.now();
    const iv = setInterval(() => setThinkingElapsed((Date.now() - started) / 1000), 100);
    return () => clearInterval(iv);
  }, [agentPhase]);

  React.useEffect(() => {
    if (!rateLimitUntil) return;
    const iv = setInterval(() => setRateLimitLeft(Math.max(0, (rateLimitUntil - Date.now()) / 1000)), 200);
    return () => clearInterval(iv);
  }, [rateLimitUntil]);

  function ensureSessionId(): string {
    if (effectiveId) return effectiveId;
    const id = store.createSession(previewId);
    setLiveId(id);
    router.replace(`/s/${id}`);
    return id;
  }

  function handleSend(text: string) {
    const id = ensureSessionId();
    if (pendingFiles.length > 0) {
      store.sendPhotos(id, pendingFiles, text.trim() || undefined);
      setPendingFiles([]);
      setAttachments([]);
      setComposerText('');
      return;
    }
    store.sendText(id, text);
    setComposerText('');
  }

  function handleAttach() {
    if (attachments.length >= 4) return;
    const i = attachCounter.current % OVERSIZE_PATTERN.length;
    attachCounter.current += 1;
    const mb = OVERSIZE_PATTERN[i];
    const name = `IMG_0${140 + attachments.length}${mb > 20 ? '.HEIC' : '.JPG'}`;
    setAttachments((a) => [...a, { name }]);
    setPendingFiles((f) => [...f, { name, bytes: mb * 1024 * 1024, w: 4032, h: 3024 }]);
  }

  function removeAttachment(index: number) {
    setAttachments((a) => a.filter((_, i) => i !== index));
    setPendingFiles((f) => f.filter((_, i) => i !== index));
  }

  function sendVoiceNote(seconds: number) {
    const id = ensureSessionId();
    store.sendVoice(id, seconds, "…what I just said, roughly transcribed.");
  }

  // Holding the mic swaps the Composer out for PushToTalkBar, which unmounts the very
  // Pressable whose onPressOut we're relying on mid-gesture. A window-level listener
  // (registered on press-in, self-removing) survives that swap; releaseRef always points
  // at the latest releasePushToTalk closure so the listener never sees a stale `recorder`.
  const releaseRef = React.useRef<() => void>(() => {});

  function releasePushToTalk() {
    if (armTimerRef.current) {
      clearTimeout(armTimerRef.current);
      armTimerRef.current = null;
    }
    if (recorder !== 'holding') return;
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    const heldSec = (Date.now() - holdStartRef.current) / 1000;
    setRecorder('idle');
    if (heldSec < 0.8) {
      showToast('hold to record');
    } else {
      sendVoiceNote(Math.round(heldSec));
    }
  }
  React.useEffect(() => {
    releaseRef.current = releasePushToTalk;
  });

  function armPushToTalk() {
    if (isDesktop) {
      setRecorder('locked');
      return;
    }
    holdStartRef.current = Date.now();
    armTimerRef.current = setTimeout(() => {
      setRecorder('holding');
      setHoldElapsed(0);
      holdTimerRef.current = setInterval(() => setHoldElapsed((Date.now() - holdStartRef.current) / 1000), 100);
    }, 250);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const onUp = () => releaseRef.current();
      window.addEventListener('mouseup', onUp, { once: true });
      window.addEventListener('touchend', onUp, { once: true });
    }
  }

  function cancelPushToTalk() {
    if (armTimerRef.current) clearTimeout(armTimerRef.current);
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setRecorder('idle');
  }

  function togglePlay(id: string) {
    setPlaying((p) => ({ ...p, [id]: !p[id] }));
  }

  // --- Current-session menu (rename / pin / delete) shared by mobile [≡] and desktop [≡] ---
  function sessionMenuItems(): ActionSheetItem[] {
    if (!session) return [];
    return [
      { glyph: '[^]', label: session.pinned ? 'Unpin' : 'Pin to top', onSelect: () => { store.togglePin(session.id); setSheetOpen(false); setMenuOpen(null); } },
      { glyph: '[r]', label: 'Rename', onSelect: () => { startRenaming(); setSheetOpen(false); setMenuOpen(null); } },
      { glyph: '[↓]', label: 'Export transcript', onSelect: () => { setSheetOpen(false); setMenuOpen(null); } },
      {
        glyph: '[x]',
        label: 'Delete session',
        danger: true,
        onSelect: () => {
          setSheetOpen(false);
          setMenuOpen(null);
          setConfirmingDelete(true);
        },
      },
    ];
  }

  // --- Keyboard shortcuts (desktop / web) ---
  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea';
      if (e.key === 'Escape') {
        setSheetOpen(false);
        setMenuOpen(null);
        setConfirmingDelete(false);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        router.push('/s/new');
        return;
      }
      if (typing) return;
      if (e.key === 'F2' && session) startRenaming();
      if (e.key === 'Delete' && session) setConfirmingDelete(true);
      if ((e.ctrlKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const ids = store.sortedSessions.map((s) => s.id);
        const idx = ids.indexOf(effectiveId ?? '');
        if (idx === -1) return;
        const next = e.key === 'ArrowDown' ? Math.min(ids.length - 1, idx + 1) : Math.max(0, idx - 1);
        router.push(`/s/${ids[next]}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [effectiveId, router, session, startRenaming, store.sortedSessions]);

  // --- Desktop drag & drop ---
  const dropHandlers =
    isDesktop && Platform.OS === 'web'
      ? {
          onDragEnter: (e: any) => {
            e.preventDefault();
            setDropState('ok');
          },
          onDragOver: (e: any) => e.preventDefault(),
          onDragLeave: () => setDropState(null),
          onDrop: (e: any) => {
            e.preventDefault();
            setDropState(null);
            const count = e.dataTransfer?.files?.length ?? 1;
            for (let i = 0; i < Math.min(count, 4 - attachments.length); i += 1) handleAttach();
          },
        }
      : {};

  const netLabel = store.state.net;
  const canSend = !rateLimitUntil;
  const busy = agentPhase === 'thinking' || agentPhase === 'streaming';

  const header = (
    <View
      style={{
        height: layout.headerH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: isDesktop ? spacing.sp6 : spacing.sp1,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDefault,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp3, flexShrink: 1, minWidth: 0 }}>
        {!isDesktop && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to sessions"
            onPress={() => router.push('/sessions')}
            {...(webCursor('pointer') as any)}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: colors.textAccent, fontSize: fontSize.body }}>[{'<'}]</Text>
          </Pressable>
        )}
        <View style={{ minWidth: 0, flexShrink: 1 }}>
          {renaming ? (
            <TextInput
              value={renameValue}
              onChange={setRenameValue}
              prompt=">"
              autoFocus
              selectTextOnFocus
              onKeyDown={(e) => {
                if (e.nativeEvent.key === 'Enter') {
                  store.renameSession(session!.id, renameValue || 'New session');
                  setRenaming(false);
                }
                if (e.nativeEvent.key === 'Escape') setRenaming(false);
              }}
            />
          ) : (
            <>
              <Text numberOfLines={1} style={{ color: session?.title ? colors.textBody : colors.textMeta, fontSize: fontSize.body, fontFamily: fontFamily.monoMedium }}>
                {session?.title ?? 'New session'}
              </Text>
              <HeaderMeta id={displayId} net={netLabel} reconnectSeconds={reconnectSeconds} />
            </>
          )}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp3 }}>
        {isDesktop && <Text style={{ color: colors.textMeta, fontSize: fontSize.small }}>{'>'} crt:standard</Text>}
        <IconButton icon="wave" label="Hands-free mode" variant="ghost" onClick={() => router.push(`/s/${ensureSessionId()}/voice`)} />
        <Pressable
          ref={menuAnchorRef}
          accessibilityRole="button"
          accessibilityLabel="Session menu"
          {...(webCursor('pointer') as any)}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          onPress={() => {
            if (!session) return;
            if (isDesktop) {
              menuAnchorRef.current?.measureInWindow?.((x: number, y: number, w: number, h: number) => setMenuOpen({ x: x + w - 240, y: y + h }));
            } else {
              setSheetOpen(true);
            }
          }}
        >
          <Text style={{ color: colors.textBody, fontSize: fontSize.body }}>[≡]</Text>
        </Pressable>
      </View>
    </View>
  );

  const msgCount = messages.filter((m) => m.role === 'user' || m.role === 'agent').length;
  const imgCount = messages.filter((m) => m.photos && m.photos.length > 0).length;

  function renderMessage(m: Message) {
    if (m.role === 'user') {
      const dashed = m.status === 'failed' || m.status === 'queued';
      const timeLabel = m.status === 'failed' ? 'NOT SENT' : m.status === 'queued' ? 'QUEUED' : timeHHMMSS(m.createdAt);

      if (m.kind === 'voice' && m.audio) {
        return (
          <UserMessage
            key={m.id}
            time={timeLabel}
            dashed={dashed}
            media={
              <VoiceNote
                duration={mmss(m.audio.durationSec)}
                transcript={m.audio.transcript}
                defaultOpen
                playing={!!playing[m.id]}
                onToggle={() => togglePlay(m.id)}
              />
            }
          />
        );
      }

      if (m.kind === 'photo' && m.photos) {
        return (
          <UserMessage
            key={m.id}
            time={timeLabel}
            dashed={dashed}
            media={
              <View style={{ gap: spacing.sp2 }}>
                {m.photos.map((p, i) => (
                  <ImageFrame
                    key={i}
                    filename={p.name}
                    meta={p.oversized ? fmtBytes(p.bytes) : `${fmtBytes(p.bytes)} · ${p.w}×${p.h}`}
                    progress={p.oversized ? undefined : p.progress}
                    error={!!p.oversized}
                    errorSlot={
                      p.oversized ? (
                        <ErrorLine code="413" retryGlyph="[⇲]" retryLabel="SHRINK & SEND" onRetry={() => store.shrinkAndSend(m.sessionId, m.id)}>
                          over 20 MB.
                        </ErrorLine>
                      ) : undefined
                    }
                  />
                ))}
              </View>
            }
          >
            {m.text}
          </UserMessage>
        );
      }

      return (
        <UserMessage key={m.id} time={timeLabel} dashed={dashed}>
          {m.text}
        </UserMessage>
      );
    }

    // agent
    const streaming = m.status === 'streaming';
    const stopped = m.status === 'stopped';

    if (m.kind === 'photo' && m.photos) {
      return (
        <AgentMessage
          key={m.id}
          time={timeHHMMSS(m.createdAt)}
          media={
            <ImageFrame
              from="agent"
              filename={m.photos[0].name}
              meta={`${fmtBytes(m.photos[0].bytes)} · ${m.photos[0].w}×${m.photos[0].h}`}
              onOpen={() => router.push(`/s/${m.sessionId}/photo/${m.id}/0`)}
            />
          }
          actions={
            <MessageActions
              actions={[
                { glyph: '[↓]', label: 'save', onClick: () => showToast('Saved to gallery') },
                { glyph: '[⧉]', label: 'copy', onClick: () => showToast('Copied') },
                { glyph: '[↻]', label: 'retry', onClick: () => store.retryAgentReply(m.sessionId) },
              ]}
            />
          }
        >
          {m.text}
        </AgentMessage>
      );
    }

    const actions = streaming
      ? undefined
      : stopped
        ? (
            <MessageActions
              actions={[
                { glyph: '[▸]', label: 'continue', accent: true, onClick: () => store.continueStopped(m.sessionId, m.id) },
                { glyph: '[⧉]', label: 'copy', onClick: () => showToast('Copied') },
                { glyph: '[↻]', label: 'retry', onClick: () => store.retryAgentReply(m.sessionId) },
              ]}
            />
          )
        : (
            <MessageActions
              actions={[
                { glyph: '[⧉]', label: 'copy', onClick: () => showToast('Copied') },
                { glyph: '[↻]', label: 'retry', onClick: () => store.retryAgentReply(m.sessionId) },
              ]}
            />
          );

    return (
      <AgentMessage key={m.id} time={timeHHMMSS(m.createdAt)} streaming={streaming} actions={actions}>
        {m.text}
        {stopped && <Text style={{ color: colors.textDisabled }}> — stopped</Text>}
      </AgentMessage>
    );
  }

  const failedUserMsg = messages.find((m) => m.status === 'failed' && m.kind !== 'photo');

  const logContent = (
    <>
      {effectiveId && session && messages.length > 0 && (
        <SystemLine>session {effectiveId} · {new Date(messages[0].createdAt).toDateString()}</SystemLine>
      )}
      {messages.map(renderMessage)}
      {failedUserMsg && (
        <ErrorLine code="503" onRetry={() => store.retryFailedSend(effectiveId!, failedUserMsg.id)}>
          agent unreachable. Your message was kept.
        </ErrorLine>
      )}
      {agentPhase === 'thinking' && <ThinkingIndicator elapsed={`${thinkingElapsed.toFixed(1)}s`} />}
      {rateLimitUntil && <RateLimitBanner secondsLeft={rateLimitLeft} />}
    </>
  );

  const showJumpToLatest = agentPhase === 'streaming' && !atBottom;

  const composerArea =
    recorder === 'holding' ? (
      <PushToTalkBar elapsedSec={holdElapsed} onCancel={cancelPushToTalk} onLock={() => { if (holdTimerRef.current) clearInterval(holdTimerRef.current); setRecorder('locked'); }} />
    ) : recorder === 'locked' ? (
      <RecordingBar onCancel={() => setRecorder('idle')} onSend={(sec) => { setRecorder('idle'); sendVoiceNote(sec); }} />
    ) : (
      <Composer
        value={composerText}
        onChange={setComposerText}
        onSend={handleSend}
        onAttach={handleAttach}
        onMic={isDesktop ? () => setRecorder('locked') : undefined}
        onMicPressIn={isDesktop ? undefined : armPushToTalk}
        onMicPressOut={isDesktop ? undefined : releasePushToTalk}
        onStop={() => effectiveId && store.stopStreaming(effectiveId)}
        busy={busy}
        actionsDisabled={!canSend}
        placeholder={!canSend ? `you can type · sends in ${mmss(rateLimitLeft)}` : attachments.length > 0 ? 'add a caption' : 'message'}
        hasAttachments={attachments.length > 0}
        tray={attachments.length > 0 ? <AttachmentTray items={attachments} onRemove={removeAttachment} onAdd={handleAttach} /> : null}
      />
    );

  const newSessionBody = (
    <View style={{ flex: 1, justifyContent: isDesktop ? 'center' : 'flex-end', padding: isDesktop ? spacing.sp8 : spacing.sp4 }}>
      <EmptyState
        title="READY_"
        titleSize={isDesktop ? fontSize.display : fontSize.displayMobile}
        body="Ask by text, hold the mic for voice, or send a photo."
        actions={
          <>
            {SUGGESTIONS.map((s, i) => (
              <Pressable
                key={i}
                onPress={() => handleSend(s.label)}
                {...(webCursor('pointer') as any)}
                style={{ borderWidth: 1, borderColor: colors.borderDefault, padding: spacing.sp3, flexDirection: 'row', gap: spacing.sp2 }}
              >
                <Text style={{ color: colors.textAccent, fontSize: fontSize.small }}>{s.glyph}</Text>
                <Text style={{ color: colors.textBody, fontSize: fontSize.small }}>{s.label}</Text>
              </Pressable>
            ))}
          </>
        }
      />
    </View>
  );

  const column = (
    <View style={{ flex: 1, position: 'relative' }} {...dropHandlers}>
      <View style={{ flex: 1, flexDirection: 'column', width: '100%', maxWidth: isDesktop ? layout.chatMax : undefined, alignSelf: isDesktop ? 'center' : undefined }}>
        {header}

        {!effectiveId ? (
          newSessionBody
        ) : (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: spacing.sp4, gap: layout.messageGap, flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled"
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              const distance = contentSize.height - contentOffset.y - layoutMeasurement.height;
              setAtBottom(distance < 40);
            }}
            scrollEventThrottle={100}
          >
            {logContent}
          </ScrollView>
        )}

        {showJumpToLatest && (
          <Pressable onPress={() => scrollToEnd()} {...(webCursor('pointer') as any)} style={{ alignSelf: 'center', marginBottom: spacing.sp2 }}>
            <View style={{ borderWidth: 1, borderColor: colors.borderInput, paddingVertical: 8, paddingHorizontal: 14 }}>
              <Text style={{ color: colors.textBody, fontSize: fontSize.small }}>[↓] jump to latest</Text>
            </View>
          </Pressable>
        )}

        {composerArea}

        {isDesktop && (
          <StatusBar
            items={[
              store.state.net === 'online' ? '● CONNECTED' : '○ OFFLINE',
              `${displayId} · ${msgCount} MSGS${imgCount ? ` · ${imgCount} IMG` : ''}`,
              `CRT:STANDARD · ${timeHHMMSS(clock)}`,
            ]}
          />
        )}
      </View>

      {dropState && (
        <DropOverlay state={dropState} message="4 files · JPG, PNG, HEIC, WEBP · max 20 MB each · 4 per message" />
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column', paddingTop: Platform.OS === 'ios' ? insets.top : 0, paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0 }}>
      {isDesktop && <Sidebar activeSessionId={effectiveId} />}
      {column}

      {toast && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: recorder !== 'idle' ? 130 : 90, alignItems: 'center', paddingHorizontal: spacing.sp4 }}>
          <View style={{ maxWidth: 420, width: '100%' }}>
            <Toast kind="info" onClose={() => setToast(null)}>
              {toast}
            </Toast>
          </View>
        </View>
      )}

      {session && (
        <>
          <ActionSheet
            visible={sheetOpen}
            onClose={() => setSheetOpen(false)}
            header={
              <>
                <Text style={{ color: colors.textMeta, fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label), textTransform: 'uppercase' }}>
                  SESSION {session.id}
                </Text>
                <Text style={{ color: colors.textMeta, fontSize: fontSize.label }}>{messages.length} MSGS</Text>
              </>
            }
            items={sessionMenuItems()}
          />
          <ContextMenu visible={!!menuOpen} onClose={() => setMenuOpen(null)} x={menuOpen?.x ?? 0} y={menuOpen?.y ?? 0} items={sessionMenuItems()} />
          {confirmingDelete && (
            <DeleteConfirmSheet
              visible
              sessionId={session.id}
              title={session.title ?? 'New session'}
              messageCount={messages.length}
              voiceCount={messages.filter((m) => m.kind === 'voice').length}
              centered={isDesktop}
              onCancel={() => setConfirmingDelete(false)}
              onConfirm={() => {
                store.requestDelete(session.id);
                setConfirmingDelete(false);
                router.push('/sessions');
              }}
            />
          )}
        </>
      )}
    </View>
  );
}
