import React from 'react';
import { Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Wordmark } from '../components/Wordmark';
import { Text } from '../design-system/internal/Text';
import {
  AgentMessage,
  AttachmentItem,
  AttachmentTray,
  CodeBlock,
  Composer,
  ErrorLine,
  IconButton,
  ImageFrame,
  MessageActions,
  RecordingBar,
  StatusBar,
  SystemLine,
  ThinkingIndicator,
  Toast,
  UserMessage,
  VoiceNote,
  colors,
  em,
  fontSize,
  layout,
  spacing,
  tracking,
} from '../design-system';

type Message =
  | { id: string; kind: 'system'; text: string }
  | { id: string; kind: 'user'; time: string; text?: string; voice?: { duration: string; transcript: string }; image?: { filename: string; meta?: string; progress?: number } }
  | { id: string; kind: 'agent'; time?: string; text?: string; streaming?: boolean; code?: { language: string; code: string }; voice?: { duration: string }; image?: { filename: string; meta?: string } }
  | { id: string; kind: 'thinking' }
  | { id: string; kind: 'error'; code?: string; text: string };

let seq = 0;
const uid = () => `m${++seq}`;
const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const REPLIES = [
  "Noted. I'll keep that in mind.",
  'Done. Anything else?',
  "Got it — give me a second next time you need this.",
  'That should do it. Let me know how it goes.',
];

const SESSIONS = [
  { id: '0x3F2A', title: 'Kettle descaling', time: '14:02' },
  { id: '0x19B7', title: 'Mushroom ID', time: 'Yesterday' },
  { id: '0x0C41', title: 'Listing photos', time: 'Mon' },
];

function seedMessages(): Message[] {
  return [
    { id: uid(), kind: 'system', text: 'SESSION 0x3F2A · TODAY 14:02' },
    { id: uid(), kind: 'user', time: '14:02:11', text: "What's the fastest way to descale a kettle?" },
    {
      id: uid(),
      kind: 'agent',
      time: '14:02:13',
      text: 'Fill it halfway with equal parts white vinegar and water, boil, then let it sit for 20 minutes. Rinse twice with plain water before using it again.',
    },
    {
      id: uid(),
      kind: 'agent',
      code: { language: 'shell', code: '$ convert IMG_0142.JPG -resize 1080 out.png' },
    },
    { id: uid(), kind: 'user', time: '14:05:40', voice: { duration: '0:12', transcript: 'Is this mushroom safe to eat?' } },
    { id: uid(), kind: 'agent', time: '14:05:43', text: "Yes — that's a chanterelle.", voice: { duration: '0:14' } },
    { id: uid(), kind: 'error', code: '503', text: 'agent unreachable. Your message was kept.' },
  ];
}

function Header({ title, onHandsFree, isDesktop }: { title: string; onHandsFree: () => void; isDesktop: boolean }) {
  return (
    <View
      style={{
        height: layout.headerH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.sp4,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDefault,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp3, flexShrink: 1, minWidth: 0 }}>
        <Wordmark size={fontSize.timer} />
        <Text style={{ color: colors.statusOk, fontSize: fontSize.label, letterSpacing: em(fontSize.label, tracking.label), textTransform: 'uppercase' }}>
          ● ONLINE
        </Text>
        <Text numberOfLines={1} style={{ color: colors.textMeta, fontSize: fontSize.small, flexShrink: 1 }}>
          / {title}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sp3 }}>
        {isDesktop && <Text style={{ color: colors.textMeta, fontSize: fontSize.small }}>{'>'} crt:standard</Text>}
        <IconButton icon="wave" label="Hands-free mode" onClick={onHandsFree} />
      </View>
    </View>
  );
}

function Sidebar({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <View style={{ width: layout.sidebarW, borderRightWidth: 1, borderRightColor: colors.borderDefault, paddingVertical: spacing.sp4 }}>
      <Text
        style={{
          color: colors.textMeta,
          fontSize: fontSize.label,
          letterSpacing: em(fontSize.label, tracking.label),
          textTransform: 'uppercase',
          paddingHorizontal: spacing.sp4,
          marginBottom: spacing.sp3,
        }}
      >
        Sessions
      </Text>
      {SESSIONS.map((s) => {
        const active = s.id === activeId;
        return (
          <Pressable
            key={s.id}
            onPress={() => onSelect(s.id)}
            style={{ paddingVertical: spacing.sp3, paddingHorizontal: spacing.sp4, backgroundColor: active ? colors.surfaceSelected : 'transparent' }}
          >
            <Text style={{ color: active ? colors.textAccent : colors.textBody, fontSize: fontSize.small }} numberOfLines={1}>
              {s.title}
            </Text>
            <Text style={{ color: colors.textMeta, fontSize: fontSize.meta, marginTop: 2 }}>
              {s.id} · {s.time}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ChatScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isDesktop = width >= layout.bpDesktop;

  const [messages, setMessages] = React.useState<Message[]>(seedMessages);
  const [composerText, setComposerText] = React.useState('');
  const [attachments, setAttachments] = React.useState<AttachmentItem[]>([]);
  const [recording, setRecording] = React.useState(false);
  const [activeSession, setActiveSession] = React.useState(SESSIONS[0].id);
  const [toast, setToast] = React.useState<string | null>(null);
  const [playing, setPlaying] = React.useState<Record<string, boolean>>({});
  const scrollRef = React.useRef<ScrollView>(null);
  const replyIndex = React.useRef(0);

  const scrollToEnd = React.useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  React.useEffect(scrollToEnd, [messages.length, scrollToEnd]);

  function appendAgentReply() {
    const thinkingId = uid();
    setMessages((m) => [...m, { id: thinkingId, kind: 'thinking' }]);

    setTimeout(() => {
      const full = REPLIES[replyIndex.current % REPLIES.length];
      replyIndex.current += 1;
      const streamId = uid();
      setMessages((m) => m.filter((x) => x.id !== thinkingId).concat({ id: streamId, kind: 'agent', streaming: true, text: '' }));

      let i = 0;
      const iv = setInterval(() => {
        i += 1;
        setMessages((m) => m.map((x) => (x.id === streamId ? { ...x, text: full.slice(0, i) } : x)));
        scrollToEnd();
        if (i >= full.length) {
          clearInterval(iv);
          setMessages((m) => m.map((x) => (x.id === streamId ? { ...x, streaming: false, time: nowTime() } : x)));
        }
      }, 30);
    }, 900);
  }

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    const id = uid();
    const image = attachments[0] ? { filename: 'IMG_0143.JPG', meta: '3.1 MB' } : undefined;
    setMessages((m) => [...m, { id, kind: 'user', time: nowTime(), text: trimmed || undefined, image }]);
    setComposerText('');
    setAttachments([]);
    appendAgentReply();
  }

  function handleAttach() {
    setAttachments((a) => (a.length >= 4 ? a : [...a, { name: `IMG_0${140 + a.length}.JPG` }]));
  }

  function handleMicSend(seconds: number) {
    setRecording(false);
    const duration = `0:${String(seconds).padStart(2, '0')}`;
    setMessages((m) => [...m, { id: uid(), kind: 'user', time: nowTime(), voice: { duration, transcript: '…' } }]);
    appendAgentReply();
  }

  function togglePlay(id: string) {
    setPlaying((p) => ({ ...p, [id]: !p[id] }));
  }

  function dismissError(id: string) {
    setMessages((m) => m.filter((x) => x.id !== id));
    setToast('Photo saved to gallery');
    setTimeout(() => setToast(null), 3000);
  }

  const msgCount = messages.filter((m) => m.kind === 'user' || m.kind === 'agent').length;
  const imgCount = messages.filter((m) => (m.kind === 'user' || m.kind === 'agent') && 'image' in m && m.image).length;

  const column = (
    <View style={{ flex: 1, flexDirection: 'column', width: '100%', maxWidth: isDesktop ? layout.chatMax : undefined, alignSelf: isDesktop ? 'center' : undefined }}>
      <Header
        title={SESSIONS.find((s) => s.id === activeSession)?.title ?? 'Chat'}
        onHandsFree={() => router.push('/hands-free')}
        isDesktop={isDesktop}
      />

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.sp4, gap: layout.messageGap }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m) => {
          if (m.kind === 'system') return <SystemLine key={m.id}>{m.text}</SystemLine>;
          if (m.kind === 'thinking') return <ThinkingIndicator key={m.id} elapsed="1.4s" />;
          if (m.kind === 'error')
            return (
              <ErrorLine key={m.id} code={m.code} onRetry={() => dismissError(m.id)}>
                {m.text}
              </ErrorLine>
            );
          if (m.kind === 'user') {
            const media = m.voice ? (
              <VoiceNote duration={m.voice.duration} transcript={m.voice.transcript} playing={!!playing[m.id]} onToggle={() => togglePlay(m.id)} />
            ) : m.image ? (
              <ImageFrame filename={m.image.filename} meta={m.image.meta} progress={m.image.progress} />
            ) : undefined;
            return (
              <UserMessage key={m.id} time={m.time} media={media}>
                {m.text}
              </UserMessage>
            );
          }
          const media = m.code ? (
            <CodeBlock language={m.code.language} code={m.code.code} />
          ) : m.voice ? (
            <VoiceNote from="agent" duration={m.voice.duration} playing={!!playing[m.id]} onToggle={() => togglePlay(m.id)} />
          ) : m.image ? (
            <ImageFrame from="agent" filename={m.image.filename} meta={m.image.meta} />
          ) : undefined;
          return (
            <AgentMessage key={m.id} time={m.time} streaming={m.streaming} media={media} actions={m.streaming ? undefined : <MessageActions />}>
              {m.text}
            </AgentMessage>
          );
        })}
      </ScrollView>

      {recording ? (
        <RecordingBar onCancel={() => setRecording(false)} onSend={handleMicSend} />
      ) : (
        <Composer
          value={composerText}
          onChange={setComposerText}
          onSend={handleSend}
          onAttach={handleAttach}
          onMic={() => setRecording(true)}
          tray={attachments.length ? <AttachmentTray items={attachments} onRemove={(i) => setAttachments((a) => a.filter((_, idx) => idx !== i))} onAdd={handleAttach} /> : null}
        />
      )}

      {isDesktop && <StatusBar items={['READY', `${msgCount} MSG · ${imgCount} IMG`, '● ONLINE']} />}
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        flexDirection: isDesktop ? 'row' : 'column',
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
      }}
    >
      {isDesktop && <Sidebar activeId={activeSession} onSelect={setActiveSession} />}
      {column}
      {toast && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: recording ? 90 : 74, alignItems: 'center', paddingHorizontal: spacing.sp4 }}>
          <View style={{ maxWidth: 420, width: '100%' }}>
            <Toast kind="ok" onClose={() => setToast(null)}>
              {toast}
            </Toast>
          </View>
        </View>
      )}
    </View>
  );
}
