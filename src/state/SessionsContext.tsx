import React from 'react';
import {
  AGENT_REPLIES,
  SEED_MESSAGES,
  SEED_SESSIONS,
  hexId,
  uid,
} from '../data/mock';
import { AgentPhase, Message, MessagePhoto, NetStatus, Session } from '../data/types';

interface PendingDelete {
  session: Session;
  expiresAt: number;
}

interface State {
  sessions: Record<string, Session>;
  messages: Record<string, Message[]>;
  agentPhase: Record<string, AgentPhase>;
  net: NetStatus;
  reconnectSeconds: Record<string, number | undefined>;
  rateLimitUntil: Record<string, number | undefined>;
  pendingDelete?: PendingDelete;
}

type Action =
  | { type: 'UPSERT_SESSION'; session: Session }
  | { type: 'PATCH_SESSION'; id: string; patch: Partial<Session> }
  | { type: 'REMOVE_SESSION'; id: string }
  | { type: 'SET_PENDING_DELETE'; value?: PendingDelete }
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'PATCH_MESSAGE'; sessionId: string; id: string; patch: Partial<Message> }
  | { type: 'SET_AGENT_PHASE'; sessionId: string; phase: AgentPhase }
  | { type: 'SET_NET'; net: NetStatus }
  | { type: 'SET_RECONNECT'; sessionId: string; seconds?: number }
  | { type: 'SET_RATE_LIMIT'; sessionId: string; until?: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'UPSERT_SESSION':
      return { ...state, sessions: { ...state.sessions, [action.session.id]: action.session } };
    case 'PATCH_SESSION': {
      const existing = state.sessions[action.id];
      if (!existing) return state;
      return { ...state, sessions: { ...state.sessions, [action.id]: { ...existing, ...action.patch } } };
    }
    case 'REMOVE_SESSION': {
      const sessions = { ...state.sessions };
      delete sessions[action.id];
      const messages = { ...state.messages };
      delete messages[action.id];
      return { ...state, sessions, messages };
    }
    case 'SET_PENDING_DELETE':
      return { ...state, pendingDelete: action.value };
    case 'ADD_MESSAGE': {
      const list = state.messages[action.message.sessionId] ?? [];
      return { ...state, messages: { ...state.messages, [action.message.sessionId]: [...list, action.message] } };
    }
    case 'PATCH_MESSAGE': {
      const list = state.messages[action.sessionId];
      if (!list) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.sessionId]: list.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m)),
        },
      };
    }
    case 'SET_AGENT_PHASE':
      return { ...state, agentPhase: { ...state.agentPhase, [action.sessionId]: action.phase } };
    case 'SET_NET':
      return { ...state, net: action.net };
    case 'SET_RECONNECT':
      return { ...state, reconnectSeconds: { ...state.reconnectSeconds, [action.sessionId]: action.seconds } };
    case 'SET_RATE_LIMIT':
      return { ...state, rateLimitUntil: { ...state.rateLimitUntil, [action.sessionId]: action.until } };
    default:
      return state;
  }
}

function initialState(): State {
  const sessions: Record<string, Session> = {};
  SEED_SESSIONS.forEach((s) => {
    sessions[s.id] = s;
  });
  const messages: Record<string, Message[]> = {};
  SEED_MESSAGES.forEach((m) => {
    if (!messages[m.sessionId]) messages[m.sessionId] = [];
    messages[m.sessionId].push(m);
  });
  return { sessions, messages, agentPhase: {}, net: 'online', reconnectSeconds: {}, rateLimitUntil: {} };
}

const OVERSIZED_BYTES = 20 * 1024 * 1024;
const RATE_LIMIT_MS = 24_000;
const RECONNECT_STEPS = [1, 2, 4, 8, 16];

export interface SessionsStore {
  state: State;
  sortedSessions: Session[];
  createSession: (id?: string) => string;
  renameSession: (id: string, title: string) => void;
  togglePin: (id: string) => void;
  markRead: (id: string) => void;
  requestDelete: (id: string) => void;
  undoDelete: () => void;
  toggleNet: () => void;
  retryReconnect: () => void;
  sendText: (sessionId: string, text: string) => void;
  sendVoice: (sessionId: string, durationSec: number, transcript: string) => void;
  sendPhotos: (sessionId: string, files: { name: string; bytes: number; w: number; h: number }[], caption?: string) => void;
  shrinkAndSend: (sessionId: string, messageId: string) => void;
  retryFailedSend: (sessionId: string, messageId: string) => void;
  stopStreaming: (sessionId: string) => void;
  continueStopped: (sessionId: string, messageId: string) => void;
  retryAgentReply: (sessionId: string) => void;
}

const SessionsReactContext = React.createContext<SessionsStore | null>(null);

export function SessionsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, initialState);
  const fullTextRef = React.useRef<Record<string, string>>({});
  const streamIntervalRef = React.useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const replyCursor = React.useRef(0);
  const sendHistoryRef = React.useRef<Record<string, number[]>>({});
  const purgeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const after = React.useCallback((fn: () => void, ms: number) => {
    const handle = setTimeout(fn, ms);
    timeoutsRef.current.push(handle);
    return handle;
  }, []);

  React.useEffect(
    () => () => {
      timeoutsRef.current.forEach(clearTimeout);
      Object.values(streamIntervalRef.current).forEach(clearInterval);
      if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);
    },
    [],
  );

  const touchSession = React.useCallback((sessionId: string, patch: Partial<Session>) => {
    dispatch({ type: 'PATCH_SESSION', id: sessionId, patch: { updatedAt: Date.now(), ...patch } });
  }, []);

  const beginStream = React.useCallback(
    (sessionId: string, fullText: string) => {
      const msgId = uid('a');
      fullTextRef.current[msgId] = fullText;
      dispatch({
        type: 'ADD_MESSAGE',
        message: { id: msgId, sessionId, role: 'agent', kind: 'text', status: 'streaming', text: '', createdAt: Date.now() },
      });
      dispatch({ type: 'SET_AGENT_PHASE', sessionId, phase: 'streaming' });

      let i = 0;
      const iv = setInterval(() => {
        i += 1;
        dispatch({ type: 'PATCH_MESSAGE', sessionId, id: msgId, patch: { text: fullText.slice(0, i) } });
        if (i >= fullText.length) {
          clearInterval(iv);
          delete streamIntervalRef.current[msgId];
          dispatch({ type: 'PATCH_MESSAGE', sessionId, id: msgId, patch: { status: 'done', createdAt: Date.now() } });
          dispatch({ type: 'SET_AGENT_PHASE', sessionId, phase: 'idle' });
          touchSession(sessionId, { lastMsg: { kind: 'text', text: fullText } });
        }
      }, 28);
      streamIntervalRef.current[msgId] = iv;
      return msgId;
    },
    [touchSession],
  );

  // Session titles for new sessions are derived once the first agent reply completes;
  // see the effect below watching `state.messages`.

  const triggerReconnectBackoff = React.useCallback((sessionId: string) => {
    let step = 0;
    const tick = () => {
      if (step >= RECONNECT_STEPS.length) {
        dispatch({ type: 'SET_RECONNECT', sessionId, seconds: undefined });
        return;
      }
      let secondsLeft = RECONNECT_STEPS[step];
      dispatch({ type: 'SET_RECONNECT', sessionId, seconds: secondsLeft });
      const everySecond = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft <= 0) {
          clearInterval(everySecond);
          step += 1;
          tick();
        } else {
          dispatch({ type: 'SET_RECONNECT', sessionId, seconds: secondsLeft });
        }
      }, 1000);
    };
    tick();
  }, []);

  const runAgentTurn = React.useCallback(
    (sessionId: string, triggerText: string, opts?: { replyWithPhoto?: boolean; relatedUserMsgId?: string }) => {
      dispatch({ type: 'SET_AGENT_PHASE', sessionId, phase: 'thinking' });
      after(() => {
        const forces503 = /\b(503|error|offline)\b/i.test(triggerText);
        const randomFail = !forces503 && Math.random() < 0.08;
        if (forces503 || randomFail) {
          dispatch({ type: 'SET_AGENT_PHASE', sessionId, phase: 'idle' });
          if (opts?.relatedUserMsgId) {
            dispatch({
              type: 'PATCH_MESSAGE',
              sessionId,
              id: opts.relatedUserMsgId,
              patch: { status: 'failed', error: { code: 503 } },
            });
          }
          triggerReconnectBackoff(sessionId);
          return;
        }

        if (opts?.replyWithPhoto) {
          dispatch({
            type: 'ADD_MESSAGE',
            message: {
              id: uid('a'),
              sessionId,
              role: 'agent',
              kind: 'photo',
              status: 'done',
              createdAt: Date.now(),
              text: 'I lifted the shadows and straightened the horizon. Want a square crop too?',
              photos: [{ name: 'IMG_0142_EDIT.JPG', bytes: 1.9 * 1024 * 1024, w: 4032, h: 3024 }],
            },
          });
          dispatch({ type: 'SET_AGENT_PHASE', sessionId, phase: 'idle' });
          touchSession(sessionId, { lastMsg: { kind: 'photo', text: 'I lifted the shadows and straightened the horizon.' } });
          return;
        }

        replyCursor.current = (replyCursor.current + 1) % AGENT_REPLIES.length;
        beginStream(sessionId, AGENT_REPLIES[replyCursor.current]);
      }, 900 + Math.round(Math.random() * 500));
    },
    [after, beginStream, touchSession, triggerReconnectBackoff],
  );

  const noteSend = React.useCallback((sessionId: string): boolean => {
    const now = Date.now();
    const hist = (sendHistoryRef.current[sessionId] ?? []).filter((ts) => now - ts < 8000);
    hist.push(now);
    sendHistoryRef.current[sessionId] = hist;
    return hist.length >= 4;
  }, []);

  const flushRateLimit = React.useCallback(
    (sessionId: string, queuedMessageId: string, text: string) => {
      dispatch({ type: 'PATCH_MESSAGE', sessionId, id: queuedMessageId, patch: { status: 'sent' } });
      touchSession(sessionId, { lastMsg: { kind: 'text', text } });
      runAgentTurn(sessionId, text, { relatedUserMsgId: queuedMessageId });
    },
    [runAgentTurn, touchSession],
  );

  const enterRateLimit = React.useCallback(
    (sessionId: string, queuedMessageId: string, text: string) => {
      const until = Date.now() + RATE_LIMIT_MS;
      dispatch({ type: 'SET_RATE_LIMIT', sessionId, until });
      after(() => {
        dispatch({ type: 'SET_RATE_LIMIT', sessionId, until: undefined });
        flushRateLimit(sessionId, queuedMessageId, text);
      }, RATE_LIMIT_MS);
    },
    [after, flushRateLimit],
  );

  const createSession = React.useCallback((explicitId?: string): string => {
    const id = explicitId ?? hexId();
    dispatch({
      type: 'UPSERT_SESSION',
      session: { id, title: null, pinned: false, updatedAt: Date.now(), unread: false, lastMsg: { kind: 'text', text: '' } },
    });
    return id;
  }, []);

  const sendText = React.useCallback(
    (sessionId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (state.rateLimitUntil[sessionId] && state.rateLimitUntil[sessionId]! > Date.now()) return;

      const id = uid('u');
      const spamming = noteSend(sessionId);

      if (state.net === 'offline') {
        dispatch({ type: 'ADD_MESSAGE', message: { id, sessionId, role: 'user', kind: 'text', text: trimmed, status: 'queued', createdAt: Date.now() } });
        touchSession(sessionId, { lastMsg: { kind: 'text', text: `You: ${trimmed}` } });
        return;
      }

      if (spamming || /\b(429|rate|too many)\b/i.test(trimmed)) {
        dispatch({ type: 'ADD_MESSAGE', message: { id, sessionId, role: 'user', kind: 'text', text: trimmed, status: 'queued', createdAt: Date.now() } });
        enterRateLimit(sessionId, id, trimmed);
        return;
      }

      dispatch({ type: 'ADD_MESSAGE', message: { id, sessionId, role: 'user', kind: 'text', text: trimmed, status: 'sending', createdAt: Date.now() } });
      after(() => dispatch({ type: 'PATCH_MESSAGE', sessionId, id, patch: { status: 'sent' } }), 150);
      touchSession(sessionId, { lastMsg: { kind: 'text', text: `You: ${trimmed}` } });
      runAgentTurn(sessionId, trimmed, { relatedUserMsgId: id });
    },
    [after, enterRateLimit, noteSend, runAgentTurn, state.net, state.rateLimitUntil, touchSession],
  );

  const sendVoice = React.useCallback(
    (sessionId: string, durationSec: number, transcript: string) => {
      const id = uid('u');
      dispatch({
        type: 'ADD_MESSAGE',
        message: { id, sessionId, role: 'user', kind: 'voice', status: 'sent', createdAt: Date.now(), audio: { durationSec, transcript } },
      });
      touchSession(sessionId, { lastMsg: { kind: 'voice', text: transcript } });
      runAgentTurn(sessionId, transcript, { relatedUserMsgId: id });
    },
    [runAgentTurn, touchSession],
  );

  const sendPhotos = React.useCallback(
    (sessionId: string, files: { name: string; bytes: number; w: number; h: number }[], caption?: string) => {
      const id = uid('u');
      const oversized = files.some((f) => f.bytes > OVERSIZED_BYTES);
      const photos: MessagePhoto[] = files.map((f) => ({ ...f, progress: oversized ? 100 : 0, oversized: f.bytes > OVERSIZED_BYTES }));

      dispatch({
        type: 'ADD_MESSAGE',
        message: {
          id,
          sessionId,
          role: 'user',
          kind: 'photo',
          text: caption,
          photos,
          status: oversized ? 'failed' : 'sending',
          createdAt: Date.now(),
          error: oversized ? { code: 413 } : undefined,
        },
      });

      if (oversized) return;

      let pct = 0;
      const iv = setInterval(() => {
        pct = Math.min(100, pct + 12 + Math.random() * 10);
        dispatch({
          type: 'PATCH_MESSAGE',
          sessionId,
          id,
          patch: { photos: photos.map((p) => ({ ...p, progress: Math.round(pct) })) },
        });
        if (pct >= 100) {
          clearInterval(iv);
          dispatch({ type: 'PATCH_MESSAGE', sessionId, id, patch: { status: 'sent', photos: photos.map((p) => ({ ...p, progress: 100 })) } });
          touchSession(sessionId, { lastMsg: { kind: 'photo', text: caption || 'Photo' } });
          runAgentTurn(sessionId, caption || 'photo', { replyWithPhoto: true, relatedUserMsgId: id });
        }
      }, 220);
    },
    [runAgentTurn, touchSession],
  );

  const shrinkAndSend = React.useCallback(
    (sessionId: string, messageId: string) => {
      const list = state.messages[sessionId] ?? [];
      const msg = list.find((m) => m.id === messageId);
      if (!msg || !msg.photos) return;
      const photos = msg.photos.map((p) => ({ ...p, bytes: Math.min(p.bytes, 2.1 * 1024 * 1024), oversized: false, progress: 100 }));
      dispatch({ type: 'PATCH_MESSAGE', sessionId, id: messageId, patch: { status: 'sent', error: undefined, photos } });
      touchSession(sessionId, { lastMsg: { kind: 'photo', text: msg.text || 'Photo' } });
      runAgentTurn(sessionId, msg.text || 'photo', { replyWithPhoto: true, relatedUserMsgId: messageId });
    },
    [runAgentTurn, state.messages, touchSession],
  );

  const retryFailedSend = React.useCallback(
    (sessionId: string, messageId: string) => {
      const list = state.messages[sessionId] ?? [];
      const msg = list.find((m) => m.id === messageId);
      if (!msg) return;
      dispatch({ type: 'PATCH_MESSAGE', sessionId, id: messageId, patch: { status: 'sending', error: undefined } });
      dispatch({ type: 'SET_RECONNECT', sessionId, seconds: undefined });
      after(() => {
        dispatch({ type: 'PATCH_MESSAGE', sessionId, id: messageId, patch: { status: 'sent' } });
        runAgentTurn(sessionId, msg.text || '', { relatedUserMsgId: messageId });
      }, 250);
    },
    [after, runAgentTurn, state.messages],
  );

  const stopStreaming = React.useCallback(
    (sessionId: string) => {
      const list = state.messages[sessionId] ?? [];
      const streaming = list.find((m) => m.status === 'streaming');
      if (!streaming) return;
      const iv = streamIntervalRef.current[streaming.id];
      if (iv) clearInterval(iv);
      delete streamIntervalRef.current[streaming.id];
      dispatch({ type: 'PATCH_MESSAGE', sessionId, id: streaming.id, patch: { status: 'stopped' } });
      dispatch({ type: 'SET_AGENT_PHASE', sessionId, phase: 'idle' });
    },
    [state.messages],
  );

  const continueStopped = React.useCallback(
    (sessionId: string, messageId: string) => {
      const full = fullTextRef.current[messageId];
      const list = state.messages[sessionId] ?? [];
      const msg = list.find((m) => m.id === messageId);
      if (!full || !msg) return;
      let i = (msg.text ?? '').length;
      dispatch({ type: 'PATCH_MESSAGE', sessionId, id: messageId, patch: { status: 'streaming' } });
      dispatch({ type: 'SET_AGENT_PHASE', sessionId, phase: 'streaming' });
      const iv = setInterval(() => {
        i += 1;
        dispatch({ type: 'PATCH_MESSAGE', sessionId, id: messageId, patch: { text: full.slice(0, i) } });
        if (i >= full.length) {
          clearInterval(iv);
          delete streamIntervalRef.current[messageId];
          dispatch({ type: 'PATCH_MESSAGE', sessionId, id: messageId, patch: { status: 'done' } });
          dispatch({ type: 'SET_AGENT_PHASE', sessionId, phase: 'idle' });
        }
      }, 28);
      streamIntervalRef.current[messageId] = iv;
    },
    [state.messages],
  );

  const retryAgentReply = React.useCallback(
    (sessionId: string) => {
      replyCursor.current = (replyCursor.current + 1) % AGENT_REPLIES.length;
      runAgentTurn(sessionId, AGENT_REPLIES[replyCursor.current]);
    },
    [runAgentTurn],
  );

  const renameSession = React.useCallback((id: string, title: string) => {
    dispatch({ type: 'PATCH_SESSION', id, patch: { title: title.trim() || null } });
  }, []);

  const togglePin = React.useCallback(
    (id: string) => {
      const s = state.sessions[id];
      if (!s) return;
      dispatch({ type: 'PATCH_SESSION', id, patch: { pinned: !s.pinned } });
    },
    [state.sessions],
  );

  const markRead = React.useCallback((id: string) => {
    dispatch({ type: 'PATCH_SESSION', id, patch: { unread: false } });
  }, []);

  const requestDelete = React.useCallback(
    (id: string) => {
      const session = state.sessions[id];
      if (!session) return;
      const expiresAt = Date.now() + 10_000;
      dispatch({ type: 'SET_PENDING_DELETE', value: { session, expiresAt } });
      dispatch({ type: 'PATCH_SESSION', id, patch: { deletedAt: Date.now() } });
      if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);
      purgeTimerRef.current = setTimeout(() => {
        dispatch({ type: 'REMOVE_SESSION', id });
        dispatch({ type: 'SET_PENDING_DELETE', value: undefined });
      }, 10_000);
    },
    [state.sessions],
  );

  const undoDelete = React.useCallback(() => {
    if (!state.pendingDelete) return;
    if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);
    dispatch({ type: 'PATCH_SESSION', id: state.pendingDelete.session.id, patch: { deletedAt: undefined } });
    dispatch({ type: 'SET_PENDING_DELETE', value: undefined });
  }, [state.pendingDelete]);

  const toggleNet = React.useCallback(() => {
    const next = state.net === 'online' ? 'offline' : 'online';
    dispatch({ type: 'SET_NET', net: next });
    if (next === 'online') {
      Object.entries(state.messages).forEach(([sessionId, list]) => {
        const queued = list.filter((m) => m.status === 'queued');
        queued.forEach((m) => {
          dispatch({ type: 'PATCH_MESSAGE', sessionId, id: m.id, patch: { status: 'sent' } });
        });
        const last = queued[queued.length - 1];
        if (last) runAgentTurn(sessionId, last.text ?? '', { relatedUserMsgId: last.id });
      });
    }
  }, [runAgentTurn, state.messages, state.net]);

  const retryReconnect = React.useCallback(() => {
    dispatch({ type: 'SET_NET', net: 'online' });
  }, []);

  React.useEffect(() => {
    Object.entries(state.sessions).forEach(([id, session]) => {
      if (session.title !== null) return;
      const list = state.messages[id] ?? [];
      const firstUser = list.find((m) => m.role === 'user');
      const hasDoneAgent = list.some((m) => m.role === 'agent' && m.status === 'done');
      if (firstUser && hasDoneAgent) {
        const base = firstUser.text || (firstUser.kind === 'voice' ? firstUser.audio?.transcript : undefined) || 'Photo';
        const title = base.length > 40 ? `${base.slice(0, 40)}…` : base;
        dispatch({ type: 'PATCH_SESSION', id, patch: { title } });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages]);

  const sortedSessions = React.useMemo(() => {
    return Object.values(state.sessions)
      .filter((s) => !s.deletedAt)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [state.sessions]);

  const value = React.useMemo<SessionsStore>(
    () => ({
      state,
      sortedSessions,
      createSession,
      renameSession,
      togglePin,
      markRead,
      requestDelete,
      undoDelete,
      toggleNet,
      retryReconnect,
      sendText,
      sendVoice,
      sendPhotos,
      shrinkAndSend,
      retryFailedSend,
      stopStreaming,
      continueStopped,
      retryAgentReply,
    }),
    [
      state,
      sortedSessions,
      createSession,
      renameSession,
      togglePin,
      markRead,
      requestDelete,
      undoDelete,
      toggleNet,
      retryReconnect,
      sendText,
      sendVoice,
      sendPhotos,
      shrinkAndSend,
      retryFailedSend,
      stopStreaming,
      continueStopped,
      retryAgentReply,
    ],
  );

  return <SessionsReactContext.Provider value={value}>{children}</SessionsReactContext.Provider>;
}

export function useSessionsStore(): SessionsStore {
  const ctx = React.useContext(SessionsReactContext);
  if (!ctx) throw new Error('useSessionsStore must be used within SessionsProvider');
  return ctx;
}
