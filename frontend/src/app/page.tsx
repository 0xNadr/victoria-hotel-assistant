'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RatingStars } from '@/components/RatingStars'
import { AgentWidget } from '@/components/AgentWidget'
import { getSummaryMetrics, getCalls } from '@/lib/api'
import { formatDuration, formatDateTime } from '@/lib/utils'
import type { SummaryMetrics, Call } from '@/types'
import {
  Phone,
  Clock,
  Star,
  TrendingUp,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_5801kh6ecsx3e0qbh6y6wt4bfsbk'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null)
  const [recentCalls, setRecentCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsData, callsData] = await Promise.all([
          getSummaryMetrics(30),
          getCalls(1, 5),
        ])
        setMetrics(metricsData)
        setRecentCalls(callsData.calls)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200" />
            <div className="absolute inset-0 animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent" />
          </div>
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-content max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of your voice agent performance
        </p>
      </div>

      {/* Main Grid - Agent Widget + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
        {/* Agent Widget */}
        <div className="lg:col-span-1 card-animate">
          <AgentWidget agentId={AGENT_ID} />
        </div>

        {/* Metrics Cards - 2x2 grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="card-animate">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Calls</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                    {metrics?.total_calls ?? 0}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Last 30 days</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-animate">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                    {metrics?.completed_calls ?? 0}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <p className="text-xs text-emerald-600 font-medium">
                      {metrics && metrics.total_calls > 0
                        ? `${((metrics.completed_calls / metrics.total_calls) * 100).toFixed(0)}% rate`
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-animate">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Duration</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                    {formatDuration(metrics?.average_duration_seconds ?? null)}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Per call</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-animate">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Rating</p>
                  <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                    {metrics?.average_rating?.toFixed(1) ?? '-'}
                  </p>
                  <div className="mt-2">
                    <RatingStars
                      rating={Math.round(metrics?.average_rating ?? 0)}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Star className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Calls */}
      <Card className="card-animate overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-5 py-3">
          <CardTitle>Recent Calls</CardTitle>
          <Link
            href="/calls"
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 group"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Time
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Caller
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Duration
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCalls.map((call) => (
                  <tr
                    key={call.id}
                    className="hover:bg-slate-50/80 cursor-pointer"
                    onClick={() => window.location.href = `/calls/${call.id}`}
                  >
                    <td className="px-5 py-3.5 text-sm text-slate-900">
                      {formatDateTime(call.started_at)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {call.caller_id ?? <span className="text-slate-400">Unknown</span>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 tabular-nums">
                      {formatDuration(call.duration_seconds)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                          call.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : call.status === 'dropped'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <span className={`h-1 w-1 rounded-full ${
                          call.status === 'completed'
                            ? 'bg-emerald-500'
                            : call.status === 'dropped'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`} />
                        {call.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {call.feedback ? (
                        <RatingStars rating={call.feedback.rating} size="sm" />
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {recentCalls.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-600">No calls yet</p>
                        <p className="text-xs text-slate-400">Start testing the agent to see calls here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-gray-100">
            {recentCalls.map((call) => (
              <div
                key={call.id}
                className="p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer"
                onClick={() => window.location.href = `/calls/${call.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    {formatDateTime(call.started_at)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      call.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : call.status === 'dropped'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    <span className={`h-1 w-1 rounded-full ${
                      call.status === 'completed'
                        ? 'bg-emerald-500'
                        : call.status === 'dropped'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`} />
                    {call.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{call.caller_id ?? 'Unknown'}</span>
                    <span className="text-slate-300">·</span>
                    <span className="tabular-nums">{formatDuration(call.duration_seconds)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {call.feedback ? (
                      <RatingStars rating={call.feedback.rating} size="sm" />
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </div>
            ))}
            {recentCalls.length === 0 && (
              <div className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600">No calls yet</p>
                  <p className="text-xs text-slate-400">Start testing the agent to see calls here</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
