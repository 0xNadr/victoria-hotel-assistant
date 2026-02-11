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
  LineChart,
  Line,
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
    async function fetchData() {
      setLoading(true)
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
        setLoading(false)
      }
    }
    fetchData()
  }, [days])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200" />
            <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-dormero-red border-t-transparent" />
          </div>
          <p className="text-sm text-gray-500 animate-pulse">Loading analytics...</p>
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
    <div className="p-8 page-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dormero-red to-red-700">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
            <p className="text-gray-500 text-sm">
              Performance metrics and insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1">
          {[
            { value: 7, label: '7D' },
            { value: 30, label: '30D' },
            { value: 90, label: '90D' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDays(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                days === option.value
                  ? 'bg-dormero-red text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-animate group">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Calls</p>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {metrics?.total_calls ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate group">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {metrics && metrics.total_calls > 0
                    ? `${((metrics.completed_calls / metrics.total_calls) * 100).toFixed(1)}%`
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate group">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg Duration</p>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">
                  {metrics?.average_duration_seconds
                    ? `${Math.floor(metrics.average_duration_seconds / 60)}:${String(Math.floor(metrics.average_duration_seconds % 60)).padStart(2, '0')}`
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate group">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">
                    {metrics?.average_rating?.toFixed(1) ?? '-'}
                  </p>
                  {metrics?.average_rating && (
                    <RatingStars
                      rating={Math.round(metrics.average_rating)}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Over Time */}
        <Card className="card-animate">
          <CardHeader className="bg-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Phone className="h-4 w-4 text-blue-600" />
              </div>
              Call Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {callVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={callVolume}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C41230" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#C41230" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#C41230"
                    strokeWidth={2.5}
                    fill="url(#colorCalls)"
                    name="Calls"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Phone className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-medium">No data available</p>
                <p className="text-sm text-gray-400">Calls will appear here once recorded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="card-animate">
          <CardHeader className="bg-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {totalRatings > 0 ? (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="45%" height={250}>
                  <PieChart>
                    <Pie
                      data={ratings.filter((r) => r.count > 0)}
                      dataKey="count"
                      nameKey="rating"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
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
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value, name) => [value, `${name} stars`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {ratingPercentages.map((r) => (
                    <div key={r.rating} className="flex items-center gap-3 group">
                      <div className="flex items-center gap-1.5 w-16">
                        <span className="text-sm font-semibold text-gray-700">{r.rating}</span>
                        <Star
                          className="h-4 w-4"
                          style={{ fill: COLORS[r.rating - 1], color: COLORS[r.rating - 1] }}
                        />
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${r.percentage}%`,
                            backgroundColor: COLORS[r.rating - 1],
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-20 text-right tabular-nums">
                        {r.count} ({r.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-gray-500">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-medium">No ratings yet</p>
                <p className="text-sm text-gray-400">Ratings will appear here once submitted</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Coverage */}
        <Card className="card-animate">
          <CardHeader className="bg-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-purple-600" />
              </div>
              Feedback Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Calls with feedback</span>
                <span className="text-lg font-bold text-gray-900 tabular-nums">
                  {metrics?.calls_with_feedback ?? 0} / {metrics?.total_calls ?? 0}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-dormero-red to-red-500 h-5 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width:
                        metrics && metrics.total_calls > 0
                          ? `${(metrics.calls_with_feedback / metrics.total_calls) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-white"
                  style={{
                    left: metrics && metrics.total_calls > 0
                      ? `calc(${Math.min((metrics.calls_with_feedback / metrics.total_calls) * 100, 95)}% - 20px)`
                      : '0%',
                    display: metrics && metrics.calls_with_feedback > 0 ? 'block' : 'none'
                  }}
                >
                  {metrics && metrics.total_calls > 0
                    ? `${((metrics.calls_with_feedback / metrics.total_calls) * 100).toFixed(0)}%`
                    : ''}
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center">
                {metrics && metrics.total_calls > 0
                  ? `${((metrics.calls_with_feedback / metrics.total_calls) * 100).toFixed(1)}% of calls have been rated`
                  : 'No calls to rate yet'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="card-animate">
          <CardHeader className="bg-gray-50/50">
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </div>
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-600 font-medium">Completed</p>
                </div>
                <p className="text-3xl font-bold text-green-700 tabular-nums">
                  {metrics?.completed_calls ?? 0}
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600 font-medium">Dropped</p>
                </div>
                <p className="text-3xl font-bold text-red-700 tabular-nums">
                  {metrics?.dropped_calls ?? 0}
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-600 font-medium">Total Ratings</p>
                </div>
                <p className="text-3xl font-bold text-blue-700 tabular-nums">
                  {metrics?.total_ratings ?? 0}
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-purple-600 font-medium">Feedback Rate</p>
                </div>
                <p className="text-3xl font-bold text-purple-700 tabular-nums">
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
