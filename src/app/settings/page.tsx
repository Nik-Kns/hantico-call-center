'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Search,
  Calendar,
  Download,
  ChevronRight,
  Clock,
  Server,
  Zap,
  HardDrive,
  Users
} from 'lucide-react'

type SystemType = 'asterisk' | 'erp_api' | 'internal_api' | 'queue' | 'auth' | 'storage'
type EventClass = 'connectivity' | 'auth_permission' | 'timeout_ratelimit' | 'validation_schema' | 'request_response' | 'mapping_integration' | 'other_unexpected'

interface ErrorGroup {
  id: string
  system: SystemType
  systemName: string
  lastErrorTime: string
  totalEvents: number
  uniqueCodes: number
  isActive: boolean
  incidents: ErrorIncident[]
}

interface ErrorIncident {
  id: string
  timestamp: string
  eventClass: EventClass
  errorCode: string
  message: string
  companyId?: string
  details: any
}

const systemInfo: Record<SystemType, { name: string; icon: any; color: string }> = {
  asterisk: { name: 'Asterisk (телефония)', icon: Zap, color: 'bg-purple-100 text-purple-800' },
  erp_api: { name: 'ERP API / Hook', icon: Database, color: 'bg-blue-100 text-blue-800' },
  internal_api: { name: 'Внутренний API', icon: Server, color: 'bg-green-100 text-green-800' },
  queue: { name: 'Очередь/шина', icon: Activity, color: 'bg-orange-100 text-orange-800' },
  auth: { name: 'Аутентификация/ключи', icon: Shield, color: 'bg-yellow-100 text-yellow-800' },
  storage: { name: 'Хранилище/файлы', icon: HardDrive, color: 'bg-gray-100 text-gray-800' }
}

const eventClassInfo: Record<EventClass, string> = {
  connectivity: 'Connectivity',
  auth_permission: 'Auth/Permission',
  timeout_ratelimit: 'Timeout/Rate limit',
  validation_schema: 'Validation/Schema',
  request_response: 'Request/Response',
  mapping_integration: 'Mapping/Integration',
  other_unexpected: 'Other/Unexpected'
}

const mockErrorGroups: ErrorGroup[] = [
  {
    id: 'group-1',
    system: 'asterisk',
    systemName: 'Asterisk (телефония)',
    lastErrorTime: '12:43 сегодня',
    totalEvents: 57,
    uniqueCodes: 3,
    isActive: true,
    incidents: [
      {
        id: 'inc-1',
        timestamp: '2025-09-22 12:43:18',
        eventClass: 'connectivity',
        errorCode: 'AST_503',
        message: 'Connection lost to Asterisk server at pbx.yourcompany.com',
        companyId: 'COMP-001',
        details: {
          server: 'pbx.yourcompany.com',
          port: 5038,
          retryCount: 5,
          lastAttempt: '12:43:18'
        }
      },
      {
        id: 'inc-2',
        timestamp: '2025-09-22 12:35:22',
        eventClass: 'timeout_ratelimit',
        errorCode: 'AST_408',
        message: 'Connection timeout after 30 seconds',
        companyId: 'COMP-002',
        details: {
          server: 'pbx.yourcompany.com',
          timeout: 30000,
          attempt: 3
        }
      }
    ]
  },
  {
    id: 'group-2',
    system: 'erp_api',
    systemName: 'ERP API / Hook',
    lastErrorTime: '2025-09-22 14:28',
    totalEvents: 24,
    uniqueCodes: 5,
    isActive: false,
    incidents: [
      {
        id: 'inc-3',
        timestamp: '2025-09-22 14:28:45',
        eventClass: 'auth_permission',
        errorCode: 'ERP_401',
        message: 'API key expired or invalid',
        companyId: 'COMP-003',
        details: {
          endpoint: '/api/v2/auth',
          statusCode: 401,
          apiKeyLastChars: '...a4b2'
        }
      }
    ]
  },
  {
    id: 'group-3',
    system: 'internal_api',
    systemName: 'Внутренний API',
    lastErrorTime: '2025-09-21 23:45',
    totalEvents: 12,
    uniqueCodes: 2,
    isActive: false,
    incidents: [
      {
        id: 'inc-5',
        timestamp: '2025-09-21 23:45:30',
        eventClass: 'request_response',
        errorCode: 'API_500',
        message: 'Internal server error on /api/campaigns/sync',
        details: {
          url: '/api/campaigns/sync',
          statusCode: 500,
          method: 'POST'
        }
      }
    ]
  },
  {
    id: 'group-4',
    system: 'auth',
    systemName: 'Аутентификация/ключи',
    lastErrorTime: '2025-09-22 10:15',
    totalEvents: 8,
    uniqueCodes: 1,
    isActive: true,
    incidents: [
      {
        id: 'inc-6',
        timestamp: '2025-09-22 10:15:00',
        eventClass: 'auth_permission',
        errorCode: 'AUTH_TOKEN_EXPIRED',
        message: 'JWT token has expired',
        companyId: 'COMP-005',
        details: {
          tokenId: 'tok_abc123',
          expiresAt: '2025-09-22 10:00:00',
          userId: 'user_456'
        }
      }
    ]
  }
]

const settingsSections = [
  {
    title: 'Управление пользователями',
    description: 'Настройка доступа и ролей пользователей системы',
    icon: Users,
    href: '/settings/users',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
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
    title: 'Логи ошибок',
    description: 'Негативные события интеграций (хранение 30 дней с автоочисткой)',
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

export default function SettingsPage() {
  const router = useRouter()
  const [errorGroups] = useState<ErrorGroup[]>(mockErrorGroups)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('24h')
  const [searchQuery, setSearchQuery] = useState('')

  const getSystemIcon = (system: SystemType) => {
    const Icon = systemInfo[system].icon
    return <Icon className="h-4 w-4 text-gray-500" />
  }


  const formatLastError = (time: string) => {
    if (time.includes('сегодня')) {
      return time
    }
    const date = new Date(time)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 5) {
      return `${diffMins} мин назад`
    }
    return time
  }

  const filteredGroups = errorGroups.filter(group => {
    if (searchQuery && 
        !group.systemName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })


  const exportData = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const json = JSON.stringify(filteredGroups, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-logs-${new Date().toISOString()}.json`
      a.click()
    } else {
      let csv = 'Группа/Система,Последняя ошибка,Всего событий,Уникальных кодов,Статус\n'
      filteredGroups.forEach(group => {
        csv += `"${group.systemName}","${group.lastErrorTime}",${group.totalEvents},${group.uniqueCodes},"${group.isActive ? 'Идут сейчас' : 'Нет новых'}"\n`
      })
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-logs-${new Date().toISOString()}.csv`
      a.click()
    }
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

      {/* Error Logs Section */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Логи ошибок</CardTitle>
                <CardDescription>
                  Сводка по системам • Хранение 30 дней с автоочисткой
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/settings/notifications')}>
              Все логи
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Bar */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию группы..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="24h">24 часа</SelectItem>
                <SelectItem value="7d">7 дней</SelectItem>
                <SelectItem value="30d">30 дней</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData('json')}>
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
          
          {/* Error Groups Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Группа / Система</TableHead>
                <TableHead>Последняя ошибка</TableHead>
                <TableHead className="text-center">Всего событий</TableHead>
                <TableHead className="text-center">Уникальных кодов</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действие</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow 
                  key={group.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/settings/errors/${group.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getSystemIcon(group.system)}
                      <div>
                        <p className="font-medium">{group.systemName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className={group.isActive ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {formatLastError(group.lastErrorTime)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-lg">{group.totalEvents}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{group.uniqueCodes}</Badge>
                  </TableCell>
                  <TableCell>
                    {group.isActive ? (
                      <div className="flex items-center space-x-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-sm text-red-600 font-medium">Идут сейчас</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Нет новых</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/settings/errors/${group.id}`)
                      }}
                    >
                      Открыть
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
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