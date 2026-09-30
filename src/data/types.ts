// Mirrors the state model in handoff/docs/CHAT_SCREENS.md — no network layer, all
// mutations are local and simulated (see state/SessionsContext.tsx).

export type MessageKind = 'text' | 'voice' | 'photo';

export interface Session {
  id: string; // hex4, e.g. "0x3E91"
  title: string | null;
  pinned: boolean;
  updatedAt: number;
  unread: boolean;
  lastMsg: { kind: MessageKind; text: string };
  deletedAt?: number;
}

export type MessageStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'streaming' | 'stopped' | 'done';

export interface MessagePhoto {
  name: string;
  bytes: number;
  w: number;
  h: number;
  progress?: number;
  oversized?: boolean;
  caption?: string;
}

export type MessageErrorCode = 413 | 429 | 503;

export interface MessageError {
  code: MessageErrorCode;
  retryAt?: number;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'agent';
  kind: MessageKind;
  text?: string;
  audio?: { durationSec: number; transcript?: string };
  photos?: MessagePhoto[];
  status: MessageStatus;
  createdAt: number;
  error?: MessageError;
}

export type AgentPhase = 'idle' | 'thinking' | 'streaming';
export type NetStatus = 'online' | 'offline' | 'reconnecting';
