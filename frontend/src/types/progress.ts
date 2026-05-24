// Types 

export interface TrendPoint {
  label:       string
  date:        string | null
  glucose:     number | null
  resting_bp:  number | null
  weight:      number | null
  bmi:         number | null
  cholesterol: number | null
  hemoglobin:  number | null
}

export interface TopPrediction {
  disease:      string
  disease_name: string
  score:        number
  risk_level:   string
}

export interface HistoryRow {
  id:                 string
  submitted_at:       string | null
  status:             string
  glucose:            number | null
  resting_bp:         number | null
  weight:             number | null
  bmi:                number | null
  cholesterol:        number | null
  hemoglobin:         number | null
  risk_level:         string | null
  confidence:         number | null
  top_prediction:     TopPrediction | null
  models_used_count:  number
  reviewed:           boolean
}

export interface ProgressResponse {
  trend_series: TrendPoint[]
  history:      HistoryRow[]
  total:        number
}
