'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RatingStars } from '@/components/RatingStars'
import { getCalls } from '@/lib/api'
import { formatDuration, formatDateTime } from '@/lib/utils'
import type { Call, CallListResponse } from '@/types'
import { ChevronLeft, ChevronRight, Phone, Filter, Inbox, ArrowUpRight } from 'lucide-react'

export default function CallsPage() {
  const [data, setData] = useState<CallListResponse | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCalls() {
      setLoading(true)
      try {
        const result = await getCalls(page, 15, status || undefined)
        setData(result)
      } catch (error) {
        console.error('Failed to fetch calls:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCalls()
  }, [page, status])

  return (
    <div className="p-8 page-content">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dormero-red to-red-700">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Call Logs</h1>
            <p className="text-gray-500 text-sm">
              Review and rate customer conversations
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <CardTitle>All Calls</CardTitle>
            {data && (
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                {data.total} total
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className="text-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-dormero-red/20 focus:border-dormero-red cursor-pointer font-medium text-gray-700"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200" />
                <div className="absolute inset-0 animate-spin rounded-full h-10 w-10 border-4 border-dormero-red border-t-transparent" />
              </div>
              <p className="text-sm text-gray-500 mt-4 animate-pulse">Loading calls...</p>
            </div>
          ) : (
            <>
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
                        Summary
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
                    {data?.calls.map((call, index) => (
                      <tr
                        key={call.id}
                        className="hover:bg-blue-50/50 cursor-pointer group"
                        onClick={() => window.location.href = `/calls/${call.id}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 font-medium group-hover:text-dormero-red">
                              {formatDateTime(call.started_at)}
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {call.caller_id ?? <span className="text-gray-400 italic">Unknown</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          <span className="line-clamp-1">
                            {call.summary ?? <span className="text-gray-400 italic">No summary</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 tabular-nums font-medium">
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
                            <span className="inline-flex items-center gap-1 text-xs text-dormero-red font-medium hover:underline">
                              Add rating
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {data?.calls.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                              <Inbox className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-gray-700 font-medium">No calls found</p>
                              <p className="text-sm text-gray-400 mt-1">
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

              {/* Pagination */}
              {data && data.total_pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                  <p className="text-sm text-gray-500">
                    Showing <span className="font-medium text-gray-700">{(page - 1) * data.page_size + 1}</span> to{' '}
                    <span className="font-medium text-gray-700">{Math.min(page * data.page_size, data.total)}</span> of{' '}
                    <span className="font-medium text-gray-700">{data.total}</span> calls
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 px-3">
                      {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                        let pageNum
                        if (data.total_pages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= data.total_pages - 2) {
                          pageNum = data.total_pages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                              page === pageNum
                                ? 'bg-dormero-red text-white'
                                : 'text-gray-600 hover:bg-gray-100'
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
                      Next
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
