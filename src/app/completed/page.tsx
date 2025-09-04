'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Filter,
  Search,
  Calendar,
  User,
  Phone,
  Play,
  FileText,
  Download,
  BarChart3,
  Eye,
  MessageSquare,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCallDuration } from '@/lib/utils'

// Типы для выполненных звонков
interface CompletedCall {
  id: string
  campaignId: string
  campaignName: string
  phoneNumber: string
  contactName: string
  agentName: string
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
}

interface CompletedCampaign {
  id: string
  name: string
  startDate: Date
  endDate: Date
  totalCalls: number
  successfulCalls: number
  consentRate: number
  retryRate: number
  status: 'completed' | 'archived'
}

// Моковые данные для выполненных звонков
const mockCompletedCalls: CompletedCall[] = [
  {
    id: 'call-001',
    campaignId: 'obz-1',
    campaignName: 'Тестовый обзвон 2',
    phoneNumber: '+7 (999) 123-45-67',
    contactName: 'Иван Петров',
    agentName: 'Анна',
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
    transcription: 'Здравствуйте! Меня зовут Анна...',
    nextAction: 'sms'
  },
  {
    id: 'call-002',
    campaignId: 'obz-1',
    campaignName: 'Тестовый обзвон 2',
    phoneNumber: '+7 (999) 234-56-78',
    contactName: 'Мария Сидорова',
    agentName: 'Михаил',
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
    transcription: 'Добрый день! К сожалению, меня это не интересует...',
    nextAction: 'bitrix'
  },
  {
    id: 'call-003',
    campaignId: 'obz-2',
    campaignName: 'Реактивация неактивных',
    phoneNumber: '+7 (999) 345-67-89',
    contactName: 'Алексей Иванов',
    agentName: 'Елена',
    startTime: new Date('2024-01-15T14:20:00Z'),
    endTime: new Date('2024-01-15T14:20:15Z'),
    duration: 15,
    status: 'no_answer',
    result: 'no_answer',
    hasConsent: false,
    smsSent: false,
    retryScheduled: true,
    sentToBitrix: false,
    nextAction: 'retry'
  },
  {
    id: 'call-004',
    campaignId: 'obz-1',
    campaignName: 'Тестовый обзвон 2',
    phoneNumber: '+7 (999) 456-78-90',
    contactName: 'Ольга Козлова',
    agentName: 'Анна',
    startTime: new Date('2024-01-15T15:45:00Z'),
    endTime: new Date('2024-01-15T15:48:20Z'),
    duration: 200,
    status: 'completed',
    result: 'callback',
    hasConsent: false,
    smsSent: false,
    retryScheduled: true,
    sentToBitrix: false,
    nextAction: 'retry'
  },
  {
    id: 'call-005',
    campaignId: 'obz-3',
    campaignName: 'Холодная база январь',
    phoneNumber: '+7 (999) 567-89-01',
    contactName: 'Дмитрий Волков',
    agentName: 'Михаил',
    startTime: new Date('2024-01-14T16:30:00Z'),
    endTime: new Date('2024-01-14T16:35:15Z'),
    duration: 315,
    status: 'completed',
    result: 'success',
    hasConsent: true,
    smsSent: true,
    retryScheduled: false,
    sentToBitrix: false,
    nextAction: 'completed'
  }
]

// Моковые данные завершенных кампаний
const mockCompletedCampaigns: CompletedCampaign[] = [
  {
    id: 'completed-1',
    name: 'Новогодняя акция 2024',
    startDate: new Date('2023-12-20T00:00:00Z'),
    endDate: new Date('2024-01-10T00:00:00Z'),
    totalCalls: 2500,
    successfulCalls: 1687,
    consentRate: 42.3,
    retryRate: 18.7,
    status: 'completed'
  },
  {
    id: 'completed-2',
    name: 'Реактивация Q4 2023',
    startDate: new Date('2023-11-01T00:00:00Z'),
    endDate: new Date('2023-12-15T00:00:00Z'),
    totalCalls: 1800,
    successfulCalls: 1234,
    consentRate: 38.9,
    retryRate: 22.1,
    status: 'archived'
  }
]

export default function CompletedPage() {
  const router = useRouter()
  const [calls, setCalls] = useState<CompletedCall[]>(mockCompletedCalls)
  const [campaigns] = useState<CompletedCampaign[]>(mockCompletedCampaigns)
  const [isLoading, setIsLoading] = useState(false)

  // Фильтры
  const [filters, setFilters] = useState({
    search: '',
    campaign: 'all',
    agent: 'all',
    status: 'all',
    result: 'all',
    dateFrom: '',
    dateTo: ''
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Обновление счетчика активных фильтров
  useEffect(() => {
    let count = 0
    if (filters.search) count++
    if (filters.campaign !== 'all') count++
    if (filters.agent !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.result !== 'all') count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    setActiveFiltersCount(count)
  }, [filters])

  // Фильтрация звонков
  const filteredCalls = calls.filter(call => {
    const matchesSearch = !filters.search || 
      call.contactName.toLowerCase().includes(filters.search.toLowerCase()) ||
      call.phoneNumber.includes(filters.search)
    
    const matchesCampaign = filters.campaign === 'all' || call.campaignId === filters.campaign
    const matchesAgent = filters.agent === 'all' || call.agentName === filters.agent
    const matchesStatus = filters.status === 'all' || call.status === filters.status
    const matchesResult = filters.result === 'all' || call.result === filters.result
    
    const matchesDateFrom = !filters.dateFrom || call.startTime >= new Date(filters.dateFrom)
    const matchesDateTo = !filters.dateTo || call.startTime <= new Date(filters.dateTo + 'T23:59:59')

    return matchesSearch && matchesCampaign && matchesAgent && matchesStatus && matchesResult && matchesDateFrom && matchesDateTo
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      campaign: 'all',
      agent: 'all',
      status: 'all',
      result: 'all',
      dateFrom: '',
      dateTo: ''
    })
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleViewCall = (callId: string) => {
    router.push(`/completed/${callId}`)
  }

  const handleExportCalls = () => {
    // Имитация экспорта
    console.log('Экспорт звонков:', filteredCalls)
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

  const getNextActionIcon = (action?: string) => {
    switch (action) {
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'retry':
        return <RotateCcw className="h-4 w-4 text-orange-600" />
      case 'bitrix':
        return <ExternalLink className="h-4 w-4 text-purple-600" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return null
    }
  }

  // Уникальные значения для фильтров
  const uniqueCampaigns = Array.from(new Set(calls.map(call => ({ id: call.campaignId, name: call.campaignName }))))
  const uniqueAgents = Array.from(new Set(calls.map(call => call.agentName)))

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Выполненные звонки
          </h1>
          <p className="text-gray-600">
            История всех совершенных звонков и их результаты
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          
          <Button variant="outline" onClick={handleExportCalls}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          
          <Button onClick={() => router.push('/completed/analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Аналитика
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего звонков</p>
                <p className="text-2xl font-bold text-gray-900">{calls.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Успешные</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calls.filter(c => c.result === 'success' || c.result === 'consent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SMS отправлено</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calls.filter(c => c.smsSent).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ExternalLink className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">В Bitrix24</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calls.filter(c => c.sentToBitrix).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Фильтры
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Сбросить
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Поиск
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Имя или телефон"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Кампания
              </label>
              <Select value={filters.campaign} onValueChange={(value) => handleFilterChange('campaign', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все кампании</SelectItem>
                  {uniqueCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Агент
              </label>
              <Select value={filters.agent} onValueChange={(value) => handleFilterChange('agent', value)}>
                <SelectTrigger>
                  <SelectValue />
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
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Статус
              </label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="completed">Состоялся</SelectItem>
                  <SelectItem value="no_answer">Не ответил</SelectItem>
                  <SelectItem value="busy">Занято</SelectItem>
                  <SelectItem value="rejected">Отказ</SelectItem>
                  <SelectItem value="retry">Повторный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Результат
              </label>
              <Select value={filters.result} onValueChange={(value) => handleFilterChange('result', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все результаты</SelectItem>
                  <SelectItem value="success">Успех</SelectItem>
                  <SelectItem value="consent">Согласие</SelectItem>
                  <SelectItem value="refusal">Отказ</SelectItem>
                  <SelectItem value="no_answer">Не ответил</SelectItem>
                  <SelectItem value="callback">Перезвонить</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Дата от
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Дата до
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица звонков */}
      <Card>
        <CardHeader>
          <CardTitle>
            Звонки ({filteredCalls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCalls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Контакт</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Кампания</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Агент</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Дата и время</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Длительность</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Статус</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Результат</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Действие</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map((call) => (
                    <tr key={call.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono">{call.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{call.contactName}</div>
                          <div className="text-sm text-gray-600">{call.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{call.campaignName}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{call.agentName}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm text-gray-900">{formatDate(call.startTime)}</div>
                          <div className="text-xs text-gray-600">
                            {call.startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {formatCallDuration(call.duration)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(call.status)}
                      </td>
                      <td className="py-3 px-4">
                        {getResultBadge(call.result)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getNextActionIcon(call.nextAction)}
                          {call.hasConsent && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewCall(call.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Подробнее
                        </Button>
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
                Звонки не найдены
              </h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры фильтрации
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Завершенные кампании */}
      <Card>
        <CardHeader>
          <CardTitle>Завершенные кампании</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {campaign.status === 'completed' ? 'Завершена' : 'Архив'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-600">Всего звонков</p>
                    <p className="text-lg font-bold text-gray-900">{campaign.totalCalls.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Успешные</p>
                    <p className="text-lg font-bold text-green-600">{campaign.successfulCalls.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">% согласий</p>
                    <p className="text-lg font-bold text-blue-600">{campaign.consentRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">% дожимов</p>
                    <p className="text-lg font-bold text-orange-600">{campaign.retryRate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
