// src/components/ui/review/AiPredictionsCard.tsx
import { useEffect, useState } from 'react'
import { getRiskConfig } from '@/utils/reviewHelpers'
import type { AssessmentResult, RiskLevel } from '@/types/review'

interface Props {
  results:          AssessmentResult
  overrides:        Partial<Record<string, RiskLevel>>
  onOverrideChange: (disease: string, level: RiskLevel) => void
}

const RISK_OPTIONS: RiskLevel[] = ['low', 'medium', 'high', 'critical']

function AnimatedBar({ probability, riskLevel, delay = 0 }: {
  probability: number; riskLevel: string; delay?: number
}) {
  const [width, setWidth] = useState(0)
  const cfg = getRiskConfig(riskLevel)
  useEffect(() => {
    const t = setTimeout(() => setWidth(probability), 120 + delay)
    return () => clearTimeout(t)
  }, [probability, delay])
  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <div style={{ height: 8, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${width}%`, borderRadius: 6,
          background: `linear-gradient(90deg, ${cfg.barColor}88, ${cfg.barColor})`,
          boxShadow: `0 0 10px ${cfg.barColor}60`,
          transition: 'width 0.9s cubic-bezier(0.25, 1, 0.5, 1)',
        }} />
      </div>
    </div>
  )
}

function RiskSelector({ current, onChange }: { current: RiskLevel; onChange: (level: RiskLevel) => void }) {
  return (
    // FIX 1: flex-wrap so 4 risk buttons wrap to 2 rows on very narrow screens
    <div className="flex flex-wrap gap-1">
      {RISK_OPTIONS.map((level) => {
        const c        = getRiskConfig(level)
        const isActive = level === current
        return (
          <button
            key={level}
            onClick={() => onChange(level)}
            title={c.label}
            style={{
              padding: '3px 7px', borderRadius: 6,
              border:      isActive ? `1.5px solid ${c.color}` : '1.5px solid rgba(255,255,255,0.08)',
              background:  isActive ? c.bg : 'transparent',
              color:       isActive ? c.color : '#4b5563',
              fontSize: 10, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s', letterSpacing: '0.03em', textTransform: 'uppercase' as const,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = c.color
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = `${c.color}66`
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = '#4b5563'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'
              }
            }}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}

export default function AiPredictionsCard({ results, overrides, onOverrideChange }: Props) {
  const predictions = Object.entries(results.predictions ?? {})
  const overallCfg  = getRiskConfig(results.risk_level ?? 'low')

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden min-w-0">

      {/* Header — FIX 2: flex-wrap so confidence + overall badge wraps on mobile */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
            style={{ background: 'rgba(0,212,168,0.15)' }}>
            🤖
          </div>
          <p className="text-[14px] font-bold text-gray-100 m-0">AI Risk Predictions</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {results.ensemble_confidence != null && (
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider m-0">Confidence</p>
              <p className="text-[18px] font-bold font-mono leading-none m-0" style={{ color: '#00d4a8' }}>
                {results.ensemble_confidence.toFixed(1)}%
              </p>
            </div>
          )}
          <div className="px-3 py-1.5 rounded-full text-[12px] font-bold"
            style={{ background: overallCfg.bg, border: `1px solid ${overallCfg.border}`, color: overallCfg.color }}>
            Overall: {overallCfg.label}
          </div>
        </div>
      </div>

      {/* Model pill */}
      {results.models_used && (
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2 border-b border-white/[0.04]"
          style={{ background: 'rgba(255,255,255,0.015)' }}>
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">Model:</span>
          <span className="text-[11px] text-gray-500 font-mono">{results.models_used}</span>
        </div>
      )}

      {/* Predictions list */}
      <div>
        {predictions.map(([key, pred], idx) => {
          const effectiveRisk = overrides[key] ?? pred.risk_level ?? 'low'
          const cfg           = getRiskConfig(effectiveRisk)
          const isOverridden  = !!overrides[key] && overrides[key] !== pred.risk_level

          return (
            <div
              key={key}
              className="px-4 sm:px-5 py-4 min-w-0 transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: idx < predictions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              {/* Disease name row — FIX 3: flex-wrap so % value doesn't get pushed off */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[14px] font-bold text-gray-100 truncate">{pred.disease_name}</span>
                  {isOverridden && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wide"
                      style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                      Overridden
                    </span>
                  )}
                </div>
                <span className="text-[20px] font-bold font-mono shrink-0" style={{ color: cfg.color, lineHeight: 1 }}>
                  {pred.probability.toFixed(1)}%
                </span>
              </div>

              {/* Bar */}
              <div className="flex items-center gap-3 mb-2.5">
                <AnimatedBar probability={pred.probability} riskLevel={effectiveRisk} delay={idx * 80} />
              </div>

              {/* Override row — FIX 4: stack on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[11px] text-gray-600 shrink-0">
                  AI assessed:{' '}
                  <span className="font-semibold" style={{ color: getRiskConfig(pred.risk_level).color }}>
                    {getRiskConfig(pred.risk_level).label}
                  </span>
                </span>
                <RiskSelector
                  current={effectiveRisk}
                  onChange={(level) => onOverrideChange(key, level)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}