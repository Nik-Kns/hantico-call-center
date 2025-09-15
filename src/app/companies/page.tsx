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
  Volume2,
  UserCheck,
  PhoneOff,
  PhoneMissed,
  Bot,
  Download,
  FileText,
  GitBranch
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { maskPhoneNumber, formatCallDuration } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { mockCampaigns } from '@/lib/mock-data'
import { Campaign, CampaignState, BaseType } from '@/lib/types'
import { getStatusColor, getStatusText, calculatePercentage } from '@/lib/utils'

interface ObzvonCampaign {
  id: string
  name: string
  baseType: BaseType
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
  // Дополнительные поля для декомпозиции
  refusals: number
  noAnswers: number
  voicemails: number
  busyNumbers: number
  // A/B тестирование
  hasABTest?: boolean
  abTestVariants?: {
    A: { agent: string; calls: number; conversions: number }
    B: { agent: string; calls: number; conversions: number }
  }
}

const mockObzvonCampaigns: ObzvonCampaign[] = [
  {
    id: 'obz-1',
    name: 'Тестовый обзвон 2',
    baseType: 'registration',
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
    refusals: 178,
    noAnswers: 224,
    voicemails: 38,
    busyNumbers: 42,
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 часа назад
    progress: 68,
    hasABTest: true,
    abTestVariants: {
      A: { agent: 'Анна', calls: 423, conversions: 222 },
      B: { agent: 'Елена', calls: 424, conversions: 223 }
    }
  },
  {
    id: 'obz-2',
    name: 'Реактивация неактивных',
    baseType: 'reactivation',
    agent: 'Михаил (голос 2)',
    agentStage: 'Напоминание',
    database: 'Неактивные 90 дней (2,100 номеров)',
    script: 'Возвращение с бонусом',
    status: 'active',
    totalNumbers: 2100,
    calledNumbers: 456,
    successfulConnections: 298,
    smsAgreements: 156,
    transfers: 34,
    retries: 89,
    refusals: 142,
    noAnswers: 158,
    voicemails: 22,
    busyNumbers: 18,
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 часов назад
    progress: 22,
    hasABTest: false
  },
  {
    id: 'obz-3',
    name: 'Холодная база январь',
    baseType: 'registration',
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
    refusals: 0,
    noAnswers: 0,
    voicemails: 0,
    busyNumbers: 0,
    progress: 0
  },
  {
    id: 'obz-4',
    name: 'Работа с отказниками',
    baseType: 'refusals',
    agent: 'Ольга (голос 4)',
    agentStage: 'Переубеждение',
    database: 'Отказники Q4 (1,800 номеров)',
    script: 'Специальное предложение',
    status: 'active',
    totalNumbers: 1800,
    calledNumbers: 1245,
    successfulConnections: 856,
    smsAgreements: 312,
    transfers: 156,
    retries: 389,
    refusals: 544,
    noAnswers: 389,
    voicemails: 67,
    busyNumbers: 89,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 часа назад
    progress: 69
  }
]

export default function ObzvoniPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<ObzvonCampaign[]>(mockObzvonCampaigns)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAgent, setFilterAgent] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('all')
  const [filterBaseType, setFilterBaseType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchIdQuery, setSearchIdQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [decompositionPeriod, setDecompositionPeriod] = useState<string>('all')

  // Фильтрация кампаний по периоду для декомпозиции
  const getFilteredCampaignsByPeriod = (period: string) => {
    const now = new Date()
    return campaigns.filter(campaign => {
      if (campaign.status !== 'active') return false
      if (period === 'all') return true
      if (!campaign.startTime) return false
      
      const campaignDate = campaign.startTime
      
      switch (period) {
        case 'today':
          return campaignDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return campaignDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return campaignDate >= monthAgo
        default:
          return true
      }
    })
  }

  // Статистика в реальном времени (только по активным кампаниям)
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const filteredForDecomposition = getFilteredCampaignsByPeriod(decompositionPeriod)
  
  const totalActive = activeCampaigns.length
  const totalCalls = filteredForDecomposition.reduce((sum, c) => sum + c.calledNumbers, 0)
  const totalSuccess = filteredForDecomposition.reduce((sum, c) => sum + c.successfulConnections, 0)
  const totalSmsAgreements = filteredForDecomposition.reduce((sum, c) => sum + c.smsAgreements, 0)
  const totalRefusals = filteredForDecomposition.reduce((sum, c) => sum + (c.refusals || 0), 0)
  const totalNoAnswers = filteredForDecomposition.reduce((sum, c) => sum + (c.noAnswers || 0), 0)
  const totalVoicemails = filteredForDecomposition.reduce((sum, c) => sum + (c.voicemails || 0), 0)
  const totalBusy = filteredForDecomposition.reduce((sum, c) => sum + (c.busyNumbers || 0), 0)
  const totalReceived = activeCampaigns.reduce((sum, c) => sum + c.totalNumbers, 0)
  const totalInProgress = activeCampaigns.reduce((sum, c) => sum + (c.totalNumbers - c.calledNumbers), 0)

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

  const getBaseTypeBadge = (baseType: BaseType) => {
    switch (baseType) {
      case 'registration':
        return <Badge className="bg-blue-100 text-blue-800">Регистрация</Badge>
      case 'no_answer':
        return <Badge className="bg-orange-100 text-orange-800">Недозвон</Badge>
      case 'refusals':
        return <Badge className="bg-red-100 text-red-800">Отказники</Badge>
      case 'reactivation':
        return <Badge className="bg-purple-100 text-purple-800">Реактивация</Badge>
      default:
        return <Badge>{baseType}</Badge>
    }
  }

  // Получение уникальных агентов для фильтра
  const uniqueAgents = Array.from(new Set(campaigns.map(c => c.agent)))

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
    const matchesAgent = filterAgent === 'all' || campaign.agent === filterAgent
    const matchesBaseType = filterBaseType === 'all' || campaign.baseType === filterBaseType
    const matchesSearch = searchQuery === '' || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.database.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesId = searchIdQuery === '' || 
      campaign.id.toLowerCase().includes(searchIdQuery.toLowerCase())
    
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

    return matchesStatus && matchesAgent && matchesBaseType && matchesSearch && matchesId && matchesDate
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

      {/* Основная статистика по активным кампаниям */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">В работе</p>
                <p className="text-2xl font-bold text-gray-900">{totalInProgress.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Согласия SMS</p>
                <p className="text-2xl font-bold text-gray-900">{totalSmsAgreements.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Декомпозиция обработанных контактов по исходам (суммарно по всем активным кампаниям) */}
      {totalActive > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Декомпозиция обработанных контактов по исходам</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Суммарная статистика по {filteredForDecomposition.length} активным кампаниям. Всего обработано: {totalCalls.toLocaleString()} контактов
                </p>
              </div>
              <Select value={decompositionPeriod} onValueChange={setDecompositionPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все время</SelectItem>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="week">За неделю</SelectItem>
                  <SelectItem value="month">За месяц</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">SMS</Badge>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {totalSmsAgreements.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Успешные/согласие</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalCalls > 0 ? Math.round((totalSmsAgreements / totalCalls) * 100) : 0}% от обработанных
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {totalRefusals > 0 ? totalRefusals.toLocaleString() : '0'}
                </p>
                <p className="text-sm text-gray-600">Отказы</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalCalls > 0 && totalRefusals > 0 ? Math.round((totalRefusals / totalCalls) * 100) : 0}% от обработанных
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <PhoneOff className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-600">
                  {totalNoAnswers > 0 ? totalNoAnswers.toLocaleString() : '0'}
                </p>
                <p className="text-sm text-gray-600">Недозвоны</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalCalls > 0 && totalNoAnswers > 0 ? Math.round((totalNoAnswers / totalCalls) * 100) : 0}% от обработанных
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {totalVoicemails > 0 ? totalVoicemails.toLocaleString() : '0'}
                </p>
                <p className="text-sm text-gray-600">Автоответчики</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalCalls > 0 && totalVoicemails > 0 ? Math.round((totalVoicemails / totalCalls) * 100) : 0}% от обработанных
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <PhoneMissed className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {totalBusy > 0 ? totalBusy.toLocaleString() : '0'}
                </p>
                <p className="text-sm text-gray-600">Занято</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalCalls > 0 && totalBusy > 0 ? Math.round((totalBusy / totalCalls) * 100) : 0}% от обработанных
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Общая конверсия:</span>
                  <span className="ml-2 text-lg font-bold text-green-600">
                    {totalCalls > 0 ? ((totalSmsAgreements / totalCalls) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Осталось обработать:</span>
                  <span className="ml-2 text-lg font-bold text-orange-600">
                    {totalInProgress.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Фильтры и поиск:</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
              {/* Поиск */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Поиск по ID */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по ID..."
                  value={searchIdQuery}
                  onChange={(e) => setSearchIdQuery(e.target.value)}
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
                  <User className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Агенты" />
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

              {/* Фильтр по типу базы */}
              <Select value={filterBaseType} onValueChange={setFilterBaseType}>
                <SelectTrigger>
                  <Users className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Тип базы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="registration">Регистрация</SelectItem>
                  <SelectItem value="no_answer">Недозвон</SelectItem>
                  <SelectItem value="refusals">Отказники</SelectItem>
                  <SelectItem value="reactivation">Реактивация</SelectItem>
                </SelectContent>
              </Select>

              {/* Фильтр по дате */}
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Период" />
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
                  setFilterBaseType('all')
                  setSearchQuery('')
                  setSearchIdQuery('')
                }}
                className="whitespace-nowrap"
              >
                Сбросить
              </Button>
            </div>

            {/* Индикатор активных фильтров */}
            {(filterStatus !== 'all' || filterAgent !== 'all' || filterDate !== 'all' || filterBaseType !== 'all' || searchQuery !== '' || searchIdQuery !== '') && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Активные фильтры:</span>
                {filterStatus !== 'all' && (
                  <Badge variant="outline">Статус: {filterStatus}</Badge>
                )}
                {filterAgent !== 'all' && (
                  <Badge variant="outline">Агент: {filterAgent}</Badge>
                )}
                {filterBaseType !== 'all' && (
                  <Badge variant="outline">Тип базы: {filterBaseType}</Badge>
                )}
                {filterDate !== 'all' && (
                  <Badge variant="outline">Период: {filterDate}</Badge>
                )}
                {searchQuery !== '' && (
                  <Badge variant="outline">Поиск: &quot;{searchQuery}&quot;</Badge>
                )}
                {searchIdQuery !== '' && (
                  <Badge variant="outline">ID: &quot;{searchIdQuery}&quot;</Badge>
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
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип базы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Размер базы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Агент
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    A/B тест
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
                      <div className="text-sm font-mono font-medium text-gray-900">
                        {campaign.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getBaseTypeBadge(campaign.baseType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.totalNumbers.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Обработано: {campaign.progress}%</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {campaign.hasABTest ? (
                        <div className="flex flex-col items-center space-y-1">
                          <div className="flex items-center space-x-2">
                            <GitBranch className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">Активен</span>
                          </div>
                          {campaign.abTestVariants && (
                            <div className="flex space-x-1">
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                A: {campaign.abTestVariants.A.agent.substring(0, 3)}
                              </Badge>
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                B: {campaign.abTestVariants.B.agent.substring(0, 3)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
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

          {/* Таблица звонков */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Таблица звонков</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>
            
            {/* Фильтры для таблицы звонков */}
            <div className="flex items-center space-x-3 mb-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Кампания" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все кампании</SelectItem>
                  <SelectItem value="test">Тестовый обзвон базы</SelectItem>
                  <SelectItem value="reactive">Реактивация неактивных</SelectItem>
                  <SelectItem value="registration">База регистраций</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="talking">Разговор</SelectItem>
                  <SelectItem value="completed">Завершен</SelectItem>
                  <SelectItem value="voicemail">Автоответчик</SelectItem>
                  <SelectItem value="connecting">Соединение</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Агент" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все агенты</SelectItem>
                  <SelectItem value="anna">Анна</SelectItem>
                  <SelectItem value="mikhail">Михаил</SelectItem>
                  <SelectItem value="elena">Елена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Статус</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Агент</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Дата/Время</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Длительность</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Теги</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Транскрибация</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Скачать аудио</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { 
                      id: 'CNT-001234', 
                      status: 'talking', 
                      agent: 'Анна', 
                      datetime: '15.09.2025 14:32', 
                      duration: 120,
                      tags: ['Презентация', 'Интерес'],
                      transcription: 'Доступна',
                      audioUrl: '#'
                    },
                    { 
                      id: 'CNT-001235', 
                      status: 'completed', 
                      agent: 'Михаил', 
                      datetime: '15.09.2025 14:28', 
                      duration: 240,
                      tags: ['Отказ', 'Перезвонить'],
                      transcription: 'Доступна',
                      audioUrl: '#'
                    },
                    { 
                      id: 'CNT-001236', 
                      status: 'voicemail', 
                      agent: 'Елена', 
                      datetime: '15.09.2025 14:25', 
                      duration: 45,
                      tags: ['Автоответчик'],
                      transcription: 'Недоступна',
                      audioUrl: '#'
                    },
                    { 
                      id: 'CNT-001237', 
                      status: 'connecting', 
                      agent: 'Анна', 
                      datetime: '15.09.2025 14:35', 
                      duration: 5,
                      tags: [],
                      transcription: 'Недоступна',
                      audioUrl: '#'
                    },
                    { 
                      id: 'CNT-001238', 
                      status: 'completed', 
                      agent: 'Михаил', 
                      datetime: '15.09.2025 14:20', 
                      duration: 360,
                      tags: ['Успех', 'SMS согласие'],
                      transcription: 'Доступна',
                      audioUrl: '#'
                    },
                  ].map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono text-gray-900">{row.id}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {row.status === 'talking' ? (
                            <>
                              <Volume2 className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Разговор</span>
                            </>
                          ) : row.status === 'completed' ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-600">Завершен</span>
                            </>
                          ) : row.status === 'voicemail' ? (
                            <>
                              <MessageSquare className="h-4 w-4 text-purple-600" />
                              <span className="text-purple-600">Автоответчик</span>
                            </>
                          ) : (
                            <>
                              <Phone className="h-4 w-4 text-orange-600" />
                              <span className="text-orange-600">Соединение</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{row.agent}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{row.datetime}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-700">{formatCallDuration(row.duration)}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {row.tags.map((tag, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className={
                                tag === 'Успех' || tag === 'SMS согласие' ? 'text-green-700 border-green-300' :
                                tag === 'Отказ' ? 'text-red-700 border-red-300' :
                                tag === 'Автоответчик' ? 'text-purple-700 border-purple-300' :
                                'text-gray-700 border-gray-300'
                              }
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {row.transcription === 'Доступна' ? (
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            <FileText className="h-4 w-4 mr-1" />
                            Открыть
                          </Button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          <Download className="h-4 w-4 mr-1" />
                          Скачать
                        </Button>
                      </td>
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
