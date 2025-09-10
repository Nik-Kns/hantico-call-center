'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Phone, PhoneOff, PhoneIncoming, Mic, MicOff, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CallTestModalProps {
  isOpen: boolean
  onClose: () => void
  agentName?: string
}

type CallState = 'dialing' | 'ringing' | 'answering' | 'connected' | 'ended'

export function CallTestModal({ isOpen, onClose, agentName = 'AI Agent' }: CallTestModalProps) {
  const [callState, setCallState] = useState<CallState>('dialing')
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [aiResponses] = useState([
    'Здравствуйте! Это компания Hantico. Чем могу помочь?',
    'Да, конечно, я могу рассказать вам о наших услугах.',
    'Мы предлагаем полный спектр решений для автоматизации колл-центров.',
    'Хотели бы вы записаться на демонстрацию?',
    'Отлично! Я передам вашу заявку менеджеру.',
    'Спасибо за обращение! Хорошего дня!'
  ])

  const startCallTimer = () => {
    intervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }

  const simulateAIResponses = useCallback(() => {
    let index = 0
    const responseInterval = setInterval(() => {
      if (index < aiResponses.length) {
        setCurrentResponseIndex(index)
        index++
      } else {
        clearInterval(responseInterval)
      }
    }, 4000)
    
    return () => clearInterval(responseInterval)
  }, [aiResponses])

  useEffect(() => {
    if (isOpen) {
      setCallState('dialing')
      setCallDuration(0)
      setCurrentResponseIndex(0)
      
      // Имитация процесса звонка
      setTimeout(() => setCallState('ringing'), 1000)
      setTimeout(() => setCallState('answering'), 3000)
      setTimeout(() => {
        setCallState('connected')
        startCallTimer()
        simulateAIResponses()
      }, 4000)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isOpen, simulateAIResponses])

  const handleEndCall = () => {
    setCallState('ended')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const handleAnswerCall = () => {
    setCallState('connected')
    startCallTimer()
    simulateAIResponses()
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStateMessage = () => {
    switch (callState) {
      case 'dialing': return 'Набираем номер...'
      case 'ringing': return 'Звоним...'
      case 'answering': return 'Абонент отвечает...'
      case 'connected': return formatDuration(callDuration)
      case 'ended': return 'Звонок завершен'
      default: return ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Тестовый звонок</DialogTitle>
          <DialogDescription>
            Тестирование {agentName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          {/* Анимация состояния звонка */}
          <div className="relative w-32 h-32">
            <div className={`absolute inset-0 rounded-full bg-green-500 opacity-20 ${
              callState === 'ringing' ? 'animate-ping' : ''
            }`} />
            <div className={`absolute inset-0 rounded-full bg-green-500 opacity-30 ${
              callState === 'connected' ? 'animate-pulse' : ''
            }`} />
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              {callState === 'ended' ? (
                <PhoneOff className="w-12 h-12 text-white" />
              ) : callState === 'ringing' ? (
                <PhoneIncoming className="w-12 h-12 text-white animate-bounce" />
              ) : (
                <Phone className={`w-12 h-12 text-white ${
                  callState === 'connected' ? '' : 'animate-pulse'
                }`} />
              )}
            </div>
          </div>

          {/* Статус звонка */}
          <div className="text-center">
            <p className="text-2xl font-bold">{getStateMessage()}</p>
            {callState === 'connected' && (
              <p className="text-sm text-gray-500 mt-1">
                Идет тестирование AI агента
              </p>
            )}
          </div>

          {/* Кнопка ответа на звонок */}
          {callState === 'ringing' && (
            <Button
              onClick={handleAnswerCall}
              className="rounded-full px-8 py-3 bg-green-500 hover:bg-green-600"
            >
              <Phone className="w-5 h-5 mr-2" />
              Ответить
            </Button>
          )}

          {/* Текущий ответ AI */}
          {callState === 'connected' && (
            <div className="w-full p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="w-4 h-4 text-green-600 animate-pulse" />
                <span className="text-sm font-medium">AI Agent:</span>
              </div>
              <p className="text-sm text-gray-700 italic">
                {aiResponses[currentResponseIndex]}
              </p>
            </div>
          )}

          {/* Контролы звонка */}
          {callState === 'connected' && (
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                className="rounded-full w-12 h-12"
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5 text-red-500" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
              
              <Button
                variant="destructive"
                size="icon"
                onClick={handleEndCall}
                className="rounded-full w-16 h-16"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          )}

          {/* Индикатор микрофона */}
          {callState === 'connected' && !isMuted && (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-6 bg-green-500 animate-pulse" style={{ animationDelay: '100ms' }} />
                <div className="w-1 h-3 bg-green-500 animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="w-1 h-5 bg-green-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
              <span className="text-xs text-gray-500">Микрофон активен</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}