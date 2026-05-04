// src/components/common/Charts.tsx
// All chart components using Recharts.

import {
  RadarChart as ReRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend,
} from 'recharts'
import type { Predictions, ShapValue, DiseaseKey } from '@/types/report'
import { DISEASE_META, getRiskLevel, getRiskColor } from './riskUtils'

// ── Radar chart for multi-disease risk ───────────────────────────────────────
export function RiskRadarChart({ predictions }: { predictions: Predictions }) {
  const data = (Object.entries(predictions) as [DiseaseKey, number][]).map(([k, v]) => ({
    subject: DISEASE_META[k].name.replace(' ', '\n'),
    value:   v,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke="rgba(148,163,184,0.12)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
        />
        <Radar
          name="Risk"
          dataKey="value"
          stroke="#4da3ff"
          fill="#4da3ff"
          fillOpacity={0.18}
          strokeWidth={2}
          dot={{ fill: '#4da3ff', r: 3 }}
        />
      </ReRadarChart>
    </ResponsiveContainer>
  )
}

// ── Area sparkline ────────────────────────────────────────────────────────────
interface SparklineProps {
  data:   { label: string; value: number }[]
  color:  string
  height?: number
}
export function SparklineChart({ data, color, height = 80 }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
        <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: '#0d1117', border: '1px solid #374151', borderRadius: 8, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          labelStyle={{ color: '#9ca3af' }}
          itemStyle={{ color: color }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#spark-${color.replace(/[^a-z0-9]/gi, '')})`}
          dot={{ fill: color, r: 3, strokeWidth: 2, stroke: '#0d1117' }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── SHAP horizontal bar chart ─────────────────────────────────────────────────
export function ShapBarChart({ shapValues }: { shapValues: ShapValue[] }) {
  const data = shapValues.map((f) => ({
    name:   f.feature,
    impact: Math.abs(f.impact),
    sign:   f.direction === 'risk' ? 1 : -1,
    label:  `${f.value}${f.unit}`,
  }))

  return (
    <ResponsiveContainer width="100%" height={data.length * 38 + 20}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.07)" />
        <XAxis type="number" hide domain={[0, 'dataMax']} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#0d1117', border: '1px solid #374151', borderRadius: 8, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          formatter={(v: number, _name: string, entry: { payload: { label: string; sign: number } }) => [
            `${entry.payload.sign > 0 ? '+' : '-'}${v.toFixed(1)} pts  |  ${entry.payload.label}`,
            'SHAP Impact',
          ]}
        />
        <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.sign > 0 ? '#ff5f7e' : '#00d4a8'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Average risk bar chart (doctor analytics) ─────────────────────────────────
export function AverageRiskBarChart({ data }: { data: { disease: string; avg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -28, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
        <XAxis dataKey="disease" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#0d1117', border: '1px solid #374151', borderRadius: 8, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
          formatter={(v: number) => [`${v}%`, 'Avg. Risk']}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: '#9ca3af' }} />
        <Bar dataKey="avg" name="Average Risk" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getRiskColor(getRiskLevel(entry.avg))} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
