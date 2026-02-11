export interface Feedback {
  id: string
  call_id: string
  rating: number
  comment: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Call {
  id: string
  elevenlabs_call_id: string | null
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  status: 'completed' | 'dropped' | 'in_progress'
  caller_id: string | null
  transcript: string | null
  summary: string | null
  topics: string | null
  created_at: string
  updated_at: string
  feedback: Feedback | null
}

export interface CallListResponse {
  calls: Call[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface SummaryMetrics {
  total_calls: number
  completed_calls: number
  dropped_calls: number
  average_duration_seconds: number | null
  average_rating: number | null
  total_ratings: number
  calls_with_feedback: number
}

export interface CallVolumePoint {
  date: string
  count: number
}

export interface RatingDistribution {
  rating: number
  count: number
}
