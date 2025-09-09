'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Filter, 
  RefreshCw,
  Monitor,
  Users,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Calendar,
  User,
  Settings,
  TrendingUp,
  Activity,
  MessageSquare,
  Volume2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { maskPhoneNumber, formatCallDuration } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { mockCampaigns } from '@/lib/mock-data'
import { Campaign, CampaignState } from '@/lib/types'
import { getStatusColor, getStatusText, calculatePercentage } from '@/lib/utils'

interface ObzvonCampaign {
  id: string
  name: string
  agent: string
  agentStage?: string
  database: string
  script: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  totalNumbers: number
  calledNumbers: number
  successfulConnections: number
  smsAgreements: number
  transfers: number
  retries: number
  startTime?: Date
  endTime?: Date
  progress: number
}

const mockObzvonCampaigns: ObzvonCampaign[] = [
  {
    id: 'obz-1',
    name: 'Тестовый обзвон 2',
    agent: 'Анна (голос 1)',
    agentStage: 'Приветствие',
    database: 'Тестовая база №3413 (1,250 номеров)',
    script: 'Тестовый скрипт обзвона',
    status: 'active',
    totalNumbers: 1250,
    calledNumbers: 847,
    successfulConnections: 623,
    smsAgreements: 445,
    transfers: 89,
    retries: 156,
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 часа назад
    progress: 68
  },
  {
    id: 'obz-2',
    name: 'Реактивация неактивных',
    agent: 'Михаил (голос 2)',
    agentStage: 'Напоминание',
    database: 'Неактивные 90 дней (2,100 номеров)',
    script: 'Возвращение с бонусом',
    status: 'paused',
    totalNumbers: 2100,
    calledNumbers: 456,
    successfulConnections: 298,
    smsAgreements: 156,
    transfers: 34,
    retries: 89,
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 часов назад
    progress: 22
  },
  {
    id: 'obz-3',
    name: 'Холодная база январь',
    agent: 'Елена (голос 3)',
    agentStage: 'Холодный звонок',
    database: 'Новые лиды (850 номеров)',
    script: 'Знакомство с продуктом',
    status: 'draft',
    totalNumbers: 850,
    calledNumbers: 0,
    successfulConnections: 0,
    smsAgreements: 0,
    transfers: 0,
    retries: 0,
    progress: 0
  }
]

export default function ObzvoniPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<ObzvonCampaign[]>(mockObzvonCampaigns)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAgent, setFilterAgent] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Статистика в реальном времени
  const totalActive = campaigns.filter(c => c.status === 'active').length
  const totalCalls = campaigns.reduce((sum, c) => sum + c.calledNumbers, 0)
  const totalSuccess = campaigns.reduce((sum, c) => sum + c.successfulConnections, 0)
  const totalSmsAgreements = campaigns.reduce((sum, c) => sum + c.smsAgreements, 0)

  const handleRefresh = async () => {
    setIsLoading(true)
    // Имитация обновления данных
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleCampaignAction = (campaignId: string, action: 'start' | 'pause' | 'stop') => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        switch (action) {
          case 'start':
            return { ...campaign, status: 'active' as const }
          case 'pause':
            return { ...campaign, status: 'paused' as const }
          case 'stop':
            return { ...campaign, status: 'completed' as const }
          default:
            return campaign
        }
      }
      return campaign
    }))
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

  // Получение уникальных агентов для фильтра
  const uniqueAgents = Array.from(new Set(campaigns.map(c => c.agent)))

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
    const matchesAgent = filterAgent === 'all' || campaign.agent === filterAgent
    const matchesSearch = searchQuery === '' || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.database.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDate = (() => {
      if (filterDate === 'all') return true
      if (!campaign.startTime) return filterDate === 'not_started'
      
      const now = new Date()
      const campaignDate = campaign.startTime
      
      switch (filterDate) {
        case 'today':
          return campaignDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return campaignDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return campaignDate >= monthAgo
        case 'not_started':
          return !campaign.startTime
        default:
          return true
      }
    })()

    return matchesStatus && matchesAgent && matchesSearch && matchesDate
  })

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Компании
          </h1>
          <p className="text-gray-600">
            Управление компаниями обзвона
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          
          <Button variant="outline" onClick={() => router.push('/companies/ab-tests')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            A/B тесты
          </Button>
          
          <Button onClick={() => router.push('/companies/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Создать кампанию
          </Button>
        </div>
      </div>

      {/* Статистика в реальном времени */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активные кампании</p>
                <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего звонков</p>
                <p className="text-2xl font-bold text-gray-900">{totalCalls.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Успешные соединения</p>
                <p className="text-2xl font-bold text-gray-900">{totalSuccess.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Согласия на SMS</p>
                <p className="text-2xl font-bold text-gray-900">{totalSmsAgreements.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Фильтры и поиск:</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Поиск */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию или базе..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Фильтр по статусу */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="paused">На паузе</SelectItem>
                  <SelectItem value="completed">Завершённые</SelectItem>
                  <SelectItem value="draft">Черновики</SelectItem>
                </SelectContent>
              </Select>

              {/* Фильтр по агенту */}
              <Select value={filterAgent} onValueChange={setFilterAgent}>
                <SelectTrigger>
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Все агенты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все агенты</SelectItem>
                  {uniqueAgents.map((agent) => (
                    <SelectItem key={agent} value={agent}>
                      {agent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Фильтр по дате */}
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Все периоды" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все периоды</SelectItem>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="week">За неделю</SelectItem>
                  <SelectItem value="month">За месяц</SelectItem>
                  <SelectItem value="not_started">Не запущены</SelectItem>
                </SelectContent>
              </Select>

              {/* Кнопка сброса фильтров */}
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterStatus('all')
                  setFilterAgent('all')
                  setFilterDate('all')
                  setSearchQuery('')
                }}
                className="whitespace-nowrap"
              >
                Сбросить
              </Button>
            </div>

            {/* Индикатор активных фильтров */}
            {(filterStatus !== 'all' || filterAgent !== 'all' || filterDate !== 'all' || searchQuery !== '') && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Активные фильтры:</span>
                {filterStatus !== 'all' && (
                  <Badge variant="outline">Статус: {filterStatus}</Badge>
                )}
                {filterAgent !== 'all' && (
                  <Badge variant="outline">Агент: {filterAgent}</Badge>
                )}
                {filterDate !== 'all' && (
                  <Badge variant="outline">Период: {filterDate}</Badge>
                )}
                {searchQuery !== '' && (
                  <Badge variant="outline">Поиск: &quot;{searchQuery}&quot;</Badge>
                )}
                <span className="text-gray-500">
                  Показано: {filteredCampaigns.length} из {campaigns.length}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Таблица кампаний */}
      <Card>
        <CardHeader>
          <CardTitle>Кампании ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    База номеров
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Размер базы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % выполнения
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Этап/Агент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Агент: {campaign.agent}
                          {campaign.agentStage && (
                            <span className="ml-2 text-xs text-gray-400">• Этап: {campaign.agentStage}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.database}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.totalNumbers.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">% исполнения: {campaign.progress}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.agent}</div>
                      {campaign.agentStage && (
                        <div className="text-xs text-gray-500">Этап: {campaign.agentStage}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleCampaignAction(campaign.id, 'start')}
                            title="Запустить"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCampaignAction(campaign.id, 'pause')}
                            title="Пауза"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button
                            size="sm"
                            onClick={() => handleCampaignAction(campaign.id, 'start')}
                            title="Продолжить"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {(campaign.status === 'active' || campaign.status === 'paused') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCampaignAction(campaign.id, 'stop')}
                            title="Завершить"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/companies/${campaign.id}`)}
                          title="Открыть детали"
                        >
                          <Monitor className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                Нет кампаний, соответствующих выбранному фильтру
              </p>
              <Button onClick={() => router.push('/companies/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Создать первую кампанию
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Мониторинг (вставлен с /obzvoni/monitor) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Мониторинг обзвонов</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => router.push('/obzvoni/monitor')}>Открыть полноэкранно</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
                    <p className="text-2xl font-bold text-gray-900">{mockCampaigns.length > 0 ? 3 : 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">1,240</p>
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
                    <p className="text-2xl font-bold text-gray-900">1,303</p>
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
                    <p className="text-2xl font-bold text-gray-900">46.8%</p>
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
                    <p className="text-2xl font-bold text-gray-900">38</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Активные звонки (таблица) - легкая версия */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Активные звонки в реальном времени</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm text-gray-600">Статус</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-600">Номер</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-600">Кампания</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-600">Агент</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-600">Этап</th>
                    <th className="text-left py-2 px-3 text-sm text-gray-600">Длительность</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { status: 'talking', number: '+7 (999) 123-**-**', campaign: 'Тестовый обзвон базы', agent: 'Анна', step: 'Презентация предложения', duration: 120 },
                    { status: 'voicemail', number: '+7 (999) 234-**-**', campaign: 'Реактивация неактивных', agent: 'Михаил', step: 'Автоответчик', duration: 90 },
                    { status: 'connecting', number: '+7 (999) 345-**-**', campaign: 'Тестовый обзвон базы', agent: 'Елена', step: 'Соединение', duration: 30 },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-3 text-sm">
                        <div className="flex items-center space-x-2">
                          {row.status === 'talking' ? <Volume2 className="h-4 w-4 text-green-600" /> : row.status === 'voicemail' ? <MessageSquare className="h-4 w-4 text-purple-600" /> : <Phone className="h-4 w-4 text-blue-600" />}
                          <span className="text-gray-700">
                            {row.status === 'talking' ? 'Разговор' : row.status === 'voicemail' ? 'Автоответчик' : 'Соединение'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-sm font-mono">{row.number}</td>
                      <td className="py-2 px-3 text-sm">{row.campaign}</td>
                      <td className="py-2 px-3 text-sm">{row.agent}</td>
                      <td className="py-2 px-3 text-sm">{row.step}</td>
                      <td className="py-2 px-3 text-sm font-medium">{formatCallDuration(row.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
