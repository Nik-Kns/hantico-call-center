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
  Volume2,
  Eye,
  Zap,
  TrendingUp
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Типы для мониторинга
interface ActiveCall {
  id: string
  campaignId: string
  campaignName: string
  phoneNumber: string
  agentName: string
  status: 'connecting' | 'talking' | 'processing' | 'completed'
  startTime: Date
  duration: number
  currentStep?: string
}

interface CampaignMonitor {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed'
  activeCalls: number
  queueSize: number
  callsPerMinute: number
  successRate: number
  avgCallDuration: number
  totalProcessed: number
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
    startTime: new Date(Date.now() - 2 * 60 * 1000), // 2 минуты назад
    duration: 120,
    currentStep: 'Презентация предложения'
  },
  {
    id: 'call-2',
    campaignId: 'obz-1',
    campaignName: 'Тестовый обзвон базы',
    phoneNumber: '+7 (999) 234-56-78',
    agentName: 'Анна',
    status: 'connecting',
    startTime: new Date(Date.now() - 30 * 1000), // 30 секунд назад
    duration: 30
  },
  {
    id: 'call-3',
    campaignId: 'obz-2',
    campaignName: 'Реактивация неактивных',
    phoneNumber: '+7 (999) 345-67-89',
    agentName: 'Михаил',
    status: 'processing',
    startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 минут назад
    duration: 300,
    currentStep: 'Обработка результата'
  },
  {
    id: 'call-4',
    campaignId: 'obz-2',
    campaignName: 'Реактивация неактивных',
    phoneNumber: '+7 (999) 456-78-90',
    agentName: 'Михаил',
    status: 'talking',
    startTime: new Date(Date.now() - 90 * 1000), // 1.5 минуты назад
    duration: 90,
    currentStep: 'Выяснение потребностей'
  }
]

const mockCampaignMonitors: CampaignMonitor[] = [
  {
    id: 'obz-1',
    name: 'Тестовый обзвон базы',
    status: 'active',
    activeCalls: 2,
    queueSize: 234,
    callsPerMinute: 12.5,
    successRate: 68.4,
    avgCallDuration: 145,
    totalProcessed: 847,
    errors: 3
  },
  {
    id: 'obz-2',
    name: 'Реактивация неактивных',
    status: 'active',
    activeCalls: 2,
    queueSize: 156,
    callsPerMinute: 8.3,
    successRate: 72.1,
    avgCallDuration: 178,
    totalProcessed: 456,
    errors: 1
  },
  {
    id: 'obz-3',
    name: 'Холодная база январь',
    status: 'paused',
    activeCalls: 0,
    queueSize: 850,
    callsPerMinute: 0,
    successRate: 0,
    avgCallDuration: 0,
    totalProcessed: 0,
    errors: 0
  }
]

export default function ObzvoniMonitorPage() {
  const router = useRouter()
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>(mockActiveCalls)
  const [campaignMonitors, setCampaignMonitors] = useState<CampaignMonitor[]>(mockCampaignMonitors)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Автообновление каждые 2 секунды
  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      // Имитация обновления данных
      setActiveCalls(prev => prev.map(call => ({
        ...call,
        duration: call.duration + 2
      })))
      setLastUpdate(new Date())
    }, 2000)

    return () => clearInterval(interval)
  }, [isAutoRefresh])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800">Соединение</Badge>
      case 'talking':
        return <Badge className="bg-green-100 text-green-800">Разговор</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Обработка</Badge>
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Завершён</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connecting':
        return <Phone className="h-4 w-4 text-yellow-600 animate-pulse" />
      case 'talking':
        return <Volume2 className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Activity className="h-4 w-4 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const totalActiveCalls = campaignMonitors.reduce((sum, c) => sum + c.activeCalls, 0)
  const totalQueue = campaignMonitors.reduce((sum, c) => sum + c.queueSize, 0)
  const totalProcessed = campaignMonitors.reduce((sum, c) => sum + c.totalProcessed, 0)
  const avgSuccessRate = campaignMonitors.reduce((sum, c) => sum + c.successRate, 0) / campaignMonitors.filter(c => c.status === 'active').length

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
              Отслеживание активных звонков в реальном времени
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-xs text-gray-500">
            Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
          </div>
          <Button
            variant={isAutoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAutoRefresh ? 'animate-spin' : ''}`} />
            {isAutoRefresh ? 'Авто' : 'Ручное'}
          </Button>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

      <Tabs defaultValue="live" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Активные звонки</TabsTrigger>
          <TabsTrigger value="campaigns">По кампаниям</TabsTrigger>
          <TabsTrigger value="performance">Производительность</TabsTrigger>
        </TabsList>

        {/* Активные звонки */}
        <TabsContent value="live" className="space-y-4">
          {activeCalls.length > 0 ? (
            <div className="space-y-4">
              {activeCalls.map((call) => (
                <Card key={call.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(call.status)}
                          {getStatusBadge(call.status)}
                        </div>
                        <div>
                          <p className="font-medium">{call.phoneNumber}</p>
                          <p className="text-sm text-gray-600">
                            {call.campaignName} • Агент: {call.agentName}
                          </p>
                          {call.currentStep && (
                            <p className="text-xs text-blue-600 mt-1">
                              {call.currentStep}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatDuration(call.duration)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {call.startTime.toLocaleTimeString('ru-RU')}
                          </p>
                        </div>
                        
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
                      </div>
                    </div>
                    
                    {call.status === 'talking' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Прогресс разговора</span>
                          <span className="text-gray-600">
                            {Math.min(100, Math.round((call.duration / 300) * 100))}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(100, (call.duration / 300) * 100)} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Нет активных звонков</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* По кампаниям */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="space-y-4">
            {campaignMonitors.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {campaign.status === 'active' && (
                        <Badge className="bg-green-100 text-green-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Активна
                        </Badge>
                      )}
                      {campaign.status === 'paused' && (
                        <Badge className="bg-yellow-100 text-yellow-800">Пауза</Badge>
                      )}
                      {campaign.errors > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          {campaign.errors} ошибок
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {campaign.activeCalls}
                      </p>
                      <p className="text-xs text-gray-600">Активные</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {campaign.queueSize.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Очередь</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {campaign.callsPerMinute.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600">Зв./мин</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {campaign.successRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">Успешность</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-700">
                        {formatDuration(campaign.avgCallDuration)}
                      </p>
                      <p className="text-xs text-gray-600">Ср. длит.</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {campaign.totalProcessed.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Обработано</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Производительность */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Нагрузка системы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Использование каналов</span>
                    <span>{totalActiveCalls}/50</span>
                  </div>
                  <Progress value={(totalActiveCalls / 50) * 100} className="h-3" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Очередь звонков</span>
                    <span>{totalQueue.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min(100, (totalQueue / 5000) * 100)} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Производительность</span>
                    <span>Отлично</span>
                  </div>
                  <Progress value={85} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика за час</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">1,247</p>
                    <p className="text-sm text-gray-600">Звонков</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">856</p>
                    <p className="text-sm text-gray-600">Дозвонов</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">623</p>
                    <p className="text-sm text-gray-600">Согласий</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">134</p>
                    <p className="text-sm text-gray-600">Конверсий</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-gray-600 mb-2">Тенденция</p>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      +12.5% к прошлому часу
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
