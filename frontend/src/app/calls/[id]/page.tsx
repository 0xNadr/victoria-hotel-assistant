'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RatingStars } from '@/components/RatingStars'
import { getCall, submitFeedback, updateFeedback } from '@/lib/api'
import { formatDuration, formatDate, formatTime } from '@/lib/utils'
import type { Call } from '@/types'
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  MessageSquare,
  Tag,
} from 'lucide-react'

export default function CallDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [call, setCall] = useState<Call | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  useEffect(() => {
    async function fetchCall() {
      try {
        const data = await getCall(params.id as string)
        setCall(data)
        if (data.feedback) {
          setRating(data.feedback.rating)
          setComment(data.feedback.comment ?? '')
        }
      } catch (error) {
        console.error('Failed to fetch call:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCall()
  }, [params.id])

  const handleSubmitFeedback = async () => {
    if (!call || rating === 0) return

    setSubmitting(true)
    try {
      const feedbackData = {
        rating,
        comment: comment || undefined,
      }

      if (call.feedback) {
        await updateFeedback(call.id, feedbackData)
      } else {
        await submitFeedback(call.id, feedbackData)
      }

      setFeedbackSuccess(true)
      setTimeout(() => setFeedbackSuccess(false), 3000)

      const updatedCall = await getCall(call.id)
      setCall(updatedCall)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

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

  if (!call) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Call not found</p>
      </div>
    )
  }

  const statusVariant =
    call.status === 'completed'
      ? 'success'
      : call.status === 'dropped'
      ? 'error'
      : 'warning'

  return (
    <div className="p-4 sm:p-6 lg:p-8 page-content max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to calls
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Call Details</h1>
            <p className="text-slate-500 text-sm mt-1">
              {formatDate(call.started_at)} at {formatTime(call.started_at)}
            </p>
          </div>
          <Badge variant={statusVariant} className="text-sm px-2.5 py-1">
            {call.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Transcript */}
          <Card>
            <CardHeader className="px-4 sm:px-5 py-3">
              <CardTitle className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-600" />
                </div>
                Transcript
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 py-4">
              {call.transcript ? (
                <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-slate-100">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {call.transcript}
                  </pre>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No transcript available</p>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader className="px-4 sm:px-5 py-3">
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rating
                  </label>
                  <RatingStars
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Comment (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add notes about this call..."
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={rating === 0 || submitting}
                  >
                    {submitting
                      ? 'Saving...'
                      : call.feedback
                      ? 'Update Feedback'
                      : 'Submit Feedback'}
                  </Button>
                  {feedbackSuccess && (
                    <span className="text-sm text-emerald-600">
                      Feedback saved!
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Call Info */}
          <Card>
            <CardHeader className="px-4 sm:px-5 py-3">
              <CardTitle>Call Information</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Caller</p>
                  <p className="text-sm font-medium text-slate-900">
                    {call.caller_id ?? 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDuration(call.duration_seconds)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date & Time</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(call.started_at)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTime(call.started_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {call.summary && (
            <Card>
              <CardHeader className="px-4 sm:px-5 py-3">
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-5 py-4">
                <p className="text-sm text-slate-600">{call.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Topics */}
          {call.topics && (
            <Card>
              <CardHeader className="px-4 sm:px-5 py-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Tag className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {call.topics.split(',').map((topic) => (
                    <Badge key={topic} variant="default">
                      {topic.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
