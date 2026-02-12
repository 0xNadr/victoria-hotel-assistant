'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RatingStars } from '@/components/RatingStars'
import {
  getSummaryMetrics,
  getCallsOverTime,
  getRatingDistribution,
} from '@/lib/api'
import type { SummaryMetrics, CallVolumePoint, RatingDistribution } from '@/types'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, Phone, Star, Clock, BarChart3, MessageSquare, CheckCircle2, XCircle } from 'lucide-react'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null)
  const [callVolume, setCallVolume] = useState<CallVolumePoint[]>([])
  const [ratings, setRatings] = useState<RatingDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    async function fetchData(showLoading = true) {
      if (showLoading) setLoading(true)
      try {
        const [metricsData, volumeData, ratingsData] = await Promise.all([
          getSummaryMetrics(days),
          getCallsOverTime(days),
          getRatingDistribution(days),
        ])
        setMetrics(metricsData)
        setCallVolume(volumeData)
        setRatings(ratingsData)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        if (showLoading) setLoading(false)
      }
    }
    fetchData()

    // Auto-refresh every 15 seconds (silent, no loading spinner)
    const interval = setInterval(() => fetchData(false), 15000)
    return () => clearInterval(interval)
  }, [days])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200" />
            <div className="absolute inset-0 animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent" />
          </div>
          <p className="text-sm text-slate-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const totalRatings = ratings.reduce((sum, r) => sum + r.count, 0)
  const ratingPercentages = ratings.map((r) => ({
    ...r,
    percentage: totalRatings > 0 ? ((r.count / totalRatings) * 100).toFixed(1) : 0,
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-content max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">
            Performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {[
            { value: 7, label: '7D' },
            { value: 30, label: '30D' },
            { value: 90, label: '90D' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDays(option.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                days === option.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="card-animate">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Calls</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {metrics?.total_calls ?? 0}
                </p>
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
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Success Rate</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {metrics && metrics.total_calls > 0
                    ? `${((metrics.completed_calls / metrics.total_calls) * 100).toFixed(0)}%`
                    : '-'}
                </p>
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
                  {metrics?.average_duration_seconds != null
                    ? `${Math.floor(metrics.average_duration_seconds / 60)}:${String(Math.floor(metrics.average_duration_seconds % 60)).padStart(2, '0')}`
                    : '-'}
                </p>
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
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-semibold text-slate-900 tabular-nums">
                    {metrics?.average_rating?.toFixed(1) ?? '-'}
                  </p>
                  {metrics?.average_rating && (
                    <RatingStars rating={Math.round(metrics.average_rating)} size="sm" />
                  )}
                </div>
              </div>
              <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Star className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Call Volume Over Time */}
        <Card className="card-animate">
          <CardHeader className="px-4 sm:px-5 py-3">
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-slate-600" />
              </div>
              Call Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {callVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={callVolume}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0f172a"
                    strokeWidth={2}
                    fill="url(#colorCalls)"
                    name="Calls"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-slate-500">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm">No data available</p>
                <p className="text-xs text-slate-400">Calls will appear here once recorded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="card-animate">
          <CardHeader className="px-4 sm:px-5 py-3">
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Star className="h-3.5 w-3.5 text-amber-500" />
              </div>
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {totalRatings > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <ResponsiveContainer width="100%" height={160} className="sm:!w-[40%] sm:!h-[180px]">
                  <PieChart>
                    <Pie
                      data={ratings.filter((r) => r.count > 0)}
                      dataKey="count"
                      nameKey="rating"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                    >
                      {ratings.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.rating - 1]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                      }}
                      formatter={(value, name) => [value, `${name} stars`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full sm:flex-1 space-y-2">
                  {ratingPercentages.map((r) => (
                    <div key={r.rating} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-10">
                        <span className="text-xs font-medium text-slate-700">{r.rating}</span>
                        <Star
                          className="h-3 w-3"
                          style={{ fill: COLORS[r.rating - 1], color: COLORS[r.rating - 1] }}
                        />
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${r.percentage}%`,
                            backgroundColor: COLORS[r.rating - 1],
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-16 text-right tabular-nums">
                        {r.count} ({r.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex flex-col items-center justify-center text-slate-500">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                  <Star className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm">No ratings yet</p>
                <p className="text-xs text-slate-400">Ratings will appear here once submitted</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Coverage */}
        <Card className="card-animate">
          <CardHeader className="px-4 sm:px-5 py-3">
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <MessageSquare className="h-3.5 w-3.5 text-violet-600" />
              </div>
              Feedback Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Calls with feedback</span>
                <span className="text-base font-semibold text-slate-900 tabular-nums">
                  {metrics?.calls_with_feedback ?? 0} / {metrics?.total_calls ?? 0}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-slate-900 h-3 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width:
                        metrics && metrics.total_calls > 0
                          ? `${(metrics.calls_with_feedback / metrics.total_calls) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                {metrics && metrics.total_calls > 0
                  ? `${((metrics.calls_with_feedback / metrics.total_calls) * 100).toFixed(1)}% of calls have been rated`
                  : 'No calls to rate yet'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="card-animate">
          <CardHeader className="px-4 sm:px-5 py-3">
            <CardTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-slate-600" />
              </div>
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <p className="text-xs text-emerald-600 font-medium">Completed</p>
                </div>
                <p className="text-xl font-semibold text-emerald-700 tabular-nums">
                  {metrics?.completed_calls ?? 0}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                  <p className="text-xs text-red-600 font-medium">Dropped</p>
                </div>
                <p className="text-xl font-semibold text-red-700 tabular-nums">
                  {metrics?.dropped_calls ?? 0}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="h-3.5 w-3.5 text-slate-600" />
                  <p className="text-xs text-slate-600 font-medium">Total Ratings</p>
                </div>
                <p className="text-xl font-semibold text-slate-700 tabular-nums">
                  {metrics?.total_ratings ?? 0}
                </p>
              </div>
              <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquare className="h-3.5 w-3.5 text-violet-600" />
                  <p className="text-xs text-violet-600 font-medium">Feedback</p>
                </div>
                <p className="text-xl font-semibold text-violet-700 tabular-nums">
                  {metrics && metrics.total_calls > 0
                    ? `${((metrics.calls_with_feedback / metrics.total_calls) * 100).toFixed(0)}%`
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
