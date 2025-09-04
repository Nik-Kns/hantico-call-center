'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Phone,
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Моковые данные для аналитики
const mockAnalyticsData = {
  summary: {
    totalCalls: 15847,
    successfulConnections: 11234,
    smsAgreements: 8456,
    bitrixTransfers: 2345,
    retries: 3421,
    connectionRate: 70.9,
    agreementRate: 75.3,
    conversionRate: 20.9
  },
  campaigns: [
    {
      id: 'obz-1',
      name: 'Акция "Новый год 2025"',
      calls: 5234,
      connections: 3712,
      agreements: 2845,
      transfers: 567,
      connectionRate: 70.9,
      agreementRate: 76.7,
      conversionRate: 19.9
    },
    {
      id: 'obz-2',
      name: 'Реактивация неактивных',
      calls: 7823,
      connections: 5456,
      agreements: 3901,
      transfers: 1123,
      connectionRate: 69.7,
      agreementRate: 71.5,
      conversionRate: 28.8
    },
    {
      id: 'obz-3',
      name: 'Холодная база январь',
      calls: 2790,
      connections: 2066,
      agreements: 1710,
      transfers: 655,
      connectionRate: 74.1,
      agreementRate: 82.8,
      conversionRate: 38.3
    }
  ],
  hourlyData: [
    { hour: '09:00', calls: 145, connections: 98, agreements: 76 },
    { hour: '10:00', calls: 234, connections: 167, agreements: 134 },
    { hour: '11:00', calls: 289, connections: 201, agreements: 156 },
    { hour: '12:00', calls: 198, connections: 134, agreements: 89 },
    { hour: '13:00', calls: 156, connections: 98, agreements: 67 },
    { hour: '14:00', calls: 267, connections: 189, agreements: 145 },
    { hour: '15:00', calls: 301, connections: 234, agreements: 178 },
    { hour: '16:00', calls: 278, connections: 198, agreements: 167 },
    { hour: '17:00', calls: 234, connections: 156, agreements: 123 },
    { hour: '18:00', calls: 189, connections: 123, agreements: 89 }
  ],
  funnelSteps: [
    { step: 'Звонки', count: 15847, rate: 100, color: 'bg-blue-500' },
    { step: 'Дозвоны', count: 11234, rate: 70.9, color: 'bg-green-500' },
    { step: 'Согласия на SMS', count: 8456, rate: 75.3, color: 'bg-purple-500' },
    { step: 'Регистрации', count: 4567, rate: 54.0, color: 'bg-orange-500' },
    { step: 'Передано в Bitrix', count: 2345, rate: 51.4, color: 'bg-red-500' }
  ]
}

export default function ObzvoniAnalyticsPage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedCampaign, setSelectedCampaign] = useState('all')

  const { summary, campaigns, hourlyData, funnelSteps } = mockAnalyticsData

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
              Аналитика обзвонов
            </h1>
            <p className="text-gray-600">
              Детальная статистика и анализ результатов кампаний
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Сегодня</SelectItem>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">3 месяца</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все кампании</SelectItem>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего звонков</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalCalls.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Дозвоны</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.successfulConnections.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">{summary.connectionRate}%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Согласия на SMS</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.smsAgreements.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">{summary.agreementRate}%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Конверсия</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.bitrixTransfers.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">{summary.conversionRate}%</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="funnel">Воронка</TabsTrigger>
          <TabsTrigger value="campaigns">По кампаниям</TabsTrigger>
          <TabsTrigger value="timeline">Динамика</TabsTrigger>
          <TabsTrigger value="details">Детализация</TabsTrigger>
        </TabsList>

        {/* Вкладка: Воронка */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Воронка обзвонов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelSteps.map((step, index) => (
                  <div key={step.step} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${step.color}`} />
                        <span className="font-medium">{step.step}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {step.count.toLocaleString()} ({step.rate}%)
                        </span>
                      </div>
                    </div>
                    <div className="ml-7">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${step.color}`}
                          style={{ width: `${step.rate}%` }}
                        />
                      </div>
                    </div>
                    {index < funnelSteps.length - 1 && (
                      <div className="ml-9 mt-2 mb-2">
                        <div className="text-xs text-gray-500">
                          ↓ Потери: {(funnelSteps[index].count - funnelSteps[index + 1].count).toLocaleString()} 
                          ({((1 - funnelSteps[index + 1].count / funnelSteps[index].count) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: По кампаниям */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800">Активна</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {campaign.calls.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Звонков</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {campaign.connections.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Дозвоны ({campaign.connectionRate}%)</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {campaign.agreements.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Согласия ({campaign.agreementRate}%)</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {campaign.transfers.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Конверсия ({campaign.conversionRate}%)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Вкладка: Динамика */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Динамика звонков по часам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hourlyData.map((data) => (
                  <div key={data.hour} className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium text-gray-600">
                      {data.hour}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Звонки</span>
                        <span className="text-sm font-medium">{data.calls}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${(data.calls / 301) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Дозвоны</span>
                        <span className="text-sm font-medium">{data.connections}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-green-500 rounded-full"
                          style={{ width: `${(data.connections / 234) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Согласия</span>
                        <span className="text-sm font-medium">{data.agreements}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-purple-500 rounded-full"
                          style={{ width: `${(data.agreements / 178) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: Детализация */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Детализация по результатам звонков</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Успешные</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {summary.successfulConnections.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {summary.connectionRate}% от всех звонков
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Не дозвонились</span>
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {(summary.totalCalls - summary.successfulConnections).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(100 - summary.connectionRate).toFixed(1)}% от всех звонков
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Повторные звонки</span>
                      <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {summary.retries.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Дожимы и повторы
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-4">Распределение результатов</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Согласился на SMS', count: summary.smsAgreements, color: 'bg-green-500', percentage: (summary.smsAgreements / summary.successfulConnections * 100).toFixed(1) },
                      { label: 'Отказался', count: summary.successfulConnections - summary.smsAgreements, color: 'bg-red-500', percentage: ((summary.successfulConnections - summary.smsAgreements) / summary.successfulConnections * 100).toFixed(1) },
                      { label: 'Передано в Bitrix', count: summary.bitrixTransfers, color: 'bg-blue-500', percentage: (summary.bitrixTransfers / summary.smsAgreements * 100).toFixed(1) },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${item.color}`} />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {item.count.toLocaleString()} ({item.percentage}%)
                          </span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
