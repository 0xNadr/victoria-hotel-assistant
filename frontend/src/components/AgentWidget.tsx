'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Phone, PhoneOff, Mic, MicOff, Waves, Bot, User } from 'lucide-react'
import { Conversation } from '@elevenlabs/client'

interface AgentWidgetProps {
  agentId: string
}

export function AgentWidget({ agentId }: AgentWidgetProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [status, setStatus] = useState<string>('Ready to call')
  const [agentStatus, setAgentStatus] = useState<'listening' | 'speaking' | 'idle'>('idle')
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([])
  const conversationRef = useRef<any>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

  const startConversation = useCallback(async () => {
    try {
      setStatus('Requesting microphone...')

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true })

      setStatus('Connecting to Viktoria...')
      setTranscript([])

      const conversation = await Conversation.startSession({
        agentId: agentId,
        connectionType: 'websocket',
        onConnect: () => {
          setStatus('Connected')
          setIsCallActive(true)
          setAgentStatus('listening')
        },
        onDisconnect: () => {
          setStatus('Call ended')
          setIsCallActive(false)
          setAgentStatus('idle')
        },
        onMessage: (message) => {
          const msg = message as any
          if (msg.message) {
            setTranscript(prev => [...prev, {
              role: msg.source === 'user' ? 'user' : 'agent',
              text: msg.message
            }])
          }
        },
        onModeChange: (mode) => {
          setAgentStatus(mode.mode === 'speaking' ? 'speaking' : 'listening')
        },
        onError: (error) => {
          console.error('Conversation error:', error)
          setStatus('Connection error')
          setIsCallActive(false)
        },
      })

      conversationRef.current = conversation
    } catch (error: any) {
      console.error('Failed to start conversation:', error)
      if (error.name === 'NotAllowedError') {
        setStatus('Microphone access denied')
      } else {
        setStatus('Failed to connect')
      }
    }
  }, [agentId])

  const endConversation = useCallback(async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession()
      conversationRef.current = null
    }
    setIsCallActive(false)
    setStatus('Ready to call')
    setAgentStatus('idle')
  }, [])

  const toggleMute = useCallback(async () => {
    if (conversationRef.current) {
      const newMuted = !isMuted
      await conversationRef.current.setVolume({ volume: newMuted ? 0 : 1 })
      setIsMuted(newMuted)
    }
  }, [isMuted])

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession()
      }
    }
  }, [])

  return (
    <Card className="h-full flex flex-col overflow-hidden" hover={false}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-3 sm:px-6 py-3 sm:py-5 bg-gradient-to-r from-gray-50 to-white">
        <CardTitle className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${
                isCallActive
                  ? 'bg-gradient-to-br from-dormero-red to-red-600 shadow-lg shadow-red-500/30'
                  : 'bg-gray-100'
              }`}
            >
              <Bot className={`h-4 w-4 sm:h-5 sm:w-5 ${isCallActive ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white transition-colors ${
                isCallActive
                  ? agentStatus === 'speaking'
                    ? 'bg-dormero-red animate-pulse'
                    : 'bg-green-500 animate-pulse'
                  : 'bg-gray-300'
              }`}
            />
          </div>
          <div>
            <span className="block text-sm sm:text-base">Test Viktoria</span>
            <span className="text-xs text-gray-500 font-normal">Voice Agent</span>
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          {isCallActive && agentStatus === 'speaking' && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-red-100 text-dormero-red">
              <Waves className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse" />
              <span className="text-xs font-medium hidden sm:inline">Speaking</span>
            </div>
          )}
          {isCallActive && agentStatus === 'listening' && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-green-100 text-green-700">
              <Mic className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse" />
              <span className="text-xs font-medium hidden sm:inline">Listening</span>
            </div>
          )}
          {!isCallActive && (
            <span className="text-xs text-gray-400 px-2 py-0.5 sm:py-1 rounded-full bg-gray-100 max-w-[100px] sm:max-w-none truncate">{status}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Transcript Area */}
        <div
          ref={transcriptRef}
          className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-lg sm:rounded-xl p-3 sm:p-4 min-h-[200px] sm:min-h-[250px] max-h-[280px] sm:max-h-[350px] overflow-y-auto border border-gray-100"
        >
          {transcript.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-2 sm:px-4">
              <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 ${
                isCallActive
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl shadow-green-500/30'
                  : 'bg-gradient-to-br from-dormero-red/10 to-red-100'
              }`}>
                <Phone className={`h-7 w-7 sm:h-9 sm:w-9 ${isCallActive ? 'text-white' : 'text-dormero-red'}`} />
                {isCallActive && (
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl animate-ping bg-green-500/20" />
                )}
              </div>
              <p className="text-gray-700 font-medium text-sm sm:text-base">
                {isCallActive
                  ? 'Listening...'
                  : 'Test the Voice Agent'}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1.5 sm:mt-2 max-w-[180px] sm:max-w-[200px]">
                {isCallActive
                  ? 'Start speaking to Viktoria!'
                  : 'Click "Start Call" to begin a conversation'}
              </p>
              {!isCallActive && (
                <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-xs text-gray-400">
                  <Mic className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Microphone access required</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {transcript.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-blue-100'
                        : 'bg-gradient-to-br from-dormero-red to-red-600'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    ) : (
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] sm:max-w-[75%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white rounded-tr-sm sm:rounded-tr-md'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm sm:rounded-tl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2">
          {!isCallActive ? (
            <Button
              onClick={startConversation}
              className="gap-2 sm:gap-2.5 px-6 sm:px-8 shadow-lg shadow-dormero-red/25 hover:shadow-xl hover:shadow-dormero-red/30"
              size="lg"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Start Call</span>
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                variant="secondary"
                size="lg"
                className={`gap-1.5 sm:gap-2 px-3 sm:px-4 ${isMuted ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}`}
              >
                {isMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="text-sm sm:text-base">{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
              <Button
                onClick={endConversation}
                variant="secondary"
                size="lg"
                className="gap-1.5 sm:gap-2 px-3 sm:px-4 bg-red-100 text-red-700 hover:bg-red-200 shadow-md shadow-red-500/10"
              >
                <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">End Call</span>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
