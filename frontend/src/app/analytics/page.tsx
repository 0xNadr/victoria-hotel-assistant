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
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-gray-200" />
            <div className="absolute inset-0 animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-dormero-red border-t-transparent" />
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
    <div className="p-4 sm:p-6 lg:p-8 page-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dormero-red to-red-700">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Performance metrics and insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl p-1">
          {[
            { value: 7, label: '7D' },
            { value: 30, label: '30D' },
            { value: 90, label: '90D' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDays(option.value)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card className="card-animate group">
          <CardContent className="p-3 sm:p-6 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Total Calls</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                  {metrics?.total_calls ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate group">
          <CardContent className="p-3 sm:p-6 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Success Rate</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                  {metrics && metrics.total_calls > 0
                    ? `${((metrics.completed_calls / metrics.total_calls) * 100).toFixed(0)}%`
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate group">
          <CardContent className="p-3 sm:p-6 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Avg Duration</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                  {metrics?.average_duration_seconds != null
                    ? `${Math.floor(metrics.average_duration_seconds / 60)}:${String(Math.floor(metrics.average_duration_seconds % 60)).padStart(2, '0')}`
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-animate group">
          <CardContent className="p-3 sm:p-6 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Avg Rating</p>
                <div className="flex items-center gap-1 sm:gap-2">
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 tabular-nums">
                    {metrics?.average_rating?.toFixed(1) ?? '-'}
                  </p>
                  {metrics?.average_rating && (
                    <span className="hidden sm:block">
                      <RatingStars
                        rating={Math.round(metrics.average_rating)}
                        size="sm"
                      />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Call Volume Over Time */}
        <Card className="card-animate">
          <CardHeader className="bg-gray-50/50 px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              Call Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 sm:pt-6">
            {callVolume.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
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
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
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
                    stroke="#C41230"
                    strokeWidth={2}
                    fill="url(#colorCalls)"
                    name="Calls"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] sm:h-[250px] flex flex-col items-center justify-center text-gray-500">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                <p className="font-medium text-sm">No data available</p>
                <p className="text-xs sm:text-sm text-gray-400">Calls will appear here once recorded</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="card-animate">
          <CardHeader className="bg-gray-50/50 px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
              </div>
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 sm:pt-6">
            {totalRatings > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <ResponsiveContainer width="100%" height={180} className="sm:!w-[45%] sm:!h-[220px]">
                  <PieChart>
                    <Pie
                      data={ratings.filter((r) => r.count > 0)}
                      dataKey="count"
                      nameKey="rating"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
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
                        fontSize: '12px',
                      }}
                      formatter={(value, name) => [value, `${name} stars`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full sm:flex-1 space-y-2 sm:space-y-3">
                  {ratingPercentages.map((r) => (
                    <div key={r.rating} className="flex items-center gap-2 sm:gap-3 group">
                      <div className="flex items-center gap-1 sm:gap-1.5 w-12 sm:w-16">
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">{r.rating}</span>
                        <Star
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          style={{ fill: COLORS[r.rating - 1], color: COLORS[r.rating - 1] }}
                        />
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 sm:h-2.5 overflow-hidden">
                        <div
                          className="h-2 sm:h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${r.percentage}%`,
                            backgroundColor: COLORS[r.rating - 1],
                          }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 w-16 sm:w-20 text-right tabular-nums">
                        {r.count} ({r.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] sm:h-[250px] flex flex-col items-center justify-center text-gray-500">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                <p className="font-medium text-sm">No ratings yet</p>
                <p className="text-xs sm:text-sm text-gray-400">Ratings will appear here once submitted</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback Coverage */}
        <Card className="card-animate">
          <CardHeader className="bg-gray-50/50 px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
              </div>
              Feedback Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 sm:pt-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Calls with feedback</span>
                <span className="text-base sm:text-lg font-bold text-gray-900 tabular-nums">
                  {metrics?.calls_with_feedback ?? 0} / {metrics?.total_calls ?? 0}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-4 sm:h-5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-dormero-red to-red-500 h-4 sm:h-5 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width:
                        metrics && metrics.total_calls > 0
                          ? `${(metrics.calls_with_feedback / metrics.total_calls) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 text-center">
                {metrics && metrics.total_calls > 0
                  ? `${((metrics.calls_with_feedback / metrics.total_calls) * 100).toFixed(1)}% of calls have been rated`
                  : 'No calls to rate yet'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="card-animate">
          <CardHeader className="bg-gray-50/50 px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
              </div>
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 sm:pt-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="p-3 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border border-green-100">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                  <p className="text-xs sm:text-sm text-green-600 font-medium">Completed</p>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-green-700 tabular-nums">
                  {metrics?.completed_calls ?? 0}
                </p>
              </div>
              <div className="p-3 sm:p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl sm:rounded-2xl border border-red-100">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                  <p className="text-xs sm:text-sm text-red-600 font-medium">Dropped</p>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-red-700 tabular-nums">
                  {metrics?.dropped_calls ?? 0}
                </p>
              </div>
              <div className="p-3 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-100">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">Total Ratings</p>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-blue-700 tabular-nums">
                  {metrics?.total_ratings ?? 0}
                </p>
              </div>
              <div className="p-3 sm:p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl sm:rounded-2xl border border-purple-100">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                  <p className="text-xs sm:text-sm text-purple-600 font-medium">Feedback</p>
                </div>
                <p className="text-xl sm:text-3xl font-bold text-purple-700 tabular-nums">
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
