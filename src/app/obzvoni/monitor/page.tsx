'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Filter,
  Download,
  Eye,
  Play,
  Pause,
  Square,
  Calendar,
  TrendingUp,
  TrendingDown,
  Bot
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CompanyMonitor {
  id: string
  companyId: string
  name: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  // Основные метрики
  totalReceived: number  // Передано контактов
  totalProcessed: number  // Обработано
  totalInProgress: number  // В работе
  completionPercent: number  // % выполнения
  // Категории результатов
  successCount: number  // Успешные
  refusalCount: number  // Отказы
  noAnswerCount: number  // Недозвоны
  voicemailCount: number  // Автоответчики (отдельная категория)
  // Дополнительные данные
  lastActivity: Date
  agent: string
}

// Моковые данные
const mockCompanies: CompanyMonitor[] = [
  {
    id: 'obz-1',
    companyId: 'CMP-1A2B3C4D',
    name: 'Новогодняя акция 2025',
    status: 'active',
    totalReceived: 2500,
    totalProcessed: 1847,
    totalInProgress: 653,
    completionPercent: 73.88,
    successCount: 1234,
    refusalCount: 312,
    noAnswerCount: 189,
    voicemailCount: 112,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
    agent: 'Анна'
  },
  {
    id: 'obz-2',
    companyId: 'CMP-5E6F7G8H',
    name: 'Реактивация клиентов',
    status: 'paused',
    totalReceived: 1800,
    totalProcessed: 456,
    totalInProgress: 1344,
    completionPercent: 25.33,
    successCount: 234,
    refusalCount: 89,
    noAnswerCount: 78,
    voicemailCount: 55,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    agent: 'Михаил'
  },
  {
    id: 'obz-3',
    companyId: 'CMP-9I0J1K2L',
    name: 'Холодная база январь',
    status: 'completed',
    totalReceived: 850,
    totalProcessed: 850,
    totalInProgress: 0,
    completionPercent: 100,
    successCount: 445,
    refusalCount: 178,
    noAnswerCount: 156,
    voicemailCount: 71,
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
    agent: 'Елена'
  },
  {
    id: 'obz-4',
    companyId: 'CMP-3M4N5O6P',
    name: 'VIP клиенты',
    status: 'active',
    totalReceived: 450,
    totalProcessed: 380,
    totalInProgress: 70,
    completionPercent: 84.44,
    successCount: 312,
    refusalCount: 23,
    noAnswerCount: 28,
    voicemailCount: 17,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000),
    agent: 'Дмитрий'
  },
  {
    id: 'obz-5',
    companyId: 'CMP-7Q8R9S0T',
    name: 'Повторные продажи',
    status: 'draft',
    totalReceived: 1200,
    totalProcessed: 0,
    totalInProgress: 0,
    completionPercent: 0,
    successCount: 0,
    refusalCount: 0,
    noAnswerCount: 0,
    voicemailCount: 0,
    lastActivity: new Date(Date.now() - 48 * 60 * 60 * 1000),
    agent: 'Анна'
  }
]

export default function ObzvoniMonitorPage() {
  const router = useRouter()
  const [companies] = useState<CompanyMonitor[]>(mockCompanies)
  const [periodFilter, setPeriodFilter] = useState('today')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  const formatLastActivity = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    return `${days} дн назад`
  }

  const getConversionRate = (company: CompanyMonitor) => {
    if (company.totalProcessed === 0) return 0
    return Math.round((company.successCount / company.totalProcessed) * 100)
  }

  // Фильтрация компаний
  const filteredCompanies = companies.filter(company => {
    if (statusFilter !== 'all' && company.status !== statusFilter) return false
    if (searchQuery && !company.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Подсчет агрегированных метрик
  const totalMetrics = {
    received: filteredCompanies.reduce((sum, c) => sum + c.totalReceived, 0),
    processed: filteredCompanies.reduce((sum, c) => sum + c.totalProcessed, 0),
    inProgress: filteredCompanies.reduce((sum, c) => sum + c.totalInProgress, 0),
    success: filteredCompanies.reduce((sum, c) => sum + c.successCount, 0),
    voicemail: filteredCompanies.reduce((sum, c) => sum + c.voicemailCount, 0)
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
              Мониторинг компаний
            </h1>
            <p className="text-gray-600">
              Обзор состояния и метрик всех компаний
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Label className="text-sm">Фильтры:</Label>
            </div>
            
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="quarter">Квартал</SelectItem>
                <SelectItem value="all">Все время</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="paused">На паузе</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
                <SelectItem value="draft">Черновики</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />

            <div className="flex-1" />

            <div className="text-sm text-gray-600">
              Найдено: <span className="font-medium">{filteredCompanies.length}</span> компаний
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Сводная статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Передано</p>
            <p className="text-2xl font-bold">{totalMetrics.received.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Обработано</p>
            <p className="text-2xl font-bold text-blue-600">{totalMetrics.processed.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">В работе</p>
            <p className="text-2xl font-bold text-orange-600">{totalMetrics.inProgress.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Успешные</p>
            <p className="text-2xl font-bold text-green-600">{totalMetrics.success.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Автоответчики</p>
            <p className="text-2xl font-bold text-purple-600">{totalMetrics.voicemail.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Таблица компаний */}
      <Card>
        <CardHeader>
          <CardTitle>Список компаний</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Компания
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Передано
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Обработано
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    В работе
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    % выполнения
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Конверсия
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    <Bot className="h-4 w-4 mx-auto" title="Автоответчики" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Последняя активность
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => {
                  const conversionRate = getConversionRate(company)
                  const isHighConversion = conversionRate > 60
                  const isLowConversion = conversionRate < 30

                  return (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-xs text-gray-500">{company.companyId}</p>
                          <p className="text-xs text-gray-500">Агент: {company.agent}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(company.status)}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {company.totalReceived.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-blue-600">
                          {company.totalProcessed.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-orange-600">
                          {company.totalInProgress.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Progress value={company.completionPercent} className="flex-1" />
                          <span className="text-sm font-medium min-w-[3rem] text-right">
                            {company.completionPercent.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isHighConversion && <TrendingUp className="h-4 w-4 text-green-600" />}
                          {isLowConversion && <TrendingDown className="h-4 w-4 text-red-600" />}
                          <span className={`font-medium ${
                            isHighConversion ? 'text-green-600' : 
                            isLowConversion ? 'text-red-600' : 
                            'text-gray-900'
                          }`}>
                            {conversionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {company.voicemailCount > 0 ? (
                          <Badge className="bg-purple-100 text-purple-800">
                            {company.voicemailCount}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatLastActivity(company.lastActivity)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1">
                          {company.status === 'active' && (
                            <Button size="sm" variant="ghost" title="Пауза">
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {company.status === 'paused' && (
                            <Button size="sm" variant="ghost" title="Продолжить">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {company.status === 'draft' && (
                            <Button size="sm" variant="ghost" title="Запустить">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {company.status === 'completed' && (
                            <Button size="sm" variant="ghost" disabled title="Завершено">
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => router.push(`/obzvoni/${company.id}`)}
                            title="Подробнее"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Компании не найдены</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}