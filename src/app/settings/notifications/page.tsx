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
  Bell,
  AlertCircle,
  XCircle,
  RefreshCw,
  Clock,
  Activity,
  Filter,
  Search,
  Calendar,
  History,
  CheckCircle,
  TrendingUp,
  Download,
  Trash2,
  Eye
} from 'lucide-react'

interface NotificationEvent {
  id: string
  timestamp: string
  type: 'error' | 'warning' | 'retry' | 'critical'
  system: 'asterisk' | 'erp' | 'webhook' | 'sip' | 'system'
  title: string
  description: string
  errorCode?: string
  retryCount?: number
  nextRetry?: string
  status: 'active' | 'resolved' | 'ignored'
  affectedCampaigns?: string[]
  impact: 'low' | 'medium' | 'high' | 'critical'
}

const mockNotifications: NotificationEvent[] = [
  {
    id: 'notif-1',
    timestamp: '2025-09-15 15:42:18',
    type: 'critical',
    system: 'asterisk',
    title: 'Полный отказ Asterisk сервера',
    description: 'Сервер pbx.yourcompany.com недоступен. Все активные звонки прерваны.',
    errorCode: 'AST_CONNECTION_LOST',
    status: 'active',
    affectedCampaigns: ['Новогодняя акция', 'VIP клиенты', 'Реактивация'],
    impact: 'critical'
  },
  {
    id: 'notif-2',
    timestamp: '2025-09-15 15:35:22',
    type: 'error',
    system: 'erp',
    title: 'Ошибка аутентификации ERP API',
    description: 'API ключ истек или был отозван. Невозможно передать результаты.',
    errorCode: 'ERR_AUTH_EXPIRED',
    retryCount: 5,
    nextRetry: '16:00:00',
    status: 'active',
    affectedCampaigns: ['Холодная база'],
    impact: 'high'
  },
  {
    id: 'notif-3',
    timestamp: '2025-09-15 15:28:45',
    type: 'warning',
    system: 'webhook',
    title: 'Медленный ответ webhook endpointа',
    description: 'Время ответа превышает 5 секунд. Возможны таймауты.',
    status: 'active',
    affectedCampaigns: ['Обзвон базы'],
    impact: 'medium'
  },
  {
    id: 'notif-4',
    timestamp: '2025-09-15 15:15:12',
    type: 'retry',
    system: 'sip',
    title: 'Превышен лимит одновременных подключений',
    description: 'Достигнут максимум SIP каналов (10/10). Звонки в очереди.',
    retryCount: 3,
    nextRetry: '15:45:00',
    status: 'resolved',
    affectedCampaigns: ['Новогодняя акция'],
    impact: 'medium'
  },
  {
    id: 'notif-5',
    timestamp: '2025-09-15 14:58:30',
    type: 'error',
    system: 'system',
    title: 'Недостаточно места на диске',
    description: 'Свободное место менее 5%. Записи звонков могут не сохраняться.',
    errorCode: 'DISK_SPACE_LOW',
    status: 'resolved',
    impact: 'high'
  }
]

const notificationStats = {
  critical: 1,
  errors: 3,
  warnings: 2,
  retries: 5,
  resolved24h: 8,
  avgResolutionTime: '23 мин'
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationEvent[]>(mockNotifications)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSystem, setFilterSystem] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'retry':
        return <RefreshCw className="h-5 w-5 text-orange-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Критично</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-700">Ошибка</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Предупреждение</Badge>
      case 'retry':
        return <Badge className="bg-orange-100 text-orange-800">Ретрай</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Критично</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Высокий</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Средний</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Низкий</Badge>
      default:
        return <Badge>{impact}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-100 text-red-800">Активно</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Решено</Badge>
      case 'ignored':
        return <Badge className="bg-gray-100 text-gray-800">Игнорируется</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filterType !== 'all' && notification.type !== filterType) return false
    if (filterSystem !== 'all' && notification.system !== filterSystem) return false
    if (filterStatus !== 'all' && notification.status !== filterStatus) return false
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleResolve = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, status: 'resolved' as const } : n
    ))
  }

  const handleIgnore = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, status: 'ignored' as const } : n
    ))
  }

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
            <h1 className="text-3xl font-bold mb-2">Уведомления и ошибки</h1>
            <p className="text-gray-600">
              Мониторинг системных ошибок, ретраев и критических событий
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Экспорт логов
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Последние 24ч
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
                <p className="text-sm text-red-600">Критичные</p>
                <p className="text-2xl font-bold text-red-700">{notificationStats.critical}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Ошибки</p>
                <p className="text-2xl font-bold text-red-600">{notificationStats.errors}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Предупреждения</p>
                <p className="text-2xl font-bold text-yellow-600">{notificationStats.warnings}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Ретраи</p>
                <p className="text-2xl font-bold text-orange-600">{notificationStats.retries}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Решено/24ч</p>
                <p className="text-2xl font-bold text-green-600">{notificationStats.resolved24h}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Ср. время решения</p>
                <p className="text-2xl font-bold text-blue-600">{notificationStats.avgResolutionTime}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Поиск по названию или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type">Тип</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="critical">Критичные</SelectItem>
                  <SelectItem value="error">Ошибки</SelectItem>
                  <SelectItem value="warning">Предупреждения</SelectItem>
                  <SelectItem value="retry">Ретраи</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="system">Система</Label>
              <Select value={filterSystem} onValueChange={setFilterSystem}>
                <SelectTrigger id="system">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все системы</SelectItem>
                  <SelectItem value="asterisk">Asterisk</SelectItem>
                  <SelectItem value="erp">ERP API</SelectItem>
                  <SelectItem value="webhook">Webhooks</SelectItem>
                  <SelectItem value="sip">SIP</SelectItem>
                  <SelectItem value="system">Система</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Статус</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="resolved">Решенные</SelectItem>
                  <SelectItem value="ignored">Игнорируемые</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Применить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Лента уведомлений</CardTitle>
            <div className="flex space-x-2">
              <Badge variant="outline">{filteredNotifications.length} событий</Badge>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить решенные
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Система</TableHead>
                <TableHead>Событие</TableHead>
                <TableHead>Воздействие</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Ретраи</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id} className={notification.status === 'active' ? 'bg-red-50' : ''}>
                  <TableCell className="font-mono text-sm">
                    {notification.timestamp}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(notification.type)}
                      {getTypeBadge(notification.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {notification.system}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                      {notification.errorCode && (
                        <p className="text-xs text-red-600 mt-1 font-mono">
                          Код: {notification.errorCode}
                        </p>
                      )}
                      {notification.affectedCampaigns && notification.affectedCampaigns.length > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Затронуто кампаний: {notification.affectedCampaigns.length}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getImpactBadge(notification.impact)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      {getStatusBadge(notification.status)}
                      {notification.nextRetry && (
                        <span className="text-xs text-gray-500">
                          Повтор: {notification.nextRetry}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {notification.retryCount ? (
                      <div className="flex items-center space-x-1">
                        <RefreshCw className="h-3 w-3 text-orange-500" />
                        <span className="text-sm">{notification.retryCount}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      {notification.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolve(notification.id)}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleIgnore(notification.id)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
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