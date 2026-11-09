// Reply-within-the-hour clock. Working hours 9am to 7pm IST, every day: an ASSUMPTION (label it in the TDD).
const IST_MIN = 330
const START_H = 9
const END_H = 19
export const REPLY_MINUTES = 60

const toIST = (d: Date) => new Date(d.getTime() + IST_MIN * 60000)
const fromIST = (d: Date) => new Date(d.getTime() - IST_MIN * 60000)

/** The instant that is `h`:00 IST on the IST day of `d`, plus `addDays`. */
function atHour(d: Date, h: number, addDays = 0): Date {
  const x = toIST(d)
  x.setUTCHours(h, 0, 0, 0)
  x.setUTCDate(x.getUTCDate() + addDays)
  return fromIST(x)
}

/** Adds minutes of working time, skipping the hours outside 9am to 7pm IST. */
export function addWorkingMinutes(from: Date, minutes: number): Date {
  let cur = from
  let left = minutes
  for (let i = 0; i < 14; i++) {
    const t = toIST(cur)
    const h = t.getUTCHours() + t.getUTCMinutes() / 60
    if (h < START_H) cur = atHour(cur, START_H)
    else if (h >= END_H) cur = atHour(cur, START_H, 1)
    const available = (atHour(cur, END_H).getTime() - cur.getTime()) / 60000
    if (left <= available) return new Date(cur.getTime() + left * 60000)
    left -= available
    cur = atHour(cur, START_H, 1)
  }
  return cur
}

export const replyDeadline = (createdAt: string | Date) => addWorkingMinutes(new Date(createdAt), REPLY_MINUTES)

export type SlaKind = 'met' | 'late' | 'done' | 'ok' | 'warning' | 'breached'
export type SlaState = { kind: SlaKind; deadline: Date; minutes?: number }

/** `repliedAt` is when the enquiry first left "new" (reply sent or marked contacted). */
export function slaState(e: { createdAt: string; repliedAt: string | null; status: string }, now: Date = new Date()): SlaState {
  const deadline = replyDeadline(e.createdAt)
  if (e.repliedAt) return { kind: new Date(e.repliedAt) <= deadline ? 'met' : 'late', deadline }
  if (e.status !== 'new') return { kind: 'done', deadline }
  const ms = deadline.getTime() - now.getTime()
  const minutes = Math.round(Math.abs(ms) / 60000)
  if (ms < 0) return { kind: 'breached', deadline, minutes }
  return { kind: ms <= 15 * 60000 ? 'warning' : 'ok', deadline, minutes }
}

const dur = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ''}`)
const ymd = (d: Date) => toIST(d).toISOString().slice(0, 10)

export function slaLabel(s: SlaState, now: Date = new Date()): string {
  switch (s.kind) {
    case 'met': return 'Replied in time'
    case 'late': return 'Replied late'
    case 'done': return 'Replied'
    case 'breached': return `Overdue by ${dur(s.minutes ?? 0)}`
    default: {
      const time = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(s.deadline)
      const day = ymd(s.deadline) === ymd(now) ? '' : ` ${new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' }).format(s.deadline)}`
      return `Reply by ${time}${day}`
    }
  }
}
