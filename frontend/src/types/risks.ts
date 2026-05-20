// ── Types 
export interface ShapEntry {
  feature: string
  value:   number | string
  impact:  number
  effect:  'increases risk' | 'decreases risk'
}
export interface ShapResponse {
  report_id:   string
  shap_values: ShapEntry[]
}