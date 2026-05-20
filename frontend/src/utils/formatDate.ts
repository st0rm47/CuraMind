import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TZ = 'Asia/Kathmandu'

/** Parse any ISO timestamp correctly — handles both +00:00 and naive strings */
function parseTs(ts: string): Date {
  // If it already has timezone info (+00:00 or Z), parseISO handles it correctly
  // If it's naive (no timezone), treat it as UTC
  const normalized = ts.includes('+') || ts.endsWith('Z')
    ? ts
    : ts.replace(' ', 'T') + 'Z'
  return parseISO(normalized)
}

/** "Apr 27, 2026" — in Nepal time */
export function formatDate(ts: string | null | undefined): string {
  if (!ts) return '—'
  try {
    const d = toZonedTime(parseTs(ts), TZ)
    return isValid(d) ? format(d, 'MMM d, yyyy') : '—'
  } catch { return '—' }
}

/** "Apr 27, 2026 · 2:30 PM" — in Nepal time */
export function formatDateTime(ts: string | null | undefined): string {
  if (!ts) return '—'
  try {
    const d = toZonedTime(parseTs(ts), TZ)
    return isValid(d) ? format(d, 'MMM d, yyyy · h:mm a') : '—'
  } catch { return '—' }
}

/** "3 hours ago" */
export function formatRelative(ts: string | null | undefined): string {
  if (!ts) return '—'
  try {
    const d = parseTs(ts)
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
  } catch { return '—' }
}

/** Alias used in some components */
export const formatRelativeAsia = formatRelative

/** "Monday, April 27, 2026" — used in dashboard headers, always Nepal time */
export function formatFull(ts?: string): string {
  try {
    const d = ts ? toZonedTime(parseTs(ts), TZ) : toZonedTime(new Date(), TZ)
    return format(d, 'EEEE, MMMM d, yyyy')
  } catch { return new Date().toDateString() }
}

/** @deprecated use parseTs internally — kept for any direct usage */
export function parseUtc(ts: string): Date {
  return parseTs(ts)
}