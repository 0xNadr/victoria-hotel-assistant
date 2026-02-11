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
  Activity,
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
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200" />
            <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-dormero-red border-t-transparent" />
          </div>
          <p className="text-sm text-gray-500 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 page-content">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dormero-red to-red-700">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Welcome to Viktoria Control Center
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid - Agent Widget + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Agent Widget - Takes 1 column on large screens */}
        <div className="lg:col-span-1 card-animate">
          <AgentWidget agentId={AGENT_ID} />
        </div>

        {/* Metrics Cards - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <Card className="card-animate group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Calls</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">
                    {metrics?.total_calls ?? 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Last 30 days</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-animate group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">
                    {metrics?.completed_calls ?? 0}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <p className="text-xs text-green-600 font-medium">
                      {metrics && metrics.total_calls > 0
                        ? `${((metrics.completed_calls / metrics.total_calls) * 100).toFixed(0)}% success rate`
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-animate group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Duration</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">
                    {formatDuration(metrics?.average_duration_seconds ?? null)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Per call</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-animate group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">
                    {metrics?.average_rating?.toFixed(1) ?? '-'}
                  </p>
                  <div className="mt-2">
                    <RatingStars
                      rating={Math.round(metrics?.average_rating ?? 0)}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Calls */}
      <Card className="card-animate overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50">
          <CardTitle>Recent Calls</CardTitle>
          <Link
            href="/calls"
            className="text-sm text-dormero-red hover:text-red-700 font-medium flex items-center gap-1.5 group"
          >
            View all
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Time
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Caller
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Duration
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCalls.map((call, index) => (
                  <tr
                    key={call.id}
                    className="hover:bg-gray-50/80 cursor-pointer group"
                    onClick={() => window.location.href = `/calls/${call.id}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {formatDateTime(call.started_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {call.caller_id ?? <span className="text-gray-400 italic">Unknown</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 tabular-nums">
                      {formatDuration(call.duration_seconds)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          call.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : call.status === 'dropped'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          call.status === 'completed'
                            ? 'bg-green-500'
                            : call.status === 'dropped'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`} />
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {call.feedback ? (
                        <RatingStars rating={call.feedback.rating} size="sm" />
                      ) : (
                        <span className="text-xs text-gray-400 italic">No rating</span>
                      )}
                    </td>
                  </tr>
                ))}
                {recentCalls.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Phone className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">No calls yet</p>
                          <p className="text-sm text-gray-400">Start testing the agent to see calls here!</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
