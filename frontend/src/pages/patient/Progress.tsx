// src/pages/patient/Progress.tsx
import { useEffect, useState }    from 'react'
import toast                       from 'react-hot-toast'
import Card, { CardHeader }        from '@/components/ui/Card'
import Spinner                     from '@/components/ui/Spinner'
import EmptyState                  from '@/components/common/EmptyState'
import { SparklineChart }          from '@/components/common/Charts'
import { getErrorMessage }         from '@/services/api'
import { formatDateTime }          from '@/utils/formatDate'
import api                         from '@/services/api'
import { ProgressResponse, HistoryRow } from '@/types/progress'
import { diseaseLabel, riskColor, toChartData, delta, riskLabel, VITALS } from '@/utils/progresshelpers'

// Mobile history card (replaces table rows on small screens) 
function HistoryCard({ row }: { row: HistoryRow }) {
  const tp     = row.top_prediction
  const meta   = tp ? diseaseLabel(tp.disease, tp.disease_name) : null
  const rColor = riskColor(tp?.risk_level ?? row.risk_level ?? null)

  return (
    <div className="p-3 rounded-xl border border-gray-800 bg-gray-800/20 space-y-2.5">
      {/* Date + status */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-gray-400">
          {row.submitted_at ? formatDateTime(row.submitted_at) : '—'}
        </span>
        {row.reviewed ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
            Reviewed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            Pending
          </span>
        )}
      </div>

      {/* Vitals grid — 3 per row */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: 'Glucose',  value: row.glucose,    unit: 'mg/dL' },
          { label: 'BP',       value: row.resting_bp, unit: 'mmHg'  },
          { label: 'Weight',   value: row.weight,     unit: 'kg'    },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-gray-800/60 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[9px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
            <p className="font-mono text-[12px] text-gray-200">
              {value !== null ? value : '—'}
              {value !== null && <span className="text-[9px] text-gray-500 ml-0.5">{unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* BMI + Top condition */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {row.bmi !== null && (
          <span className="text-[11px] font-mono font-semibold"
            style={{ color: row.bmi >= 30 ? '#ff5f7e' : row.bmi >= 25 ? '#ffbe3d' : '#00d4a8' }}>
            BMI {row.bmi}
          </span>
        )}
        {tp && meta && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">{meta.icon}</span>
            <span className="text-[11px] font-medium text-gray-200 truncate">{meta.name}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: `${rColor}20`, color: rColor }}>
              {riskLabel(tp.risk_level)}
            </span>
          </div>
        )}
      </div>

      {/* Confidence bar */}
      {row.confidence !== null && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${row.confidence}%`,
                background: row.confidence >= 70 ? '#ff5f7e' : row.confidence >= 40 ? '#ffbe3d' : '#00d4a8',
              }} />
          </div>
          <span className="font-mono text-[10px] text-gray-400 tabular-nums shrink-0">
            {row.confidence}%
          </span>
        </div>
      )}
    </div>
  )
}

// Page 

export default function Progress() {
  const [data,    setData]    = useState<ProgressResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<ProgressResponse>('/patient/progress')
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const series  = data?.trend_series ?? []
  const history = data?.history      ?? []
  const total   = data?.total        ?? 0

  const visibleVitals = VITALS.filter(
    (v) => series.some((p) => p[v.field] !== null && p[v.field] !== undefined),
  )

  return (
    <div className="animate-fade-in space-y-5 sm:space-y-6 w-full min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="page-title">Health Progress</h1>
          <p className="page-sub">Tracking of your key health metrics over time</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
            {total} assessment{total !== 1 ? 's' : ''} recorded
          </div>
        )}
      </div>

      {series.length === 0 ? (
        <Card>
          <EmptyState
            icon="📈"
            title="No history yet"
            description="Submit your first health assessment to start tracking progress over time."
          />
        </Card>
      ) : (
        <>
          {/* Vital trend sparklines  */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
              Key Health Indicators — Trend Over Time
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleVitals.map((v) => {
                const chartData = toChartData(series, v.field)
                const d         = delta(series, v.field)
                const latest    = chartData[chartData.length - 1]?.value
                const improving = d === null
                  ? null
                  : v.lowerIsBetter ? d < 0 : d > 0

                return (
                  <Card key={v.label} className="!p-4 min-w-0">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[13px] text-gray-100 leading-tight truncate">
                          {v.label}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {latest !== undefined
                            ? `${latest}${v.unit ? ` ${v.unit}` : ''} · latest`
                            : 'No data'}
                        </p>
                      </div>
                      {d !== null && (
                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <span className="text-[12px] font-bold font-mono"
                            style={{ color: improving ? '#00d4a8' : improving === false ? '#ff5f7e' : '#6b7280' }}>
                            {d > 0 ? '↑' : '↓'} {Math.abs(d).toFixed(1)}
                          </span>
                          <span className="text-[9px] font-semibold uppercase tracking-wide"
                            style={{ color: improving ? '#00d4a8' : improving === false ? '#ff5f7e' : '#6b7280' }}>
                            {improving ? 'Better' : improving === false ? 'Watch' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {chartData.length >= 2 ? (
                      <SparklineChart data={chartData} color={v.color} height={72} />
                    ) : (
                      <div className="h-[72px] flex items-center justify-center rounded-lg"
                        style={{ background: `${v.color}08` }}>
                        <p className="text-[10px] text-gray-600">Need 2+ data points</p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>

          {/* ── Assessment History  */}
          <Card>
            <CardHeader
              title="Assessment History"
              subtitle={`${history.length} record${history.length !== 1 ? 's' : ''} · most recent first`}
            />

            {/* Mobile card list (hidden on md+) */}
            <div className="md:hidden mt-3 space-y-2">
              {history.map((row) => (
                <HistoryCard key={row.id} row={row} />
              ))}
            </div>

            {/* Desktop table (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto mt-2 rounded-xl border border-gray-800">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="bg-gray-800/70">
                    {['Date', 'Glucose', 'BP', 'Weight', 'BMI', 'Top Condition', 'Confidence', 'Status'].map((h) => (
                      <th key={h}
                        className="px-3 py-2.5 text-left text-[9px] font-bold font-mono uppercase tracking-widest text-gray-500 border-b border-gray-700/60 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, i) => {
                    const tp     = row.top_prediction
                    const meta   = tp ? diseaseLabel(tp.disease, tp.disease_name) : null
                    const rColor = riskColor(tp?.risk_level ?? row.risk_level ?? null)
                    const isEven = i % 2 === 0

                    return (
                      <tr key={row.id}
                        className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors"
                        style={isEven ? undefined : { background: 'rgba(255,255,255,0.01)' }}>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <p className="font-mono text-[11px] text-gray-300">
                            {row.submitted_at ? formatDateTime(row.submitted_at) : '—'}
                          </p>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {row.glucose !== null ? (
                            <span className="font-mono text-[12px] text-gray-200">
                              {row.glucose}<span className="text-[10px] text-gray-500 ml-0.5">mg/dL</span>
                            </span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {row.resting_bp !== null ? (
                            <span className="font-mono text-[12px] text-gray-200">
                              {row.resting_bp}<span className="text-[10px] text-gray-500 ml-0.5">mmHg</span>
                            </span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {row.weight !== null ? (
                            <span className="font-mono text-[12px] text-gray-200">
                              {row.weight}<span className="text-[10px] text-gray-500 ml-0.5">kg</span>
                            </span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {row.bmi !== null ? (
                            <span className="font-mono text-[12px] font-semibold"
                              style={{ color: row.bmi >= 30 ? '#ff5f7e' : row.bmi >= 25 ? '#ffbe3d' : '#00d4a8' }}>
                              {row.bmi}
                            </span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {tp && meta ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{meta.icon}</span>
                              <span className="text-[12px] font-medium text-gray-200">{meta.name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: `${rColor}20`, color: rColor }}>
                                {riskLabel(tp.risk_level)}
                              </span>
                            </div>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {row.confidence !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full"
                                  style={{
                                    width: `${row.confidence}%`,
                                    background: row.confidence >= 70 ? '#ff5f7e' : row.confidence >= 40 ? '#ffbe3d' : '#00d4a8',
                                  }} />
                              </div>
                              <span className="font-mono text-[11px] text-gray-400 tabular-nums">{row.confidence}%</span>
                            </div>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {row.reviewed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-teal-500/15 text-teal-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />Reviewed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/15 text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[10px] text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#ff5f7e' }} />
                BMI ≥ 30 (Obese)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#ffbe3d' }} />
                BMI 25–29.9 (Overweight)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#00d4a8' }} />
                BMI &lt; 25 (Healthy)
              </span>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}