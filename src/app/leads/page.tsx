'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Phone, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  CheckCircle, 
  XCircle,
  Clock,
  Play,
  Filter,
  Calendar
} from 'lucide-react'

import { format } from 'date-fns'
import { mockCalls, mockLeads } from '@/lib/mock-data'
import { Call, CallOutcome } from '@/lib/types'
import { formatPhoneNumber, formatDate, formatCallDuration } from '@/lib/utils'

interface FunnelStage {
  name: string
  count: number
  percentage: number
  color: string
  icon: React.ComponentType<{ className?: string }>
}

interface CallTableRow {
  id: string
  date: string
  time: string
  duration: string
  phone: string
  outcome: CallOutcome
  campaign: string
  agent: string
  pages: number
  sessionId: string
}

export default function DealsPage() {
  const [calls] = useState<Call[]>(mockCalls)
  const [dateFilter, setDateFilter] = useState('today')
  const [outcomeFilter, setOutcomeFilter] = useState<CallOutcome | 'all'>('all')

  // Вычисляем статистику воронки
  const totalCalls = calls.length
  const answeredCalls = calls.filter(call => call.outcome === 'answer_success' || call.outcome === 'answer_refuse').length
  const successfulCalls = calls.filter(call => call.outcome === 'answer_success').length
  const convertedCalls = calls.filter(call => call.outcome === 'answer_success' && call.consentSms).length

  const funnelStages: FunnelStage[] = [
    {
      name: 'Всего звонков',
      count: totalCalls,
      percentage: 100,
      color: 'bg-blue-500',
      icon: Phone
    },
    {
      name: 'Дозвоны',
      count: answeredCalls,
      percentage: Math.round((answeredCalls / totalCalls) * 100),
      color: 'bg-green-500',
      icon: CheckCircle
    },
    {
      name: 'Успешные',
      count: successfulCalls,
      percentage: Math.round((successfulCalls / totalCalls) * 100),
      color: 'bg-purple-500',
      icon: Target
    },
    {
      name: 'Конверсии',
      count: convertedCalls,
      percentage: Math.round((convertedCalls / totalCalls) * 100),
      color: 'bg-orange-500',
      icon: TrendingUp
    }
  ]

  // Подготовка данных для таблицы
  const tableData: CallTableRow[] = calls
    .filter(call => outcomeFilter === 'all' || call.outcome === outcomeFilter)
    .map((call, index) => ({
      id: call.id,
      date: format(call.startedAt, 'dd.MM'),
      time: format(call.startedAt, 'HH:mm'),
      duration: formatCallDuration(call.duration || 0),
      phone: formatPhoneNumber(call.leadId), // Используем leadId как номер
      outcome: call.outcome,
      campaign: `Кампания ${call.campaignId.slice(-1)}`,
      agent: `Агент ${(index % 3) + 1}`,
      pages: Math.floor(Math.random() * 5) + 1,
      sessionId: call.id
    }))
    .slice(0, 20) // Показываем первые 20 записей

  const getOutcomeIcon = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'answer_success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'answer_refuse':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'no_answer':
        return <Phone className="h-4 w-4 text-gray-400" />
      case 'busy':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'voicemail':
        return <Play className="h-4 w-4 text-blue-500" />
      default:
        return <Phone className="h-4 w-4 text-gray-400" />
    }
  }

  const getOutcomeText = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'answer_success':
        return 'Успешно'
      case 'answer_refuse':
        return 'Отказ'
      case 'no_answer':
        return 'Не ответили'
      case 'busy':
        return 'Занято'
      case 'voicemail':
        return 'Голосовая почта'
      default:
        return outcome
    }
  }

  const getOutcomeBadgeColor = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'answer_success':
        return 'bg-green-100 text-green-800'
      case 'answer_refuse':
        return 'bg-red-100 text-red-800'
      case 'no_answer':
        return 'bg-gray-100 text-gray-800'
      case 'busy':
        return 'bg-yellow-100 text-yellow-800'
      case 'voicemail':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сделки</h1>
          <p className="text-gray-600">Воронка обзвонов и анализ звонков</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Период
          </Button>

        </div>
      </div>

      {/* Воронка обзвонов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Воронка обзвонов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {funnelStages.map((stage, index) => {
              const Icon = stage.icon
              const prevStage = index > 0 ? funnelStages[index - 1] : null
              const conversionRate = prevStage 
                ? Math.round((stage.count / prevStage.count) * 100) 
                : 100

              return (
                <div key={stage.name} className="relative">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${stage.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                          <Icon className={`h-6 w-6 ${stage.color.replace('bg-', 'text-')}`} />
                        </div>
                        {index > 0 && (
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Конверсия</div>
                            <div className="font-semibold text-sm">{conversionRate}%</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-900">{stage.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {stage.count.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({stage.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Визуальная полоса прогресса */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${stage.color}`}
                            style={{ width: `${stage.percentage}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Стрелка между этапами */}
                  {index < funnelStages.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Фильтры:</span>
            </div>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="yesterday">Вчера</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
              </SelectContent>
            </Select>

            <Select value={outcomeFilter} onValueChange={(value: string) => setOutcomeFilter(value as any)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Результат звонка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все результаты</SelectItem>
                <SelectItem value="answer_success">Успешные</SelectItem>
                <SelectItem value="answer_refuse">Отказы</SelectItem>
                <SelectItem value="no_answer">Не ответили</SelectItem>
                <SelectItem value="busy">Занято</SelectItem>
                <SelectItem value="voicemail">Голосовая почта</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Таблица звонков */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Журнал звонков
            </div>
            <span className="text-sm font-normal text-gray-500">
              1-{tableData.length} из {calls.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Дата и время визита</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Активность</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Время на сайте</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Просмотры</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Переход с сайта</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Номер визита</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Цели</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Страница выхода</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="p-1">
                          <Play className="h-3 w-3" />
                        </Button>
                        <span className="text-gray-600">{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        </div>
                        <span>{row.date}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{row.time}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{row.pages}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                        <span className="text-blue-600 text-xs">
                          il.hantico.ru/auth/login/
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {Math.floor(Math.random() * 200) + 1}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Badge className={getOutcomeBadgeColor(row.outcome)}>
                          {getOutcomeText(row.outcome)}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                        <span className="text-gray-600 text-xs">
                          {row.phone}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              1-20 из {calls.length} записей
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="px-3 py-1">«</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">‹</Button>
              <Button variant="default" size="sm" className="px-3 py-1 bg-orange-400 text-white">1</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">2</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">3</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">...</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">›</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">»</Button>
              <select className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm">
                <option>20</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}