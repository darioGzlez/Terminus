import { Message, Session } from './types';

let seq = 0;
export function uid(prefix = 'm'): string {
  seq += 1;
  return `${prefix}${seq}${Date.now().toString(36)}`;
}

export function hexId(): string {
  return `0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;
}

const DAY = 86_400_000;
const now = Date.now();

export const SEED_SESSIONS: Session[] = [
  {
    id: '0x3F2A',
    title: 'Listing photos',
    pinned: true,
    updatedAt: now - 2 * 3_600_000,
    unread: true,
    lastMsg: { kind: 'photo', text: 'Got it. The photo is a bit underexposed…' },
  },
  {
    id: '0x3E91',
    title: 'Kettle descaling',
    pinned: false,
    updatedAt: now - 3_600_000,
    unread: false,
    lastMsg: { kind: 'voice', text: 'Same mix in a zip bag, tied around the head…' },
  },
  {
    id: '0x3E7C',
    title: 'Router keeps dropping',
    pinned: false,
    updatedAt: now - 5 * 3_600_000,
    unread: false,
    lastMsg: { kind: 'text', text: 'You: it happens every night around 2 am' },
  },
  {
    id: '0x3C07',
    title: 'Mushroom ID',
    pinned: false,
    updatedAt: now - DAY,
    unread: true,
    lastMsg: { kind: 'photo', text: 'Likely a parasol. Do not eat it on my word alone.' },
  },
  {
    id: '0x3B44',
    title: 'Train times to Porto',
    pinned: false,
    updatedAt: now - DAY - 4 * 3_600_000,
    unread: false,
    lastMsg: { kind: 'text', text: 'The 07:52 is the fastest. One change in …' },
  },
  {
    id: '0x3A5D',
    title: 'Trip packing list',
    pinned: false,
    updatedAt: now - 9 * DAY,
    unread: false,
    lastMsg: { kind: 'text', text: 'Twelve items. I left out the umbrella.' },
  },
  {
    id: '0x39F0',
    title: 'Sourdough starter',
    pinned: false,
    updatedAt: now - 12 * DAY,
    unread: false,
    lastMsg: { kind: 'voice', text: 'Feed it twice a day for the first week.' },
  },
  {
    id: '0x3902',
    title: 'Receipt scan · taxes',
    pinned: false,
    updatedAt: now - 18 * DAY,
    unread: false,
    lastMsg: { kind: 'photo', text: 'Total €84.20. I filed it under utilities.' },
  },
];

function t(hh: number, mm: number, ss: number, dayOffset = 0): number {
  const d = new Date();
  d.setHours(hh, mm, ss, 0);
  return d.getTime() - dayOffset * DAY;
}

export const SEED_MESSAGES: Message[] = [
  // 0x3E91 — Kettle descaling
  { id: uid(), sessionId: '0x3E91', role: 'user', kind: 'text', status: 'done', createdAt: t(11, 38, 2), text: "What's the fastest way to descale a kettle?" },
  {
    id: uid(),
    sessionId: '0x3E91',
    role: 'agent',
    kind: 'text',
    status: 'done',
    createdAt: t(11, 38, 4),
    text: 'Fill it halfway with equal parts white vinegar and water, boil, then let it sit for 20 minutes. Rinse twice with plain water before using it again.',
  },
  {
    id: uid(),
    sessionId: '0x3E91',
    role: 'user',
    kind: 'voice',
    status: 'done',
    createdAt: t(11, 40, 10),
    audio: { durationSec: 8, transcript: 'And for the shower head?' },
  },
  {
    id: uid(),
    sessionId: '0x3E91',
    role: 'agent',
    kind: 'text',
    status: 'done',
    createdAt: t(11, 40, 13),
    text: 'Same mix in a zip bag, tied around the head overnight. Scrub the nozzles in the morning.',
  },

  // 0x3F2A — Listing photos
  {
    id: uid(),
    sessionId: '0x3F2A',
    role: 'user',
    kind: 'photo',
    status: 'done',
    createdAt: t(14, 2, 11, 0),
    text: 'Fix the light on these',
    photos: [{ name: 'IMG_0142.JPG', bytes: 2.4 * 1024 * 1024, w: 4032, h: 3024 }],
  },
  {
    id: uid(),
    sessionId: '0x3F2A',
    role: 'agent',
    kind: 'photo',
    status: 'done',
    createdAt: t(14, 2, 19, 0),
    text: 'I lifted the shadows and straightened the horizon. Want a square crop too?',
    photos: [{ name: 'IMG_0142_EDIT.JPG', bytes: 1.9 * 1024 * 1024, w: 4032, h: 3024 }],
  },

  // 0x3C07 — Mushroom ID
  {
    id: uid(),
    sessionId: '0x3C07',
    role: 'user',
    kind: 'photo',
    status: 'done',
    createdAt: t(21, 4, 40, 1),
    photos: [{ name: 'IMG_0201.JPG', bytes: 3.2 * 1024 * 1024, w: 3024, h: 4032 }],
  },
  {
    id: uid(),
    sessionId: '0x3C07',
    role: 'agent',
    kind: 'text',
    status: 'done',
    createdAt: t(21, 5, 0, 1),
    text: 'Likely a parasol. Do not eat it on my word alone — check the detachable ring and the snakeskin stem pattern before cooking.',
  },
];

export const AGENT_REPLIES = [
  "Noted. I'll keep that in mind.",
  'Done. Anything else?',
  "Got it — give me a second next time you need this.",
  'That should do it. Let me know how it goes.',
  'Soak a cloth in the same mix and wrap it around the base of the tap. Leave it for an hour, then scrub the joint with an old toothbrush.',
  "Yes. Vinegar is fine on stainless steel as long as you don't leave it for more than a few hours at a time.",
];

export const SUGGESTIONS: { glyph: string; label: string }[] = [
  { glyph: '[#]', label: 'Identify a plant from a photo' },
  { glyph: '[>]', label: 'Plan dinner for four, under an hour' },
  { glyph: '[~]', label: 'Talk it through, hands-free' },
];
