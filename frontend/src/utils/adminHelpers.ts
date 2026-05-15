export function riskColor(level: string | null): string {
  switch ((level ?? '').toLowerCase()) {
    case 'critical': return '#ff1744'
    case 'high':     return '#ff5f7e'
    case 'medium':
    case 'moderate': return '#ffbe3d'
    case 'low':      return '#00d4a8'
    default:         return '#6b7280'
  }
}

export function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}