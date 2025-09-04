'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Phone,
  CheckCircle,
  MessageSquare,
  ExternalLink,
  Users,
  Clock
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Интерфейсы для аналитики
interface AnalyticsMetrics {
  totalCalls: number
  successfulCalls: number
  successRate: number
  consentRate: number
  smsSent: number
  sentToBitrix: number
  avgCallDuration: number
  retryRate: number
}

interface DailyMetrics {
  date: string
  calls: number
  successful: number
  consents: number
  sms: number
  bitrix: number
}

interface CampaignAnalytics {
  campaignId: string
  campaignName: string
  totalCalls: number
  successRate: number
  consentRate: number
  avgDuration: number
  smsSent: number
  bitrixTransfers: number
}

interface AgentAnalytics {
  agentName: string
  totalCalls: number
  successRate: number
  avgDuration: number
  consentRate: number
}

// Моковые данные для аналитики
const mockAnalyticsMetrics: AnalyticsMetrics = {
  totalCalls: 1247,
  successfulCalls: 856,
  successRate: 68.6,
  consentRate: 42.3,
  smsSent: 527,
  sentToBitrix: 234,
  avgCallDuration: 187,
  retryRate: 15.8
}

const mockDailyMetrics: DailyMetrics[] = [
  { date: '2024-01-10', calls: 120, successful: 82, consents: 45, sms: 45, bitrix: 18 },
  { date: '2024-01-11', calls: 135, successful: 95, consents: 52, sms: 52, bitrix: 22 },
  { date: '2024-01-12', calls: 98, successful: 67, consents: 28, sms: 28, bitrix: 15 },
  { date: '2024-01-13', calls: 156, successful: 108, consents: 67, sms: 67, bitrix: 25 },
  { date: '2024-01-14', calls: 142, successful: 96, consents: 58, sms: 58, bitrix: 21 },
  { date: '2024-01-15', calls: 178, successful: 125, consents: 78, sms: 78, bitrix: 28 },
  { date: '2024-01-16', calls: 165, successful: 112, consents: 69, sms: 69, bitrix: 24 }
]

const mockCampaignAnalytics: CampaignAnalytics[] = [
  {
    campaignId: 'obz-1',
    campaignName: 'Тестовый обзвон 2',
    totalCalls: 847,
    successRate: 73.2,
    consentRate: 45.8,
    avgDuration: 195,
    smsSent: 388,
    bitrixTransfers: 156
  },
  {
    campaignId: 'obz-2',
    campaignName: 'Реактивация неактивных',
    totalCalls: 456,
    successRate: 61.4,
    consentRate: 35.7,
    avgDuration: 165,
    smsSent: 163,
    bitrixTransfers: 98
  },
  {
    campaignId: 'obz-3',
    campaignName: 'Холодная база январь',
    totalCalls: 234,
    successRate: 58.1,
    consentRate: 28.9,
    avgDuration: 142,
    smsSent: 68,
    bitrixTransfers: 45
  }
]

const mockAgentAnalytics: AgentAnalytics[] = [
  {
    agentName: 'Анна',
    totalCalls: 523,
    successRate: 74.6,
    avgDuration: 198,
    consentRate: 48.2
  },
  {
    agentName: 'Михаил',
    totalCalls: 398,
    successRate: 65.8,
    avgDuration: 175,
    consentRate: 38.9
  },
  {
    agentName: 'Елена',
    totalCalls: 326,
    successRate: 62.3,
    avgDuration: 182,
    consentRate: 35.6
  }
]

export default function CompletedAnalyticsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState('7d')
  const [selectedCampaign, setSelectedCampaign] = useState('all')
  const [selectedAgent, setSelectedAgent] = useState('all')

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleExport = () => {
    console.log('Экспорт аналитики')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
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
              Аналитика выполненных звонков
            </h1>
            <p className="text-gray-600">
              Детальная статистика и тренды по всем звонкам
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Период
              </label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Сегодня</SelectItem>
                  <SelectItem value="7d">7 дней</SelectItem>
                  <SelectItem value="30d">30 дней</SelectItem>
                  <SelectItem value="90d">90 дней</SelectItem>
                  <SelectItem value="custom">Выбрать период</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Кампания
              </label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все кампании</SelectItem>
                  {mockCampaignAnalytics.map((campaign) => (
                    <SelectItem key={campaign.campaignId} value={campaign.campaignId}>
                      {campaign.campaignName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Агент
              </label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все агенты</SelectItem>
                  {mockAgentAnalytics.map((agent) => (
                    <SelectItem key={agent.agentName} value={agent.agentName}>
                      {agent.agentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего звонков</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockAnalyticsMetrics.totalCalls.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
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
                <p className="text-sm font-medium text-gray-600">Успешность</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockAnalyticsMetrics.successRate}%
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+3.2%</span>
                </div>
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
                <p className="text-sm font-medium text-gray-600">Согласие на SMS</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockAnalyticsMetrics.consentRate}%
                </p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm text-red-600">-1.8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Средняя длительность</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(mockAnalyticsMetrics.avgCallDuration)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+8s</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Динамика по дням */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Динамика звонков по дням
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Простая визуализация данных */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Дата</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Звонков</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Успешных</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">% успешных</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Согласий</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">SMS</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Bitrix24</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDailyMetrics.map((day) => (
                    <tr key={day.date} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm">{formatDate(day.date)}</td>
                      <td className="py-2 px-3 text-sm font-medium">{day.calls}</td>
                      <td className="py-2 px-3 text-sm text-green-600 font-medium">{day.successful}</td>
                      <td className="py-2 px-3 text-sm">
                        {((day.successful / day.calls) * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-sm text-blue-600 font-medium">{day.consents}</td>
                      <td className="py-2 px-3 text-sm text-orange-600 font-medium">{day.sms}</td>
                      <td className="py-2 px-3 text-sm text-purple-600 font-medium">{day.bitrix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Аналитика по кампаниям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Аналитика по кампаниям
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCampaignAnalytics.map((campaign) => (
                <div key={campaign.campaignId} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{campaign.campaignName}</h4>
                    <Badge variant="outline">{campaign.totalCalls} звонков</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Успешность</p>
                      <p className="text-lg font-bold text-green-600">{campaign.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Согласие</p>
                      <p className="text-lg font-bold text-blue-600">{campaign.consentRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">SMS отправлено</p>
                      <p className="text-lg font-bold text-orange-600">{campaign.smsSent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">В Bitrix24</p>
                      <p className="text-lg font-bold text-purple-600">{campaign.bitrixTransfers}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Средняя длительность</p>
                    <p className="text-sm font-medium text-gray-900">{formatDuration(campaign.avgDuration)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Аналитика по агентам */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Аналитика по агентам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAgentAnalytics.map((agent) => (
                <div key={agent.agentName} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{agent.agentName}</h4>
                    <Badge variant="outline">{agent.totalCalls} звонков</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Успешность</p>
                      <p className="text-lg font-bold text-green-600">{agent.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Согласие</p>
                      <p className="text-lg font-bold text-blue-600">{agent.consentRate}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Средняя длительность</p>
                    <p className="text-sm font-medium text-gray-900">{formatDuration(agent.avgDuration)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">SMS отправлено</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockAnalyticsMetrics.smsSent}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                из {mockAnalyticsMetrics.totalCalls} звонков
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <ExternalLink className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Передано в Bitrix24</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockAnalyticsMetrics.sentToBitrix}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((mockAnalyticsMetrics.sentToBitrix / mockAnalyticsMetrics.totalCalls) * 100).toFixed(1)}% от общего числа
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Повторные звонки</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockAnalyticsMetrics.retryRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                от всех звонков
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
