interface Props {
  total: number
  pendingCount: number
  reviewedCount: number
}

const CARDS = [
  { key: 'total',    label: 'Total Cases',    color: '#4da3ff', bg: 'rgba(77,163,255,0.08)',  border: 'rgba(77,163,255,0.13)'  },
  { key: 'pending',  label: 'Pending Review', color: '#BA7517', bg: 'rgba(186,117,23,0.08)', border: 'rgba(186,117,23,0.13)' },
  { key: 'reviewed', label: 'Reviewed',       color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.13)' },
] as const

export default function QueueSummaryCards({ total, pendingCount, reviewedCount }: Props) {
  const values: Record<typeof CARDS[number]['key'], number> = {
    total,
    pending: pendingCount,
    reviewed: reviewedCount,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {CARDS.map((card) => (
        <div
          key={card.key}
          style={{
            padding: '14px 18px',
            borderRadius: 14,
            background: card.bg,
            border: `1px solid ${card.border}`,
          }}
        >
          <p
            style={{
              margin: '0 0 4px',
              fontSize: 11,
              color: '#6b7280',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {card.label}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 700,
              color: card.color,
              lineHeight: 1,
            }}
          >
            {values[card.key]}
          </p>
        </div>
      ))}
    </div>
  )
}
