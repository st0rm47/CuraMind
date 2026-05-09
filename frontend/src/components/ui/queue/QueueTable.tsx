import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/common/EmptyState'
import QueueTableRow from '@/components/ui/queue/QueueTableRow'
import type { QueueItem } from '@/types/queue'

const COLUMNS = [
  { label: 'Patient',        width: '25%' },
  { label: 'Age / Gender',   width: '10%' },
  { label: 'Submitted',      width: '15%' },
  { label: 'Top Diagnosis',  width: '15%' },
  { label: 'AI Risk',        width: '10%' },
  { label: 'Confidence',     width: '10%' },
  { label: 'Status',         width: '10%' },
  { label: 'Actions',        width: '5%'  },
]

interface Props {
  items: QueueItem[]
  loading: boolean
}

export default function QueueTable({ items, loading }: Props) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No cases found"
          description="No patient cases match the current filter."
        />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  style={{
                    width: col.width,
                    padding: '11px 16px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#8992a4',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <QueueTableRow
                key={item.id}
                item={item}
                isLast={idx === items.length - 1}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
