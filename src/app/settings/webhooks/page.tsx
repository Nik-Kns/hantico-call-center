'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Webhook,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Filter,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Search,
  Calendar
} from 'lucide-react'

interface WebhookEvent {
  id: string
  timestamp: string
  type: 'call_started' | 'call_ended' | 'sms_sent' | 'registration_completed' | 'consent_given'
  status: 'delivered' | 'failed' | 'pending' | 'retrying'
  campaign: string
  endpoint: string
  payload: any
  attempts: number
  nextRetry?: string
  responseCode?: number
  responseTime?: number
  error?: string
}

const mockEvents: WebhookEvent[] = [
  {
    id: 'evt_1',
    timestamp: '2024-01-09 11:03:45',
    type: 'call_ended',
    status: 'delivered',
    campaign: 'Новогодняя кампания',
    endpoint: 'https://crm.company.ru/webhook',
    payload: { leadId: 12345, duration: 180, status: 'success' },
    attempts: 1,
    responseCode: 200,
    responseTime: 145
  },
  {
    id: 'evt_2',
    timestamp: '2024-01-09 11:02:30',
    type: 'sms_sent',
    status: 'failed',
    campaign: 'Реактивация клиентов',
    endpoint: 'https://crm.company.ru/webhook',
    payload: { phone: '+7900***1234', template: 'registration_link' },
    attempts: 3,
    nextRetry: '11:15:00',
    error: 'Connection timeout'
  },
  {
    id: 'evt_3',
    timestamp: '2024-01-09 11:01:15',
    type: 'registration_completed',
    status: 'delivered',
    campaign: 'Новогодняя кампания',
    endpoint: 'https://analytics.company.ru/track',
    payload: { userId: 'usr_789', source: 'sms_link' },
    attempts: 1,
    responseCode: 200,
    responseTime: 89
  },
  {
    id: 'evt_4',
    timestamp: '2024-01-09 11:00:00',
    type: 'consent_given',
    status: 'retrying',
    campaign: 'Обзвон базы',
    endpoint: 'https://crm.company.ru/webhook',
    payload: { leadId: 67890, consentType: 'sms_marketing' },
    attempts: 2,
    nextRetry: '11:05:00',
    error: 'Server returned 503'
  },
  {
    id: 'evt_5',
    timestamp: '2024-01-09 10:58:30',
    type: 'call_started',
    status: 'delivered',
    campaign: 'VIP сегмент',
    endpoint: 'https://crm.company.ru/webhook',
    payload: { leadId: 11111, agentId: 'ai_001' },
    attempts: 1,
    responseCode: 200,
    responseTime: 67
  }
]

const stats = {
  total24h: 12456,
  delivered: 11890,
  failed: 456,
  retrying: 110,
  avgResponseTime: 125,
  successRate: 95.5
}

export default function WebhooksPage() {
  const router = useRouter()
  const [events, setEvents] = useState<WebhookEvent[]>(mockEvents)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCampaign, setFilterCampaign] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleRetry = (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          status: 'pending',
          attempts: event.attempts + 1,
          nextRetry: '5 секунд'
        }
      }
      return event
    }))

    setTimeout(() => {
      setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            status: 'delivered',
            responseCode: 200,
            responseTime: 123
          }
        }
        return event
      }))
    }, 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Доставлено</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Ошибка</Badge>
      case 'retrying':
        return <Badge className="bg-yellow-100 text-yellow-800">Повтор</Badge>
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">В очереди</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'call_started': return 'Звонок начат'
      case 'call_ended': return 'Звонок завершен'
      case 'sms_sent': return 'SMS отправлена'
      case 'registration_completed': return 'Регистрация завершена'
      case 'consent_given': return 'Согласие получено'
      default: return type
    }
  }

  const filteredEvents = events.filter(event => {
    if (filterStatus !== 'all' && event.status !== filterStatus) return false
    if (filterType !== 'all' && event.type !== filterType) return false
    if (filterCampaign !== 'all' && event.campaign !== filterCampaign) return false
    if (searchQuery && !JSON.stringify(event).toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/settings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к настройкам
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Центр вебхуков и событий</h1>
            <p className="text-gray-600">
              Мониторинг и управление исходящими событиями системы
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Последние 24 часа
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего/24ч</p>
                <p className="text-2xl font-bold">{stats.total24h.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Доставлено</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ошибки</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В повторе</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.retrying}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-yellow-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ср. время</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Успешность</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ID, endpoint, payload..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="delivered">Доставлено</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                  <SelectItem value="retrying">Повтор</SelectItem>
                  <SelectItem value="pending">В очереди</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Тип события</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="call_started">Звонок начат</SelectItem>
                  <SelectItem value="call_ended">Звонок завершен</SelectItem>
                  <SelectItem value="sms_sent">SMS отправлена</SelectItem>
                  <SelectItem value="registration_completed">Регистрация</SelectItem>
                  <SelectItem value="consent_given">Согласие</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="campaign">Кампания</Label>
              <Select value={filterCampaign} onValueChange={setFilterCampaign}>
                <SelectTrigger id="campaign">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все кампании</SelectItem>
                  <SelectItem value="Новогодняя кампания">Новогодняя кампания</SelectItem>
                  <SelectItem value="Реактивация клиентов">Реактивация клиентов</SelectItem>
                  <SelectItem value="Обзвон базы">Обзвон базы</SelectItem>
                  <SelectItem value="VIP сегмент">VIP сегмент</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Лента событий</CardTitle>
            <Badge variant="outline">{filteredEvents.length} событий</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Тип события</TableHead>
                <TableHead>Кампания</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Попытки</TableHead>
                <TableHead>Время ответа</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-sm">
                    {event.timestamp}
                  </TableCell>
                  <TableCell>{getTypeLabel(event.type)}</TableCell>
                  <TableCell>{event.campaign}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <span className="font-mono text-xs">{event.endpoint}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      {getStatusBadge(event.status)}
                      {event.error && (
                        <span className="text-xs text-red-600">{event.error}</span>
                      )}
                      {event.nextRetry && (
                        <span className="text-xs text-gray-500">Повтор: {event.nextRetry}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span>{event.attempts}</span>
                      {event.attempts > 1 && (
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.responseTime ? (
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{event.responseTime}ms</span>
                        {event.responseCode && (
                          <span className={`text-xs ${event.responseCode === 200 ? 'text-green-600' : 'text-red-600'}`}>
                            HTTP {event.responseCode}
                          </span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {(event.status === 'failed' || event.status === 'retrying') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(event.id)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}