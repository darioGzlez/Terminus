const DAY = 86_400_000;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "14:02" today, "Yesterday", or "sep 21" — used in session rows. */
export function listTime(updatedAt: number, now = Date.now()): string {
  const todayStart = startOfDay(now);
  if (updatedAt >= todayStart) {
    const d = new Date(updatedAt);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (updatedAt >= todayStart - DAY) return 'Yesterday';
  const d = new Date(updatedAt);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export type SessionGroup = 'PINNED' | 'TODAY' | 'YESTERDAY' | 'EARLIER';

export function groupFor(updatedAt: number, pinned: boolean, now = Date.now()): SessionGroup {
  if (pinned) return 'PINNED';
  const todayStart = startOfDay(now);
  if (updatedAt >= todayStart) return 'TODAY';
  if (updatedAt >= todayStart - DAY) return 'YESTERDAY';
  return 'EARLIER';
}

export function timeHHMMSS(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export function mmss(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function fmtBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
