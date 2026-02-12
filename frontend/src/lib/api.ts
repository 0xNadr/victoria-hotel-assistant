import type {
  Call,
  CallListResponse,
  Feedback,
  SummaryMetrics,
  CallVolumePoint,
  RatingDistribution,
} from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Calls API
export async function getCalls(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<CallListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  })
  if (status) params.append('status', status)

  return fetchAPI<CallListResponse>(`/api/calls?${params}`)
}

export async function getCall(id: string): Promise<Call> {
  return fetchAPI<Call>(`/api/calls/${id}`)
}

export async function createCall(data: {
  started_at: string
  status?: string
  caller_id?: string
}): Promise<Call> {
  return fetchAPI<Call>('/api/calls', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCall(
  id: string,
  data: {
    ended_at?: string
    duration_seconds?: number
    status?: string
    transcript?: string
    summary?: string
    topics?: string
  }
): Promise<Call> {
  return fetchAPI<Call>(`/api/calls/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// Feedback API
export async function submitFeedback(
  callId: string,
  data: { rating: number; comment?: string; created_by?: string }
): Promise<Feedback> {
  return fetchAPI<Feedback>(`/api/calls/${callId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateFeedback(
  callId: string,
  data: { rating?: number; comment?: string }
): Promise<Feedback> {
  return fetchAPI<Feedback>(`/api/calls/${callId}/feedback`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// Analytics API
export async function getSummaryMetrics(days: number = 30): Promise<SummaryMetrics> {
  return fetchAPI<SummaryMetrics>(`/api/analytics/summary?days=${days}`)
}

export async function getCallsOverTime(days: number = 30): Promise<CallVolumePoint[]> {
  return fetchAPI<CallVolumePoint[]>(`/api/analytics/calls-over-time?days=${days}`)
}

export async function getRatingDistribution(days: number = 30): Promise<RatingDistribution[]> {
  return fetchAPI<RatingDistribution[]>(`/api/analytics/ratings?days=${days}`)
}
