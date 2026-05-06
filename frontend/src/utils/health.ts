export const getRiskLevel = (v: number) =>
  v > 70 ? 'high' : v > 40 ? 'medium' : 'low'

export const humanize = (s: string) =>
  s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())

export const formatTime = (t: string) =>
  new Date(t).toLocaleString()