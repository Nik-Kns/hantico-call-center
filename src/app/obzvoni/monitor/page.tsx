'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  RefreshCw,
  Play,
  Pause,
  Square,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Activity,
  Eye,
  Volume2,
  MessageSquare
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { maskPhoneNumber, formatCallDuration } from '@/lib/utils'

// Типы для мониторинга
interface ActiveCall {
  id: string
  campaignId: string
  campaignName: string
  phoneNumber: string
  agentName: string
  status: 'connecting' | 'talking' | 'processing' | 'completed' | 'voicemail'
  startTime: Date
  duration: number
  currentStep?: string
  isVoicemail?: boolean
}

interface CampaignMonitor {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed'
  activeCalls: number
  queueSize: number
  totalNumbers: number
  processedNumbers: number
  successRate: number
  avgCallDuration: number
  voicemailCount: number
  errors: number
}

// Моковые данные для мониторинга
const mockActiveCalls: ActiveCall[] = [
  {
    id: 'call-1',
    campaignId: 'obz-1',
    campaignName: 'Тестовый обзвон базы',
    phoneNumber: '+7 (999) 123-45-67',
    agentName: 'Анна',
    status: 'talking',
    startTime: new Date(Date.now() - 2 * 60 * 1000),
    duration: 120,
    currentStep: 'Презентация предложения'
  },
  {
    id: 'call-2',
    campaignId: 'obz-2',
    campaignName: 'Реактивация неактивных',
    phoneNumber: '+7 (999) 234-56-78',
    agentName: 'Михаил',
    status: 'voicemail',
    startTime: new Date(Date.now() - 1.5 * 60 * 1000),
    duration: 90,
    currentStep: 'Автоответчик',
    isVoicemail: true
  },
  {
    id: 'call-3',
    campaignId: 'obz-1',
    campaignName: 'Тестовый обзвон базы',
    phoneNumber: '+7 (999) 345-67-89',
    agentName: 'Елена',
    status: 'connecting',
    startTime: new Date(Date.now() - 0.5 * 60 * 1000),
    duration: 30,
    currentStep: 'Соединение'
  }
]

const mockCampaignMonitors: CampaignMonitor[] = [
  {
    id: 'obz-1',
    name: 'Тестовый обзвон базы',
    status: 'active',
    activeCalls: 2,
    queueSize: 234,
    totalNumbers: 1250,
    processedNumbers: 847,
    successRate: 68.4,
    avgCallDuration: 145,
    voicemailCount: 23,
    errors: 3
  },
  {
    id: 'obz-2',
    name: 'Реактивация неактивных',
    status: 'active',
    activeCalls: 1,
    queueSize: 156,
    totalNumbers: 2100,
    processedNumbers: 456,
    successRate: 72.1,
    avgCallDuration: 178,
    voicemailCount: 15,
    errors: 1
  },
  {
    id: 'obz-3',
    name: 'Холодная база январь',
    status: 'paused',
    activeCalls: 0,
    queueSize: 850,
    totalNumbers: 850,
    processedNumbers: 0,
    successRate: 0,
    avgCallDuration: 0,
    voicemailCount: 0,
    errors: 0
  }
]

export default function ObzvoniMonitorPage() {
  const router = useRouter()
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>(mockActiveCalls)
  const [campaignMonitors, setCampaignMonitors] = useState<CampaignMonitor[]>(mockCampaignMonitors)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [timePeriod, setTimePeriod] = useState('today')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Автообновление каждые 5 секунд
  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      // Обновляем длительность активных звонков
      setActiveCalls(prev => prev.map(call => ({
        ...call,
        duration: Math.floor((Date.now() - call.startTime.getTime()) / 1000)
      })))
      setLastUpdate(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoRefresh])

  const handleRefresh = () => {
    setLastUpdate(new Date())
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connecting':
        return <Phone className="h-4 w-4 text-blue-600" />
      case 'talking':
        return <Volume2 className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Activity className="h-4 w-4 text-orange-600" />
      case 'voicemail':
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connecting':
        return <Badge className="bg-blue-100 text-blue-800">Соединение</Badge>
      case 'talking':
        return <Badge className="bg-green-100 text-green-800">Разговор</Badge>
      case 'processing':
        return <Badge className="bg-orange-100 text-orange-800">Обработка</Badge>
      case 'voicemail':
        return <Badge className="bg-purple-100 text-purple-800">Автоответчик</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Завершен</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активна</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Пауза</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Завершена</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case 'today':
        return 'за сегодня'
      case '7d':
        return 'за 7 дней'
      case '30d':
        return 'за 30 дней'
      case 'custom':
        return 'за выбранный период'
      default:
        return 'за сегодня'
    }
  }

  // Подсчет общих метрик
  const totalActiveCalls = campaignMonitors.reduce((sum, campaign) => sum + campaign.activeCalls, 0)
  const totalQueue = campaignMonitors.reduce((sum, campaign) => sum + campaign.queueSize, 0)
  const totalProcessed = campaignMonitors.reduce((sum, campaign) => sum + campaign.processedNumbers, 0)
  const totalVoicemail = campaignMonitors.reduce((sum, campaign) => sum + campaign.voicemailCount, 0)
  const avgSuccessRate = campaignMonitors.length > 0 
    ? campaignMonitors.reduce((sum, campaign) => sum + campaign.successRate, 0) / campaignMonitors.length
    : 0

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
              Мониторинг обзвонов
            </h1>
            <p className="text-gray-600">
              Отслеживание активных звонков и состояния кампаний {getTimePeriodLabel()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">За сегодня</SelectItem>
              <SelectItem value="7d">За 7 дней</SelectItem>
              <SelectItem value="30d">За 30 дней</SelectItem>
              <SelectItem value="custom">Выбрать период</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className={isAutoRefresh ? 'border-green-300 bg-green-50' : ''}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          
          <Button 
            variant={isAutoRefresh ? 'default' : 'outline'}
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            {isAutoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isAutoRefresh ? 'Пауза' : 'Авто'}
          </Button>
        </div>
      </div>

      {/* Общие метрики */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активные звонки</p>
                <p className="text-2xl font-bold text-gray-900">{totalActiveCalls}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">В очереди</p>
                <p className="text-2xl font-bold text-gray-900">{totalQueue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Обработано</p>
                <p className="text-2xl font-bold text-gray-900">{totalProcessed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Успешность</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgSuccessRate ? avgSuccessRate.toFixed(1) : '0'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Автоответчики</p>
                <p className="text-2xl font-bold text-gray-900">{totalVoicemail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Активные звонки - табличный вид */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Активные звонки в реальном времени</CardTitle>
            <Badge variant="outline">
              Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activeCalls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Статус</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Номер</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Кампания</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Агент</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Этап</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Длительность</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Начало</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeCalls.map((call) => (
                    <tr key={call.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(call.status)}
                          {getStatusBadge(call.status)}
                          {call.isVoicemail && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              VM
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">
                        {maskPhoneNumber(call.phoneNumber)}
                      </td>
                      <td className="py-3 px-4 text-sm">{call.campaignName}</td>
                      <td className="py-3 px-4 text-sm">{call.agentName}</td>
                      <td className="py-3 px-4 text-sm">
                        {call.currentStep && (
                          <span className="text-blue-600">{call.currentStep}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {formatCallDuration(call.duration)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {call.startTime.toLocaleTimeString('ru-RU')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {call.status === 'talking' && (
                            <Button size="sm" variant="outline">
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет активных звонков
              </h3>
              <p className="text-gray-500">
                Все агенты свободны или кампании приостановлены
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Кампании - табличный вид */}
      <Card>
        <CardHeader>
          <CardTitle>Состояние кампаний</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Кампания</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Статус</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Активные звонки</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">В очереди</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Прогресс</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Успешность</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Автоответчики</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Ошибки</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {campaignMonitors.map((campaign) => {
                  const progressPercentage = campaign.totalNumbers > 0 
                    ? Math.round((campaign.processedNumbers / campaign.totalNumbers) * 100)
                    : 0

                  return (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-sm text-gray-600">
                            {campaign.totalNumbers.toLocaleString()} номеров в базе
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getCampaignStatusBadge(campaign.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {campaign.activeCalls}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {campaign.queueSize.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Progress value={progressPercentage} className="flex-1" />
                          <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                            {progressPercentage}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {campaign.processedNumbers.toLocaleString()} / {campaign.totalNumbers.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {campaign.successRate.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        {campaign.voicemailCount > 0 ? (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {campaign.voicemailCount}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {campaign.errors > 0 ? (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {campaign.errors}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {campaign.status === 'active' ? (
                            <Button size="sm" variant="outline">
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : campaign.status === 'paused' ? (
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                          ) : null}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}