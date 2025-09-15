'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  GitBranch,
  Play,
  Pause,
  TrendingUp,
  Calendar,
  Users,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ABTest {
  id: string
  campaignId: string
  campaignName: string
  status: 'active' | 'paused' | 'completed'
  startDate: Date
  variantA: {
    agent: string
    traffic: number
    calls: number
    conversions: number
    conversionRate: number
  }
  variantB: {
    agent: string
    traffic: number
    calls: number
    conversions: number
    conversionRate: number
  }
  winner?: 'A' | 'B'
  confidence: number
}

// Моковые данные
const mockABTests: ABTest[] = [
  {
    id: 'test-1',
    campaignId: 'obz-1',
    campaignName: 'Новогодняя акция 2025',
    status: 'active',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    variantA: {
      agent: 'Анна',
      traffic: 50,
      calls: 1250,
      conversions: 625,
      conversionRate: 50.0
    },
    variantB: {
      agent: 'Елена',
      traffic: 50,
      calls: 1250,
      conversions: 688,
      conversionRate: 55.0
    },
    winner: 'B',
    confidence: 92.5
  },
  {
    id: 'test-2',
    campaignId: 'obz-2',
    campaignName: 'Реактивация клиентов',
    status: 'paused',
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    variantA: {
      agent: 'Михаил',
      traffic: 60,
      calls: 1080,
      conversions: 324,
      conversionRate: 30.0
    },
    variantB: {
      agent: 'Иван',
      traffic: 40,
      calls: 720,
      conversions: 194,
      conversionRate: 27.0
    },
    confidence: 78.3
  },
  {
    id: 'test-3',
    campaignId: 'obz-3',
    campaignName: 'Холодная база январь',
    status: 'completed',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    variantA: {
      agent: 'Елена',
      traffic: 50,
      calls: 425,
      conversions: 213,
      conversionRate: 50.1
    },
    variantB: {
      agent: 'Ольга',
      traffic: 50,
      calls: 425,
      conversions: 238,
      conversionRate: 56.0
    },
    winner: 'B',
    confidence: 95.8
  }
]

export default function CompaniesABTestsPage() {
  const router = useRouter()
  const [tests] = useState<ABTest[]>(mockABTests)
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активен</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Пауза</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Завершен</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getWinnerBadge = (test: ABTest) => {
    if (test.winner) {
      const variant = test.winner === 'A' ? test.variantA : test.variantB
      return (
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">
            Вариант {test.winner} ({variant.agent})
          </span>
        </div>
      )
    }
    return null
  }

  const filteredTests = tests.filter(test => {
    if (searchFilter && !test.campaignName.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false
    }
    if (statusFilter !== 'all' && test.status !== statusFilter) {
      return false
    }
    return true
  })

  // Подсчет статистики
  const activeTests = tests.filter(t => t.status === 'active').length
  const totalTests = tests.length
  const avgConfidence = tests.reduce((sum, t) => sum + t.confidence, 0) / tests.length
  const testsWithWinner = tests.filter(t => t.winner).length

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
              A/B тесты всех кампаний
            </h1>
            <p className="text-gray-600">
              Обзор и управление A/B тестами
            </p>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные тесты</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTests}
                </p>
                <p className="text-xs text-gray-500">
                  из {totalTests} всего
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средняя уверенность</p>
                <p className="text-2xl font-bold text-blue-600">
                  {avgConfidence.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  статистическая значимость
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">С победителем</p>
                <p className="text-2xl font-bold text-purple-600">
                  {testsWithWinner}
                </p>
                <p className="text-xs text-gray-500">
                  тестов с результатом
                </p>
              </div>
              <GitBranch className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего звонков</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tests.reduce((sum, t) => sum + t.variantA.calls + t.variantB.calls, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  в A/B тестах
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Фильтры:</span>
            </div>
            
            <Input
              placeholder="Поиск по названию кампании..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-64"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="paused">На паузе</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все время</SelectItem>
                <SelectItem value="week">Последняя неделя</SelectItem>
                <SelectItem value="month">Последний месяц</SelectItem>
                <SelectItem value="quarter">Последний квартал</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Таблица тестов */}
      <Card>
        <CardHeader>
          <CardTitle>A/B тесты</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Кампания
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Вариант A
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Вариант B
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Уверенность
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Результат
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{test.campaignName}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Начат {test.startDate.toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(test.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{test.variantA.agent}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{test.variantA.traffic}% трафика</span>
                          <span>{test.variantA.calls} звонков</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={test.variantA.conversionRate} 
                            className="w-20 h-2"
                          />
                          <span className="text-xs font-medium">
                            {test.variantA.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{test.variantB.agent}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{test.variantB.traffic}% трафика</span>
                          <span>{test.variantB.calls} звонков</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={test.variantB.conversionRate} 
                            className="w-20 h-2"
                          />
                          <span className="text-xs font-medium">
                            {test.variantB.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={test.confidence} 
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-medium">
                          {test.confidence.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getWinnerBadge(test)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/companies/${test.campaignId}/ab-tests`)}
                      >
                        Подробнее
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
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