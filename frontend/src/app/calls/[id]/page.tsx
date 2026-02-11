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
  Phone,
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

      // Refresh call data
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dormero-red" />
      </div>
    )
  }

  if (!call) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Call not found</p>
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
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to calls
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Call Details</h1>
            <p className="text-gray-500 mt-1">
              {formatDate(call.started_at)} at {formatTime(call.started_at)}
            </p>
          </div>
          <Badge variant={statusVariant} className="text-sm px-3 py-1">
            {call.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              {call.transcript ? (
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {call.transcript}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500 italic">No transcript available</p>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add notes about this call..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-dormero-red focus:border-transparent resize-none"
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
                    <span className="text-sm text-green-600">
                      Feedback saved successfully!
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Call Info */}
          <Card>
            <CardHeader>
              <CardTitle>Call Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Caller</p>
                  <p className="text-sm font-medium text-gray-900">
                    {call.caller_id ?? 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDuration(call.duration_seconds)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(call.started_at)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTime(call.started_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {call.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{call.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Topics */}
          {call.topics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
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
