'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Play,
  Pause,
  Square,
  Settings,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
  Download,
  FileText,
  Volume2,
  AlertTriangle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { maskPhoneNumber } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
// Tabs удалены: аналитика и звонки отображаются на одной странице

// Типы для детальной страницы кампании
interface CampaignDetails {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  agent: string
  // script удален из UI, сценарий внутри агента
  script: string
  database: string
  startTime?: Date
  endTime?: Date
  progress: number
  totalNumbers: number
  calledNumbers: number
  successfulConnections: number
  smsAgreements: number
  transfers: number
  retries: number
}

interface CallRecord {
  id: string
  phoneNumber: string
  result: 'success' | 'no_answer' | 'busy' | 'refused' | 'error'
  duration: number
  timestamp: Date
  hasConsent: boolean
  hasRecording: boolean
  hasTranscript: boolean
  notes?: string
}

// Моковые данные для детальной страницы
const mockCampaignDetails: { [key: string]: CampaignDetails } = {
  'obz-1': {
    id: 'obz-1',
    name: 'Акция "Новый год 2025"',
    status: 'active',
    agent: 'Анна (голос 1)',
    script: '',
    database: 'VIP клиенты (1,250 номеров)',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    progress: 68,
    totalNumbers: 1250,
    calledNumbers: 847,
    successfulConnections: 623,
    smsAgreements: 445,
    transfers: 89,
    retries: 156
  },
  'obz-2': {
    id: 'obz-2',
    name: 'Реактивация неактивных',
    status: 'paused',
    agent: 'Михаил (голос 2)',
    script: '',
    database: 'Неактивные 90 дней (2,100 номеров)',
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    progress: 22,
    totalNumbers: 2100,
    calledNumbers: 456,
    successfulConnections: 298,
    smsAgreements: 156,
    transfers: 34,
    retries: 89
  },
  'obz-3': {
    id: 'obz-3',
    name: 'Холодная база январь',
    status: 'draft',
    agent: 'Елена (голос 3)',
    script: '',
    database: 'Новые лиды (850 номеров)',
    progress: 0,
    totalNumbers: 850,
    calledNumbers: 0,
    successfulConnections: 0,
    smsAgreements: 0,
    transfers: 0,
    retries: 0
  }
}

const mockCallRecords: CallRecord[] = [
  {
    id: 'call-1',
    phoneNumber: '+7 (999) 123-45-67',
    result: 'success',
    duration: 245,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    hasConsent: true,
    hasRecording: true,
    hasTranscript: true,
    notes: 'Клиент заинтересован, согласился на SMS'
  },
  {
    id: 'call-2',
    phoneNumber: '+7 (999) 234-56-78',
    result: 'refused',
    duration: 89,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    hasConsent: false,
    hasRecording: true,
    hasTranscript: true,
    notes: 'Категорический отказ'
  },
  {
    id: 'call-3',
    phoneNumber: '+7 (999) 345-67-89',
    result: 'no_answer',
    duration: 0,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    hasConsent: false,
    hasRecording: false,
    hasTranscript: false
  },
  {
    id: 'call-4',
    phoneNumber: '+7 (999) 456-78-90',
    result: 'busy',
    duration: 0,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    hasConsent: false,
    hasRecording: false,
    hasTranscript: false
  },
  {
    id: 'call-5',
    phoneNumber: '+7 (999) 567-89-01',
    result: 'success',
    duration: 312,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    hasConsent: true,
    hasRecording: true,
    hasTranscript: true,
    notes: 'Успешная регистрация'
  }
]

export default function CampaignDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  
  const [campaign, setCampaign] = useState<CampaignDetails | null>(
    mockCampaignDetails[campaignId] || null
  )
  const [callRecords, setCallRecords] = useState<CallRecord[]>(mockCallRecords)
  const [isLoading, setIsLoading] = useState(false)

  const handleCampaignAction = async (action: 'start' | 'pause' | 'stop') => {
    if (!campaign) return
    
    setIsLoading(true)
    // Имитация API вызова
    setTimeout(() => {
      setCampaign(prev => prev ? {
        ...prev,
        status: action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'completed'
      } : null)
      setIsLoading(false)
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активна</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Пауза</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Завершена</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Черновик</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Успех</Badge>
      case 'refused':
        return <Badge className="bg-red-100 text-red-800">Отказ</Badge>
      case 'no_answer':
        return <Badge className="bg-gray-100 text-gray-800">Не ответил</Badge>
      case 'busy':
        return <Badge className="bg-orange-100 text-orange-800">Занято</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Ошибка</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">Кампания не найдена</h2>
              <p className="text-gray-600 mb-4">
                Кампания с ID &quot;{campaignId}&quot; не существует или была удалена.
              </p>
              <Button onClick={() => router.push('/obzvoni')}>
                Вернуться к списку
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
              {campaign.name}
            </h1>
            <p className="text-gray-600">
              Детали кампании и результаты обзвона
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge(campaign.status)}
          
          <div className="flex space-x-2">
            {campaign.status === 'draft' && (
              <Button 
                onClick={() => handleCampaignAction('start')}
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                Запустить
              </Button>
            )}
            {campaign.status === 'active' && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => handleCampaignAction('pause')}
                  disabled={isLoading}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Пауза
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleCampaignAction('stop')}
                  disabled={isLoading}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Завершить
                </Button>
              </>
            )}
            {campaign.status === 'paused' && (
              <>
                <Button 
                  onClick={() => handleCampaignAction('start')}
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Продолжить
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleCampaignAction('stop')}
                  disabled={isLoading}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Завершить
                </Button>
              </>
            )}
            {campaign.status === 'draft' && (
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Настроить
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Карточка статуса */}
      <Card>
        <CardHeader>
          <CardTitle>Статус кампании</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Прогресс выполнения</p>
                <div className="flex items-center mt-2">
                  <div className="flex-1 mr-4">
                    <Progress value={campaign.progress} className="h-3" />
                  </div>
                  <span className="text-lg font-semibold">{campaign.progress}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Агент</p>
                  <p className="font-medium">{campaign.agent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">База данных</p>
                  <p className="font-medium">{campaign.database}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {campaign.startTime && (
                <div>
                  <p className="text-sm text-gray-600">Время запуска</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">
                      {campaign.startTime.toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
              )}
              
              {campaign.endTime && (
                <div>
                  <p className="text-sm text-gray-600">Время завершения</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">
                      {campaign.endTime.toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600">Агенты</p>
                <p className="font-medium">{campaign.agent}</p>
                <p className="text-xs text-gray-500 mt-1">Всего в базе: {campaign.totalNumbers.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {campaign.calledNumbers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Совершено звонков</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {campaign.successfulConnections.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Успешные соединения</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {campaign.smsAgreements.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Согласие на SMS</p>
            <p className="text-xs text-gray-500">
              {campaign.successfulConnections > 0 
                ? `${Math.round((campaign.smsAgreements / campaign.successfulConnections) * 100)}%`
                : '0%'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">
              {campaign.retries.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Повторные звонки</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">
              {campaign.transfers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Передано в Bitrix24</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-600">
              {campaign.totalNumbers - campaign.calledNumbers}
            </p>
            <p className="text-sm text-gray-600">Осталось звонков</p>
          </CardContent>
        </Card>
      </div>

      {/* Аналитика сверху */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Распределение результатов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Успешные', count: campaign.successfulConnections, color: 'bg-green-500' },
                { label: 'Не ответили', count: Math.round(campaign.calledNumbers * 0.3), color: 'bg-gray-500' },
                { label: 'Отказы', count: Math.round(campaign.calledNumbers * 0.15), color: 'bg-red-500' },
                { label: 'Занято', count: Math.round(campaign.calledNumbers * 0.1), color: 'bg-orange-500' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Воронка звонков (по этапам)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm text-gray-600">Этап</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-600">Кол-во</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-600">Конверсия от предыдущего</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const steps = [
                      { step: 'Звонок', total: campaign.calledNumbers },
                      { step: 'Успешное соединение', total: campaign.successfulConnections },
                      { step: 'Согласие на SMS', total: campaign.smsAgreements },
                      { step: 'Передано в Bitrix24', total: campaign.transfers }
                    ]
                    return steps.map((item, idx) => {
                      const prev = idx === 0 ? item.total : steps[idx - 1].total
                      const rate = prev > 0 ? Math.round((item.total / prev) * 100) : 0
                      return (
                        <tr key={item.step} className="border-b">
                          <td className="py-2 px-3 text-sm">{item.step}</td>
                          <td className="py-2 px-3 text-sm font-medium">{item.total.toLocaleString()}</td>
                          <td className="py-2 px-3 text-sm">{rate}%</td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* История звонков ниже */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>История звонков</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Экспорт CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Номер
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Результат
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Длительность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Время
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Согласие/Отказ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {callRecords.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {call.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {maskPhoneNumber(call.phoneNumber)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getResultBadge(call.result)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.duration > 0 ? formatDuration(call.duration) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.timestamp.toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {call.hasConsent ? (
                        <Badge className="bg-green-100 text-green-800">Согласие</Badge>
                      ) : call.result === 'success' ? (
                        <Badge className="bg-red-100 text-red-800">Отказ</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {call.hasRecording && (
                          <Button size="sm" variant="outline" title="Прослушать запись">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                        {call.hasTranscript && (
                          <Button size="sm" variant="outline" title="Показать транскрипт">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
