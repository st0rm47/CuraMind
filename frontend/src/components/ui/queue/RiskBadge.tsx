import { getRiskConfig } from '@/utils/queueHelpers'
interface Props {
  level: string
}

export default function RiskBadge({ level }: Props) {
  const cfg = getRiskConfig(level)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: cfg.bg,
        color: cfg.text,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  )
}
