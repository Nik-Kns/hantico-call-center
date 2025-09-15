'use client'

import React, { useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Send,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  Bot,
  User,
  Mic,
  MicOff
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { mockAgents, mockVoices } from '@/lib/mock-data'
import { AgentTest } from '@/lib/types'
import { Phone } from 'lucide-react'

interface TestMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
  stage?: string
  audioUrl?: string
}

export default function AgentTestPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  
  const agent = mockAgents.find(a => a.id === agentId)
  const voice = mockVoices.find(v => v.id === agent?.voiceId)
  
  const [messages, setMessages] = useState<TestMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState('greeting')
  const [isListening, setIsListening] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'in_call'>('idle')
  const [isVoiceCall, setIsVoiceCall] = useState(false)
  const recognitionRef = useRef<any | null>(null)

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Агент не найден</p>
        <Button className="mt-4" onClick={() => router.back()}>
          Назад к списку агентов
        </Button>
      </div>
    )
  }

  const handleSendMessage = async (textParam?: string | React.MouseEvent<HTMLButtonElement>) => {
    const textToSend = typeof textParam === 'string' ? textParam.trim() : inputMessage.trim()
    if (!textToSend) return

    const userMessage: TestMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: textToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Имитация обработки сообщения агентом
    await new Promise(resolve => setTimeout(resolve, agent.settings.responseDelay))

    // Поиск подходящего промта
    const currentPrompt = agent.prompts.find(p => p.stage === currentStage)
    let agentResponse = currentPrompt?.prompt || 'Извините, я не знаю как ответить на это.'

    // Простая логика обработки ответов
    const lowerInput = textToSend.toLowerCase()
    if (lowerInput.includes('да') || lowerInput.includes('согласен') || lowerInput.includes('хорошо')) {
      if (currentStage === 'greeting') {
        setCurrentStage('consent_question')
        const nextPrompt = agent.prompts.find(p => p.stage === 'consent_question')
        agentResponse = nextPrompt?.prompt || 'Спасибо! Могу я отправить вам информацию по SMS?'
      } else if (currentStage === 'consent_question') {
        agentResponse = 'Отлично! Я отправлю вам SMS с подробной информацией. Спасибо за время!'
        setCurrentStage('completed')
      }
    } else if (lowerInput.includes('нет') || lowerInput.includes('не хочу') || lowerInput.includes('не интересно')) {
      setCurrentStage('rejection_response')
      const rejectionPrompt = agent.prompts.find(p => p.stage === 'rejection_response')
      agentResponse = rejectionPrompt?.prompt || 'Понимаю. Спасибо за время!'
    }

    const agentMessage: TestMessage = {
      id: `msg-${Date.now()}-agent`,
      type: 'agent',
      content: agentResponse,
      timestamp: new Date(),
      stage: currentStage,
      audioUrl: `/test-audio/${agent.id}-${currentStage}.mp3`
    }

    setMessages(prev => [...prev, agentMessage])
    setIsLoading(false)
  }

  const handleReset = () => {
    setMessages([])
    setCurrentStage('greeting')
    setInputMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // Здесь была бы интеграция с Web Speech API
  }

  // Голосовой режим через микрофон (без телефонии)
  const startVoiceCall = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) {
      alert('Браузер не поддерживает распознавание речи')
      return
    }
    const rec = new SR()
    rec.lang = 'ru-RU'
    rec.continuous = true
    rec.interimResults = false
    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(' ')
      if (transcript && !isLoading) {
        handleSendMessage(transcript)
      }
    }
    rec.onend = () => {
      if (isVoiceCall) rec.start()
    }
    rec.start()
    recognitionRef.current = rec
    setIsVoiceCall(true)
    setCallStatus('in_call')
  }

  const stopVoiceCall = () => {
    try {
      recognitionRef.current?.stop?.()
    } catch {}
    recognitionRef.current = null
    setIsVoiceCall(false)
  }

  const getStageTitle = (stage: string) => {
    const stageMap: Record<string, string> = {
      'greeting': 'Приветствие',
      'consent_question': 'Вопрос о согласии',
      'rejection_response': 'Обработка отказа',
      'offer_presentation': 'Презентация предложения',
      'completed': 'Завершение'
    }
    return stageMap[stage] || stage
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Тестирование агента
            </h1>
            <p className="text-gray-600">
              {agent.name} • {voice?.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Сброс
          </Button>
        </div>
      </div>

      {/* Верхняя панель теста: номер и запуск */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <p className="text-sm text-gray-600 mb-1">Номер для теста</p>
              <Input
                placeholder="+7 900 000-00-00"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>Текущий голос: <span className="font-medium">{voice?.name}</span></p>
              <p>Статус: {
                callStatus === 'idle' ? 'Готов' :
                callStatus === 'calling' ? 'Исходящий вызов' :
                callStatus === 'ringing' ? 'Ожидание ответа' : 'Разговор'
              }</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => { setCallStatus('calling'); setTimeout(() => setCallStatus('ringing'), 600) }}>
                <Play className="h-4 w-4 mr-2" /> Запустить
              </Button>
              {callStatus === 'ringing' && (
                <Button variant="outline" onClick={() => setCallStatus('in_call')}>Ответить</Button>
              )}
              <Button variant={isVoiceCall ? 'destructive' : 'outline'} onClick={() => (isVoiceCall ? stopVoiceCall() : startVoiceCall())}>
                <Phone className="h-4 w-4 mr-2" /> {isVoiceCall ? 'Завершить разговор' : 'Говорить через микрофон'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Чат */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Диалог с агентом
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Начните диалог с агентом</p>
                    <p className="text-sm mt-2">
                      Агент начнёт с этапа &quot;{getStageTitle(currentStage)}&quot;
                    </p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {message.type === 'agent' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {message.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            {message.type === 'agent' && message.audioUrl && (
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Ввод сообщения */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Введите сообщение от имени клиента..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleListening}
                    className={isListening ? 'bg-red-100 text-red-600' : ''}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Нажмите Enter для отправки • Используйте микрофон для голосового ввода
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Информация об агенте */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация об агенте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Название</p>
                <p className="font-medium">{agent.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Описание</p>
                <p className="text-sm">{agent.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Голос</p>
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{voice?.name}</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Настройки</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Задержка ответа:</span>
                    <span>{agent.settings.responseDelay} мс</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Макс. тишина:</span>
                    <span>—</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Прерывания:</span>
                    <span>{agent.settings.interruptionHandling ? 'Да' : 'Нет'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
