'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RatingStars } from '@/components/RatingStars'
import { getCalls } from '@/lib/api'
import { formatDuration, formatDateTime } from '@/lib/utils'
import type { CallListResponse } from '@/types'
import { ChevronLeft, ChevronRight, Phone, Filter, Inbox, ArrowUpRight } from 'lucide-react'

export default function CallsPage() {
  const [data, setData] = useState<CallListResponse | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCalls(showLoading = true) {
      if (showLoading) setLoading(true)
      try {
        const result = await getCalls(page, 15, status || undefined)
        setData(result)
      } catch (error) {
        console.error('Failed to fetch calls:', error)
      } finally {
        if (showLoading) setLoading(false)
      }
    }
    fetchCalls()

    // Auto-refresh every 10 seconds (silent, no loading spinner)
    const interval = setInterval(() => fetchCalls(false), 10000)
    return () => clearInterval(interval)
  }, [page, status])

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-content max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900">Call Logs</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and rate customer conversations
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2">
            <CardTitle>All Calls</CardTitle>
            {data && (
              <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-600">
                {data.total}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 cursor-pointer text-slate-700 w-full sm:w-auto"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200" />
                <div className="absolute inset-0 animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent" />
              </div>
              <p className="text-sm text-slate-500 mt-4">Loading calls...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
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
                        Summary
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
                    {data?.calls.map((call) => (
                      <tr
                        key={call.id}
                        className="hover:bg-slate-50/80 cursor-pointer group"
                        onClick={() => window.location.href = `/calls/${call.id}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-900 group-hover:text-slate-700">
                              {formatDateTime(call.started_at)}
                            </span>
                            <ArrowUpRight className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">
                          {call.caller_id ?? <span className="text-slate-400">Unknown</span>}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 max-w-xs">
                          <span className="line-clamp-1">
                            {call.summary ?? <span className="text-slate-400">No summary</span>}
                          </span>
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
                    {data?.calls.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Inbox className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">No calls found</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {status ? 'Try adjusting your filter' : 'Calls will appear here once recorded'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-gray-100">
                {data?.calls.map((call) => (
                  <div
                    key={call.id}
                    className="p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer"
                    onClick={() => window.location.href = `/calls/${call.id}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {formatDateTime(call.started_at)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {call.caller_id ?? 'Unknown caller'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
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
                    {call.summary && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {call.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 tabular-nums">
                        {formatDuration(call.duration_seconds)}
                      </span>
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
                {data?.calls.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Inbox className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">No calls found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {status ? 'Try adjusting your filter' : 'Calls will appear here once recorded'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {data && data.total_pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-5 py-3 border-t border-gray-100 bg-slate-50/30">
                  <p className="text-xs text-slate-500 order-2 sm:order-1">
                    Showing <span className="font-medium text-slate-700">{(page - 1) * data.page_size + 1}</span> to{' '}
                    <span className="font-medium text-slate-700">{Math.min(page * data.page_size, data.total)}</span> of{' '}
                    <span className="font-medium text-slate-700">{data.total}</span>
                  </p>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5, data.total_pages) }, (_, i) => {
                        let pageNum
                        const maxPages = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5
                        if (data.total_pages <= maxPages) {
                          pageNum = i + 1
                        } else if (page <= Math.ceil(maxPages / 2)) {
                          pageNum = i + 1
                        } else if (page >= data.total_pages - Math.floor(maxPages / 2)) {
                          pageNum = data.total_pages - maxPages + 1 + i
                        } else {
                          pageNum = page - Math.floor(maxPages / 2) + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                              page === pageNum
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                      disabled={page === data.total_pages}
                      className="gap-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
