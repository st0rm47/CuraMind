// src/components/common/DiseaseGrid.tsx
import type { Predictions, DiseaseKey } from '@/types/report'
import { getRiskLevel, getRiskColor, DISEASE_META } from './riskUtils'
import { RiskBadge } from '@/components/ui/Badge'

export default function DiseaseGrid({ predictions }: { predictions: Predictions }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
      {(Object.entries(predictions) as [DiseaseKey, number][]).map(([key, value]) => {
        const level = getRiskLevel(value)
        const color = getRiskColor(level)
        const meta  = DISEASE_META[key]
        return (
          <div
            key={key}
            className="bg-gray-800/60 border border-gray-700 rounded-xl p-3.5 text-center
                       hover:border-gray-600 transition-all duration-200"
          >
            <div className="text-2xl mb-2">{meta.icon}</div>
            <div className="text-[11px] font-semibold text-gray-300 mb-2">{meta.name}</div>
            <div className="font-mono text-xl font-bold mb-2" style={{ color }}>
              {value}%
            </div>
            <RiskBadge level={level} />
          </div>
        )
      })}
    </div>
  )
}
