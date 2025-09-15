'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Plug,
  Webhook,
  Settings,
  Activity,
  Shield,
  CheckSquare,
  Database,
  Bell,
  AlertCircle,
  XCircle,
  RefreshCw,
  Clock,
  Filter,
  Search,
  Calendar,
  Download,
  Trash2,
  Eye,
  CheckCircle
} from 'lucide-react'

const settingsSections = [
  {
    title: 'Хаб интеграций',
    description: 'Подключение к ERP/CRM системам, телефонии и SMS-провайдерам',
    icon: Plug,
    href: '/settings/integrations',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Центр вебхуков и событий',
    description: 'Мониторинг исходящих статусов звонков и событий системы',
    icon: Webhook,
    href: '/settings/webhooks',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Уведомления и ошибки',
    description: 'Мониторинг ошибок, ретраев и критических событий с таймлайном',
    icon: Bell,
    href: '/settings/notifications',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
]

const quickStats = [
  { label: 'Активные интеграции', value: '5', icon: Activity, color: 'text-green-600' },
  { label: 'События за сегодня', value: '1,234', icon: Webhook, color: 'text-blue-600' },
  { label: 'Передано ID в ERP', value: '892', icon: Shield, color: 'text-red-600' },
  { label: 'Задач в очереди', value: '23', icon: CheckSquare, color: 'text-orange-600' }
]

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
    affectedCampaigns: ['Новогодняя акция', 'VIP клиенты'],
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

export default function SettingsPage() {
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
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="h-8 w-8 text-gray-700" />
          <h1 className="text-3xl font-bold">Настройки и интеграции</h1>
        </div>
        <p className="text-gray-600">
          Управление подключениями, согласиями и настройками системы
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => router.push(section.href)}
          >
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-3`}>
                <section.icon className={`h-6 w-6 ${section.color}`} />
              </div>
              <CardTitle className="group-hover:text-blue-600 transition-colors">
                {section.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {section.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* System Health */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-600" />
              <CardTitle>Состояние системы</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">Все системы работают</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">API Gateway</span>
              <span className="text-sm font-medium text-green-600">Активен</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Webhook Processor</span>
              <span className="text-sm font-medium text-green-600">Активен</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">SMS Gateway</span>
              <span className="text-sm font-medium text-green-600">Активен</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Уведомления и ошибки</CardTitle>
                <CardDescription>
                  Мониторинг системных ошибок и критических событий
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/settings/notifications')}>
                Все уведомления
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Фильтры:</span>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="critical">Критичные</SelectItem>
                <SelectItem value="error">Ошибки</SelectItem>
                <SelectItem value="warning">Предупреждения</SelectItem>
                <SelectItem value="retry">Ретраи</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSystem} onValueChange={setFilterSystem}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Все системы" />
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
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="resolved">Решенные</SelectItem>
                <SelectItem value="ignored">Игнорируемые</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {/* Notifications Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Система</TableHead>
                <TableHead>Событие</TableHead>
                <TableHead>Воздействие</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.slice(0, 5).map((notification) => (
                <TableRow key={notification.id} className={notification.status === 'active' ? 'bg-red-50' : ''}>
                  <TableCell className="font-mono text-sm">
                    {notification.timestamp.split(' ')[1]}
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
                      <p className="text-xs text-gray-600 mt-1 max-w-xs truncate">{notification.description}</p>
                      {notification.errorCode && (
                        <p className="text-xs text-red-600 mt-1 font-mono">
                          {notification.errorCode}
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
          
          {filteredNotifications.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => router.push('/settings/notifications')}>
                Показать все {filteredNotifications.length} уведомлений
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}