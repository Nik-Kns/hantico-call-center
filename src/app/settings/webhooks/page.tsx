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
  Calendar,
  Package,
  Phone,
  Database,
  Download,
  Info
} from 'lucide-react'

interface WebhookEvent {
  id: string
  timestamp: string
  type: 'numbers_received' | 'call_started' | 'call_status' | 'result_saved' | 'result_retrieved'
  status: 'delivered' | 'failed' | 'pending' | 'retrying'
  campaign: string
  endpoint: string
  payload: any
  attempts: number
  nextRetry?: string
  responseCode?: number
  responseTime?: number
  error?: string
  priority: 'high' | 'medium' | 'low'
  retryPolicy?: 'exponential' | 'linear' | 'none'
}

const mockEvents: WebhookEvent[] = [
  {
    id: 'evt_1',
    timestamp: '2025-09-15 11:03:45',
    type: 'result_retrieved',
    status: 'delivered',
    campaign: 'Новогодняя кампания',
    endpoint: 'https://crm.company.ru/api/results',
    payload: { 
      batchId: 'batch_789', 
      resultsCount: 150, 
      clientId: 'client_123',
      format: 'json',
      downloadUrl: 'https://storage/results/batch_789.json'
    },
    attempts: 1,
    responseCode: 200,
    responseTime: 89,
    priority: 'high',
    retryPolicy: 'exponential'
  },
  {
    id: 'evt_2',
    timestamp: '2025-09-15 11:02:30',
    type: 'result_saved',
    status: 'delivered',
    campaign: 'Реактивация клиентов',
    endpoint: 'https://storage.company.ru/webhook',
    payload: {
      leadId: 'LEAD-001234',
      result: 'success',
      duration: 180,
      recordingUrl: 'https://storage/recordings/rec_456.mp3',
      transcriptUrl: 'https://storage/transcripts/trans_456.txt',
      abVariant: 'A'
    },
    attempts: 1,
    responseCode: 200,
    responseTime: 145,
    priority: 'medium',
    retryPolicy: 'linear'
  },
  {
    id: 'evt_3',
    timestamp: '2025-09-15 11:01:15',
    type: 'call_status',
    status: 'failed',
    campaign: 'Обзвон базы',
    endpoint: 'https://crm.company.ru/webhook/status',
    payload: {
      leadId: 'LEAD-001235',
      callId: 'call_789',
      status: 'no_answer',
      attempts: 3,
      nextRetryAt: '2025-09-15T12:00:00Z'
    },
    attempts: 2,
    nextRetry: '11:05:00',
    error: 'Connection timeout',
    priority: 'medium',
    retryPolicy: 'exponential'
  },
  {
    id: 'evt_4',
    timestamp: '2025-09-15 11:00:00',
    type: 'call_started',
    status: 'delivered',
    campaign: 'VIP сегмент',
    endpoint: 'https://crm.company.ru/webhook/calls',
    payload: {
      leadId: 'LEAD-001236',
      phone: '+7900XXXXXXX',
      agentId: 'agent_anna',
      abVariant: 'B',
      startTime: '2025-09-15T11:00:00Z',
      campaignId: 'camp_001'
    },
    attempts: 1,
    responseCode: 200,
    responseTime: 67,
    priority: 'high',
    retryPolicy: 'linear'
  },
  {
    id: 'evt_5',
    timestamp: '2025-09-15 10:58:30',
    type: 'numbers_received',
    status: 'delivered',
    campaign: 'Холодная база',
    endpoint: 'https://queue.company.ru/webhook/numbers',
    payload: {
      batchId: 'batch_456',
      numbersCount: 1250,
      source: 'external_provider',
      validationStatus: 'completed',
      duplicatesRemoved: 45,
      blacklistFiltered: 12
    },
    attempts: 1,
    responseCode: 200,
    responseTime: 234,
    priority: 'low',
    retryPolicy: 'none'
  }
]

const stats = {
  campaignsSent: 45,      // Выслано кампаний на обзвон
  callsMade: 12456,       // Совершено звонков
  connected: 8934,        // Дозвоны
  notConnected: 3522,     // Недозвоны
  answered: 7850,         // Дозвонившихся (успешные разговоры)
  dataSaved: 7623,        // Данные сохранены
  resultRetrieved: 7401   // Забрали результат к себе в ERP
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
      case 'numbers_received': return 'Получен пакет номеров'
      case 'call_started': return 'Начат звонок'
      case 'call_status': return 'Статус дозвона'
      case 'result_saved': return 'Сохранён результат'
      case 'result_retrieved': return 'Клиент забрал результат'
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

      {/* Event Types Documentation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Событийная модель системы
          </CardTitle>
          <CardDescription>
            Формализованные события жизненного цикла обзвона и их структура
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium">Получен пакет номеров</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">numbers_received</p>
              <p className="text-xs text-gray-500">
                Триггер: Загрузка новой базы номеров в систему. 
                Содержит информацию о количестве, валидации и фильтрации.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Phone className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium">Начат звонок</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">call_started</p>
              <p className="text-xs text-gray-500">
                Триггер: Инициация исходящего звонка. 
                Содержит ID контакта, агента, A/B вариант.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Activity className="h-5 w-5 text-orange-600 mr-2" />
                <h4 className="font-medium">Статус дозвона</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">call_status</p>
              <p className="text-xs text-gray-500">
                Триггер: Изменение статуса звонка (отвечен, занято, не отвечает). 
                Включает информацию о повторных попытках.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Database className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-medium">Сохранён результат</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">result_saved</p>
              <p className="text-xs text-gray-500">
                Триггер: Завершение обработки звонка и сохранение результата. 
                Содержит запись, транскрипт, метрики.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Download className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="font-medium">Клиент забрал результат</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">result_retrieved</p>
              <p className="text-xs text-gray-500">
                Триггер: Скачивание результатов клиентом через API или интерфейс. 
                Отслеживает потребление данных.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Выслано кампаний</p>
                <p className="text-2xl font-bold">{stats.campaignsSent.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">на обзвон</p>
              </div>
              <Send className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Совершено звонков</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.callsMade.toLocaleString()}</p>
              </div>
              <Phone className="h-8 w-8 text-indigo-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Дозвоны / Недозвоны</p>
                <p className="text-lg font-bold text-green-600">{stats.connected.toLocaleString()} / <span className="text-red-600">{stats.notConnected.toLocaleString()}</span></p>
              </div>
              <Activity className="h-8 w-8 text-gray-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Дозвонившихся</p>
                <p className="text-2xl font-bold text-green-600">{stats.answered.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">успешные разговоры</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Данные сохранены</p>
                <p className="text-2xl font-bold text-purple-600">{stats.dataSaved.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Забрали в ERP</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.resultRetrieved.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">результаты</p>
              </div>
              <Download className="h-8 w-8 text-emerald-600 opacity-60" />
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
                  <SelectItem value="numbers_received">Получен пакет номеров</SelectItem>
                  <SelectItem value="call_started">Начат звонок</SelectItem>
                  <SelectItem value="call_status">Статус дозвона</SelectItem>
                  <SelectItem value="result_saved">Сохранён результат</SelectItem>
                  <SelectItem value="result_retrieved">Клиент забрал результат</SelectItem>
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