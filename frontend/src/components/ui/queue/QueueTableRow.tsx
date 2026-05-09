import { useNavigate } from 'react-router-dom'
import { formatDateTime } from '@/utils/formatDate'
import {
  getTopPrediction,
  getInitials,
  getAvatarGradient,
  genderLabel,
  formatDateOnly,
} from '@/utils/queueHelpers'
import RiskBadge from '@/components/ui/queue/RiskBadge'
import StatusBadge from '@/components/ui/queue/StatusBadge'
import type { QueueItem } from '@/types/queue'

interface Props {
  item: QueueItem
  isLast: boolean
}

export default function QueueTableRow({ item, isLast }: Props) {
  const navigate = useNavigate()

  const results = item.results ?? item.result ?? null
  const topPred = getTopPrediction(results)
  const overallRisk = results?.risk_level ?? topPred?.risk_level ?? 'low'
  const confidence = results?.ensemble_confidence
  const submittedAt = formatDateOnly(item.submitted_at ?? item.created_at)


  const handleRowClick = () => navigate(`/doctor/review`, { state: { report_id: item.id } })

 const handleReviewClick = (e: React.MouseEvent) => {
  e.stopPropagation()
  navigate('/doctor/review', { state: { report_id: item.id } })
  }

  return (
    <tr
      style={{
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
      onClick={handleRowClick}
    >
      {/* Patient */}
      <td style={{ padding: '13px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: getAvatarGradient(item.patient_name),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
              letterSpacing: '0.02em',
            }}
          >
            {getInitials(item.patient_name)}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#e5e7eb', lineHeight: 1.2 }}>
              {item.patient_name ?? 'Unknown Patient'}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#6b7280', fontFamily: 'monospace', marginTop: 2 }}>
              #{item.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
      </td>

      {/* Age / Gender */}
      <td style={{ padding: '13px 16px' }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>
          {item.params?.age ?? '—'}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: '#6b7280', marginTop: 2 }}>
          {genderLabel(item.params?.gender as string | undefined)}
        </p>
      </td>

      {/* Submitted */}
      <td style={{ padding: '13px 16px', fontFamily: 'monospace', fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>
        {submittedAt}
      </td>

      {/* Top Diagnosis */}
      <td style={{ padding: '13px 16px' }}>
        {topPred ? (
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e5e7eb' }}>
              {topPred.disease_name}
            </p>
            {/* <p style={{ margin: 0, fontSize: 11, color: '#4da3ff', fontFamily: 'monospace', marginTop: 2 }}>
              {topPred.probability.toFixed(1)}% probability
            </p> */}
          </div>
        ) : (
          <span style={{ color: '#4b5563', fontSize: 12 }}>No prediction</span>
        )}
      </td>

      {/* AI Risk */}
      <td style={{ padding: '13px 16px' }}>
        <RiskBadge level={overallRisk} />
      </td>

      {/* Confidence */}
      <td style={{ padding: '13px 16px' }}>
        {confidence != null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(confidence, 100)}%`,
                  height: '100%',
                  borderRadius: 4,
                  background: '#00d4a8',
                }}
              />
            </div>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#00d4a8', fontWeight: 600 }}>
              {confidence.toFixed(1)}%
            </span>
          </div>
        ) : (
          <span style={{ color: '#4b5563', fontSize: 12 }}>—</span>
        )}
      </td>

      {/* Status */}
      <td style={{ padding: '13px 16px' }}>
        <StatusBadge status={item.status} />
      </td>

      {/* Action */}
      <td style={{ padding: '13px 16px' }}>
        <button
          onClick={handleReviewClick}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid rgba(77,163,255,0.25)',
            background: 'rgba(77,163,255,0.08)',
            color: '#4da3ff',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'rgba(77,163,255,0.18)'
            btn.style.borderColor = 'rgba(77,163,255,0.5)'
          }}
          onMouseLeave={e => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'rgba(77,163,255,0.08)'
            btn.style.borderColor = 'rgba(77,163,255,0.25)'
          }}
        >
          Review →
        </button>
      </td>
    </tr>
  )
}
