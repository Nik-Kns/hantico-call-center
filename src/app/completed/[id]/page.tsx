'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  User,
  Calendar,
  MessageSquare,
  ExternalLink,
  RotateCcw,
  Download,
  Copy,
  Share2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, formatCallDuration } from '@/lib/utils'

// Интерфейс для детального звонка
interface CallDetail {
  id: string
  campaignId: string
  campaignName: string
  phoneNumber: string
  contactName: string
  contactEmail?: string
  agentName: string
  agentId: string
  startTime: Date
  endTime: Date
  duration: number
  status: 'completed' | 'no_answer' | 'busy' | 'rejected' | 'retry'
  result: 'success' | 'consent' | 'refusal' | 'no_answer' | 'callback'
  hasConsent: boolean
  smsSent: boolean
  retryScheduled: boolean
  sentToBitrix: boolean
  recordingUrl?: string
  transcription?: string
  nextAction?: 'sms' | 'retry' | 'bitrix' | 'completed'
  actionHistory: CallAction[]
  notes?: string
  tags?: string[]
}

interface CallAction {
  id: string
  timestamp: Date
  action: 'call_started' | 'call_ended' | 'consent_given' | 'consent_refused' | 'sms_sent' | 'retry_scheduled' | 'sent_to_bitrix' | 'note_added'
  description: string
  details?: string
  performedBy: string
}

// Моковые данные для детального звонка
const mockCallDetails: Record<string, CallDetail> = {
  'call-001': {
    id: 'call-001',
    campaignId: 'obz-1',
    campaignName: 'Тестовый обзвон 2',
    phoneNumber: '+7 (999) 123-45-67',
    contactName: 'Иван Петров',
    contactEmail: 'ivan.petrov@email.com',
    agentName: 'Анна',
    agentId: 'agent-1',
    startTime: new Date('2024-01-15T10:30:00Z'),
    endTime: new Date('2024-01-15T10:33:45Z'),
    duration: 225,
    status: 'completed',
    result: 'consent',
    hasConsent: true,
    smsSent: true,
    retryScheduled: false,
    sentToBitrix: false,
    recordingUrl: '/recordings/call-001.mp3',
    transcription: `Агент: Здравствуйте! Меня зовут Анна, звоню из компании по поводу нашего специального предложения. У вас есть минутка?

Клиент: Да, слушаю вас.

Агент: Отлично! Мы предлагаем нашим клиентам уникальную возможность получить персональное предложение с выгодными условиями. Это займет всего несколько минут вашего времени.

Клиент: А что именно вы предлагаете?

Агент: Это специальная программа лояльности с индивидуальными бонусами. Чтобы подготовить для вас персональное предложение, мне нужно будет отправить вам SMS с ссылкой на регистрацию. Вы согласны?

Клиент: Да, можете отправить.

Агент: Прекрасно! SMS будет отправлено в течение нескольких минут на этот номер. Спасибо за ваше время и хорошего дня!

Клиент: Спасибо, до свидания.`,
    nextAction: 'sms',
    actionHistory: [
      {
        id: 'action-1',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        action: 'call_started',
        description: 'Звонок начат',
        performedBy: 'Система'
      },
      {
        id: 'action-2',
        timestamp: new Date('2024-01-15T10:32:15Z'),
        action: 'consent_given',
        description: 'Получено согласие на отправку SMS',
        performedBy: 'Анна'
      },
      {
        id: 'action-3',
        timestamp: new Date('2024-01-15T10:33:45Z'),
        action: 'call_ended',
        description: 'Звонок завершен успешно',
        performedBy: 'Система'
      },
      {
        id: 'action-4',
        timestamp: new Date('2024-01-15T10:35:00Z'),
        action: 'sms_sent',
        description: 'SMS с ссылкой отправлено',
        details: 'Шаблон: "Персональное предложение"',
        performedBy: 'Система'
      }
    ],
    notes: 'Клиент проявил заинтересованность, согласился на получение SMS',
    tags: ['заинтересован', 'согласие', 'vip']
  },
  'call-002': {
    id: 'call-002',
    campaignId: 'obz-1',
    campaignName: 'Тестовый обзвон 2',
    phoneNumber: '+7 (999) 234-56-78',
    contactName: 'Мария Сидорова',
    agentName: 'Михаил',
    agentId: 'agent-2',
    startTime: new Date('2024-01-15T11:15:00Z'),
    endTime: new Date('2024-01-15T11:16:30Z'),
    duration: 90,
    status: 'completed',
    result: 'refusal',
    hasConsent: false,
    smsSent: false,
    retryScheduled: false,
    sentToBitrix: true,
    recordingUrl: '/recordings/call-002.mp3',
    transcription: `Агент: Добрый день! Меня зовут Михаил, звоню из компании по поводу специального предложения.

Клиент: К сожалению, меня это не интересует. Не звоните больше.

Агент: Понимаю. Хорошего дня!

Клиент: До свидания.`,
    nextAction: 'bitrix',
    actionHistory: [
      {
        id: 'action-1',
        timestamp: new Date('2024-01-15T11:15:00Z'),
        action: 'call_started',
        description: 'Звонок начат',
        performedBy: 'Система'
      },
      {
        id: 'action-2',
        timestamp: new Date('2024-01-15T11:15:45Z'),
        action: 'consent_refused',
        description: 'Клиент отказался от предложения',
        performedBy: 'Михаил'
      },
      {
        id: 'action-3',
        timestamp: new Date('2024-01-15T11:16:30Z'),
        action: 'call_ended',
        description: 'Звонок завершен',
        performedBy: 'Система'
      },
      {
        id: 'action-4',
        timestamp: new Date('2024-01-15T11:17:00Z'),
        action: 'sent_to_bitrix',
        description: 'Контакт передан в Bitrix24 для дальнейшей работы',
        details: 'Статус: "Не заинтересован"',
        performedBy: 'Система'
      }
    ],
    notes: 'Клиент категорически не заинтересован',
    tags: ['отказ', 'не_звонить']
  }
}

interface CallDetailPageProps {
  params: Promise<{ id: string }>
}

function CallDetailPageClient({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [duration] = useState(225) // Длительность записи в секундах

  const call = mockCallDetails[params.id]

  if (!call) {
    return (
      <div className="text-center py-12">
        <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Звонок не найден
        </h3>
        <p className="text-gray-500 mb-6">
          Звонок с ID {params.id} не существует или был удален
        </p>
        <Button onClick={() => router.push('/completed')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к списку
        </Button>
      </div>
    )
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // Здесь была бы логика управления аудиоплеером
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Состоялся</Badge>
      case 'no_answer':
        return <Badge className="bg-gray-100 text-gray-800">Не ответил</Badge>
      case 'busy':
        return <Badge className="bg-yellow-100 text-yellow-800">Занято</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Отказ</Badge>
      case 'retry':
        return <Badge className="bg-blue-100 text-blue-800">Повторный</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Успех</Badge>
      case 'consent':
        return <Badge className="bg-blue-100 text-blue-800">Согласие</Badge>
      case 'refusal':
        return <Badge className="bg-red-100 text-red-800">Отказ</Badge>
      case 'no_answer':
        return <Badge className="bg-gray-100 text-gray-800">Не ответил</Badge>
      case 'callback':
        return <Badge className="bg-orange-100 text-orange-800">Перезвонить</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'call_started':
        return <Phone className="h-4 w-4 text-blue-600" />
      case 'call_ended':
        return <Phone className="h-4 w-4 text-gray-600" />
      case 'consent_given':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'consent_refused':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'sms_sent':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'retry_scheduled':
        return <RotateCcw className="h-4 w-4 text-orange-600" />
      case 'sent_to_bitrix':
        return <ExternalLink className="h-4 w-4 text-purple-600" />
      case 'note_added':
        return <FileText className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatPlaybackTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyTranscription = () => {
    if (call.transcription) {
      navigator.clipboard.writeText(call.transcription)
      // Здесь была бы логика показа уведомления
    }
  }

  const handleDownloadRecording = () => {
    // Здесь была бы логика скачивания записи
    console.log('Скачивание записи:', call.recordingUrl)
  }

  const handleShareCall = () => {
    // Здесь была бы логика расшаривания звонка
    console.log('Поделиться звонком:', call.id)
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
              Звонок {call.id}
            </h1>
            <p className="text-gray-600">
              {call.contactName} • {call.phoneNumber}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleShareCall}>
            <Share2 className="h-4 w-4 mr-2" />
            Поделиться
          </Button>
          
          {call.recordingUrl && (
            <Button variant="outline" onClick={handleDownloadRecording}>
              <Download className="h-4 w-4 mr-2" />
              Скачать запись
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Детали звонка */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о звонке</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Кампания</label>
                    <p className="text-gray-900">{call.campaignName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Агент</label>
                    <p className="text-gray-900">{call.agentName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Дата и время</label>
                    <p className="text-gray-900">
                      {formatDate(call.startTime)} в {call.startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Длительность</label>
                    <p className="text-gray-900">{formatCallDuration(call.duration)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Статус</label>
                    <div className="mt-1">
                      {getStatusBadge(call.status)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Результат</label>
                    <div className="mt-1">
                      {getResultBadge(call.result)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Согласие</label>
                    <div className="mt-1">
                      {call.hasConsent ? (
                        <Badge className="bg-green-100 text-green-800">Получено</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Не получено</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Действия</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {call.smsSent && (
                        <Badge className="bg-blue-100 text-blue-800">SMS отправлено</Badge>
                      )}
                      {call.retryScheduled && (
                        <Badge className="bg-orange-100 text-orange-800">Повтор запланирован</Badge>
                      )}
                      {call.sentToBitrix && (
                        <Badge className="bg-purple-100 text-purple-800">Передано в Bitrix24</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {call.notes && (
                <div className="mt-6 pt-6 border-t">
                  <label className="text-sm font-medium text-gray-600">Заметки</label>
                  <p className="mt-1 text-gray-900">{call.notes}</p>
                </div>
              )}
              
              {call.tags && call.tags.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600">Теги</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {call.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Запись и транскрипция */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="recording" className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recording">Запись звонка</TabsTrigger>
                    <TabsTrigger value="transcription">Транскрибация</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="recording" className="px-6 pb-6">
                  {call.recordingUrl ? (
                    <div className="space-y-4">
                      {/* Аудиоплеер */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Button
                            size="sm"
                            onClick={handlePlayPause}
                            className="w-12 h-12 rounded-full"
                          >
                            {isPlaying ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                          </Button>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                              <Volume2 className="h-4 w-4" />
                              <span>{formatPlaybackTime(playbackTime)} / {formatPlaybackTime(duration)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(playbackTime / duration) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center text-sm text-gray-600">
                          Качество записи: Хорошее • Размер: 2.1 MB
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Volume2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Запись недоступна
                      </h3>
                      <p className="text-gray-500">
                        Запись для этого звонка не сохранилась
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="transcription" className="px-6 pb-6">
                  {call.transcription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Текст разговора</h4>
                        <Button size="sm" variant="outline" onClick={handleCopyTranscription}>
                          <Copy className="h-4 w-4 mr-2" />
                          Копировать
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                          {call.transcription}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Автоматическая транскрибация • Точность: ~95%
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Транскрибация недоступна
                      </h3>
                      <p className="text-gray-500">
                        Текст разговора не был сгенерирован
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Контактная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Контакт
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Имя</label>
                  <p className="text-gray-900">{call.contactName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Телефон</label>
                  <p className="text-gray-900 font-mono">{call.phoneNumber}</p>
                </div>
                
                {call.contactEmail && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{call.contactEmail}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* История действий */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                История действий
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {call.actionHistory.map((action) => (
                  <div key={action.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActionIcon(action.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {action.description}
                      </p>
                      {action.details && (
                        <p className="text-xs text-gray-600 mt-1">
                          {action.details}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {action.timestamp.toLocaleString('ru-RU')} • {action.performedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function CallDetailPage({ params }: CallDetailPageProps) {
  const resolvedParams = await params
  return <CallDetailPageClient params={resolvedParams} />
}
