// src/utils/formatDate.ts

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

/** "Apr 27, 2026" */
export function formatDate(ts: string | null | undefined): string {
  if (!ts) return '—'
  try {
    const d = parseISO(ts)
    return isValid(d) ? format(d, 'MMM d, yyyy') : '—'
  } catch { return '—' }
}

/** "Apr 27, 2026 · 2:30 PM" */
export function formatDateTime(ts: string | null | undefined): string {
  if (!ts) return '—'
  try {
    const d = parseISO(ts)
    return isValid(d) ? format(d, "MMM d, yyyy |  h:mm a") : '—'
  } catch { return '—' }
}

/** "3 hours ago" */
export function formatRelative(ts: string | null | undefined): string {
  if (!ts) return '—'
  try {
    const d = parseISO(ts)
    return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
  } catch { return '—' }
}

/** "Monday, April 27, 2026" — used in dashboard headers */
export function formatFull(ts?: string): string {
  try {
    const d = ts ? parseISO(ts) : new Date()
    return format(d, 'EEEE, MMMM d, yyyy')
  } catch { return new Date().toDateString() }
}
