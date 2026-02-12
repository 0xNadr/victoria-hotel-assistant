'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Phone, PhoneOff, Mic, MicOff, Waves, Bot, User } from 'lucide-react'
import { Conversation } from '@elevenlabs/client'
import { createCall, updateCall } from '@/lib/api'

interface AgentWidgetProps {
  agentId: string
}

export function AgentWidget({ agentId }: AgentWidgetProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [status, setStatus] = useState<string>('Ready')
  const [agentStatus, setAgentStatus] = useState<'listening' | 'speaking' | 'idle'>('idle')
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string; isTentative?: boolean }>>([])
  const [tentativeUserText, setTentativeUserText] = useState<string | null>(null)
  const conversationRef = useRef<any>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const callIdRef = useRef<string | null>(null)
  const callStartTimeRef = useRef<Date | null>(null)
  const userEndedCallRef = useRef(false)
  const transcriptRef2 = useRef<Array<{ role: string; text: string }>>([])

  // Keep transcript ref in sync for use in callbacks
  useEffect(() => {
    transcriptRef2.current = transcript
  }, [transcript])

  const startConversation = useCallback(async () => {
    try {
      setStatus('Connecting...')
      setTranscript([])
      userEndedCallRef.current = false

      const conversation = await Conversation.startSession({
        agentId: agentId,
        connectionType: 'webrtc',
        onConnect: async () => {
          setStatus('Connected')
          setIsCallActive(true)
          setAgentStatus('listening')

          // Create call record in database
          try {
            callStartTimeRef.current = new Date()
            const call = await createCall({
              started_at: callStartTimeRef.current.toISOString(),
              status: 'in_progress',
              caller_id: 'web-test',
            })
            callIdRef.current = call.id
          } catch (err) {
            console.error('Failed to create call record:', err)
          }
        },
        onDisconnect: async () => {
          // If user didn't intentionally end, this is a dropped call
          if (!userEndedCallRef.current && callIdRef.current && callStartTimeRef.current) {
            try {
              const endTime = new Date()
              const durationSeconds = Math.round(
                (endTime.getTime() - callStartTimeRef.current.getTime()) / 1000
              )
              const transcriptText = transcriptRef2.current
                .map((msg) => `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.text}`)
                .join('\n')

              await updateCall(callIdRef.current, {
                ended_at: endTime.toISOString(),
                duration_seconds: durationSeconds,
                status: 'dropped',
                transcript: transcriptText || undefined,
              })
            } catch (err) {
              console.error('Failed to update dropped call:', err)
            }
            callIdRef.current = null
            callStartTimeRef.current = null
          }
          userEndedCallRef.current = false
          setStatus('Call ended')
          setIsCallActive(false)
          setAgentStatus('idle')
        },
        onMessage: (message) => {
          const msg = message as any
          if (msg.message) {
            if (msg.source === 'user') {
              setTentativeUserText(null)
            }
            setTranscript(prev => [...prev, {
              role: msg.source === 'user' ? 'user' : 'agent',
              text: msg.message
            }])
          }
        },
        onModeChange: (mode) => {
          setAgentStatus(mode.mode === 'speaking' ? 'speaking' : 'listening')
          if (mode.mode === 'speaking') {
            setTentativeUserText(null)
          }
        },
        onDebug: (debugEvent) => {
          const event = debugEvent as any
          if (event?.type === 'tentative_user_transcript') {
            const text = event?.tentative_user_transcription_event?.user_transcript
            if (text) {
              setTentativeUserText(text)
            }
          }
        },
        onError: (error) => {
          console.error('Conversation error:', error)
          setStatus('Error')
          setIsCallActive(false)
        },
      })

      conversationRef.current = conversation
    } catch (error: any) {
      console.error('Failed to start conversation:', error)
      if (error.name === 'NotAllowedError') {
        setStatus('Mic denied')
      } else {
        setStatus('Failed')
      }
    }
  }, [agentId])

  const endConversation = useCallback(async () => {
    // Mark that user intentionally ended the call (not dropped)
    userEndedCallRef.current = true

    // Save call data before ending
    if (callIdRef.current && callStartTimeRef.current) {
      try {
        const endTime = new Date()
        const durationSeconds = Math.round(
          (endTime.getTime() - callStartTimeRef.current.getTime()) / 1000
        )

        // Format transcript for storage
        const transcriptText = transcript
          .map((msg) => `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.text}`)
          .join('\n')

        await updateCall(callIdRef.current, {
          ended_at: endTime.toISOString(),
          duration_seconds: durationSeconds,
          status: 'completed',
          transcript: transcriptText || undefined,
        })
      } catch (err) {
        console.error('Failed to update call record:', err)
      }
    }

    if (conversationRef.current) {
      await conversationRef.current.endSession()
      conversationRef.current = null
    }

    // Reset refs
    callIdRef.current = null
    callStartTimeRef.current = null

    setIsCallActive(false)
    setStatus('Ready')
    setAgentStatus('idle')
  }, [transcript])

  const toggleMute = useCallback(async () => {
    if (conversationRef.current) {
      const newMuted = !isMuted
      await conversationRef.current.setVolume({ volume: newMuted ? 0 : 1 })
      setIsMuted(newMuted)
    }
  }, [isMuted])

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript, tentativeUserText])

  useEffect(() => {
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession()
      }
    }
  }, [])

  return (
    <Card className="h-full flex flex-col overflow-hidden" hover={false}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-slate-50/50">
        <CardTitle className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isCallActive ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <Bot className={`h-4 w-4 ${isCallActive ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white transition-colors ${
                isCallActive
                  ? agentStatus === 'speaking'
                    ? 'bg-violet-500'
                    : 'bg-emerald-500'
                  : 'bg-slate-300'
              }`}
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-900">Test Agent</span>
            <span className="text-xs text-slate-500">Voice Assistant</span>
          </div>
        </CardTitle>
        <div className="flex items-center">
          {isCallActive && agentStatus === 'speaking' && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-violet-50 text-violet-700">
              <Waves className="h-3 w-3" />
              <span className="text-xs font-medium">Speaking</span>
            </div>
          )}
          {isCallActive && agentStatus === 'listening' && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-700">
              <Mic className="h-3 w-3" />
              <span className="text-xs font-medium">Listening</span>
            </div>
          )}
          {!isCallActive && (
            <span className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-100">{status}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 p-4">
        {/* Transcript Area */}
        <div
          ref={transcriptRef}
          className="flex-1 bg-slate-50 rounded-lg p-3 min-h-[200px] max-h-[300px] overflow-y-auto border border-slate-100"
        >
          {transcript.length === 0 && !tentativeUserText ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                isCallActive
                  ? 'bg-emerald-100'
                  : 'bg-slate-100'
              }`}>
                <Phone className={`h-6 w-6 ${isCallActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              </div>
              <p className="text-sm font-medium text-slate-700">
                {isCallActive ? 'Listening...' : 'Test the Voice Agent'}
              </p>
              <p className="text-xs text-slate-400 mt-1.5 max-w-[180px]">
                {isCallActive
                  ? 'Start speaking to the agent'
                  : 'Click Start Call to begin'}
              </p>
              {!isCallActive && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                  <Mic className="h-3 w-3" />
                  <span>Microphone required</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {transcript.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-slate-200' : 'bg-slate-900'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-3 w-3 text-slate-600" />
                    ) : (
                      <Bot className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {tentativeUserText && (
                <div className="flex gap-2 flex-row-reverse">
                  <div className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center bg-slate-200">
                    <User className="h-3 w-3 text-slate-600" />
                  </div>
                  <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-500 italic">
                    {tentativeUserText}...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {!isCallActive ? (
            <Button onClick={startConversation} size="lg" className="gap-2">
              <Phone className="h-4 w-4" />
              Start Call
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                variant="secondary"
                size="lg"
                className={`gap-1.5 ${isMuted ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}`}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              <Button
                onClick={endConversation}
                variant="secondary"
                size="lg"
                className="gap-1.5 bg-red-50 text-red-700 hover:bg-red-100"
              >
                <PhoneOff className="h-4 w-4" />
                End
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
