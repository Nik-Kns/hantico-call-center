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
  ArrowLeft,
  AlertCircle,
  Search,
  Calendar,
  Download,
  ChevronRight,
  Clock,
  Server,
  Activity,
  Zap,
  Database,
  Shield,
  HardDrive,
  Bell
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
      },
      {
        id: 'inc-4',
        timestamp: '2025-09-22 14:15:30',
        eventClass: 'validation_schema',
        errorCode: 'ERP_422',
        message: 'Schema validation failed for order data',
        companyId: 'COMP-001',
        details: {
          endpoint: '/api/v2/orders',
          field: 'customer_id',
          expected: 'integer',
          received: 'string'
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
  },
  {
    id: 'group-5',
    system: 'storage',
    systemName: 'Хранилище/файлы',
    lastErrorTime: '2025-09-22 09:30',
    totalEvents: 3,
    uniqueCodes: 1,
    isActive: false,
    incidents: [
      {
        id: 'inc-7',
        timestamp: '2025-09-22 09:30:00',
        eventClass: 'other_unexpected',
        errorCode: 'STORAGE_DISK_FULL',
        message: 'Disk space below 5% threshold',
        details: {
          partition: '/var',
          used: '95%',
          available: '2.1GB'
        }
      }
    ]
  },
  {
    id: 'group-6',
    system: 'queue',
    systemName: 'Очередь/шина',
    lastErrorTime: '2025-09-22 11:20',
    totalEvents: 15,
    uniqueCodes: 4,
    isActive: true,
    incidents: [
      {
        id: 'inc-8',
        timestamp: '2025-09-22 11:20:00',
        eventClass: 'mapping_integration',
        errorCode: 'QUEUE_MAPPING_ERROR',
        message: 'Failed to map message to campaign entity',
        companyId: 'COMP-007',
        details: {
          queue: 'campaigns.update',
          messageId: 'msg_789',
          error: 'Campaign ID not found'
        }
      }
    ]
  }
]

export default function ErrorLogsPage() {
  const router = useRouter()
  const [errorGroups] = useState<ErrorGroup[]>(mockErrorGroups)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('24h')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<ErrorGroup | null>(null)
  const [incidentSearch, setIncidentSearch] = useState('')
  const [eventClassFilter, setEventClassFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getSystemIcon = (system: SystemType) => {
    const Icon = systemInfo[system].icon
    return <Icon className="h-4 w-4 text-gray-500" />
  }

  const getSystemBadge = (system: SystemType) => {
    const info = systemInfo[system]
    return <Badge className={info.color}>{info.name}</Badge>
  }

  const getEventClassBadge = (eventClass: EventClass) => {
    return <Badge variant="outline">{eventClassInfo[eventClass]}</Badge>
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

  const filteredIncidents = selectedGroup?.incidents.filter(incident => {
    if (eventClassFilter !== 'all' && incident.eventClass !== eventClassFilter) {
      return false
    }
    if (incidentSearch) {
      const search = incidentSearch.toLowerCase()
      return incident.message.toLowerCase().includes(search) ||
             incident.errorCode.toLowerCase().includes(search) ||
             (incident.companyId && incident.companyId.toLowerCase().includes(search))
    }
    return true
  }) || []

  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage)

  const exportData = (format: 'csv' | 'json') => {
    const dataToExport = selectedGroup ? filteredIncidents : filteredGroups
    
    if (format === 'json') {
      const json = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-logs-${new Date().toISOString()}.json`
      a.click()
    } else {
      let csv = ''
      if (selectedGroup) {
        csv = 'Время,Класс события,Код,Сообщение,ID компании\n'
        filteredIncidents.forEach(incident => {
          csv += `"${incident.timestamp}","${eventClassInfo[incident.eventClass]}","${incident.errorCode}","${incident.message}","${incident.companyId || ''}"\n`
        })
      } else {
        csv = 'Группа/Система,Последняя ошибка,Всего событий,Уникальных кодов,Статус\n'
        filteredGroups.forEach(group => {
          csv += `"${group.systemName}","${group.lastErrorTime}",${group.totalEvents},${group.uniqueCodes},"${group.isActive ? 'Идут сейчас' : 'Нет новых'}"\n`
        })
      }
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
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Bell className="h-8 w-8 mr-3 text-red-600" />
              Логи ошибок и уведомления
            </h1>
            <p className="text-gray-600">
              Мониторинг системных событий • Хранение 30 дней с автоочисткой
            </p>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные ошибки</p>
                <p className="text-2xl font-bold mt-1">
                  {errorGroups.filter(g => g.isActive).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего событий</p>
                <p className="text-2xl font-bold mt-1">
                  {errorGroups.reduce((sum, g) => sum + g.totalEvents, 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Затронуто систем</p>
                <p className="text-2xl font-bold mt-1">{errorGroups.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Уникальных кодов</p>
                <p className="text-2xl font-bold mt-1">
                  {errorGroups.reduce((sum, g) => sum + g.uniqueCodes, 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию системы..."
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
              <Button variant="outline" onClick={() => exportData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => exportData('json')}>
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Основная таблица или детали */}
      {!selectedGroup ? (
        <Card>
          <CardHeader>
            <CardTitle>Группы ошибок по системам</CardTitle>
            <CardDescription>
              Кликните на кнопку &quot;Открыть&quot; для просмотра деталей инцидентов
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  <TableRow key={group.id} className="hover:bg-gray-50">
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
                        onClick={() => {
                          setSelectedGroup(group)
                          setCurrentPage(1)
                          setIncidentSearch('')
                          setEventClassFilter('all')
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
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Детали инцидентов:</span>
                  {getSystemBadge(selectedGroup.system)}
                </CardTitle>
                <CardDescription className="mt-2">
                  Список всех инцидентов в группе с возможностью фильтрации
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedGroup(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад к группам
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по сообщению, коду или ID компании..."
                    value={incidentSearch}
                    onChange={(e) => setIncidentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={eventClassFilter} onValueChange={setEventClassFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Все классы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все классы событий</SelectItem>
                  <SelectItem value="connectivity">Connectivity</SelectItem>
                  <SelectItem value="auth_permission">Auth/Permission</SelectItem>
                  <SelectItem value="timeout_ratelimit">Timeout/Rate limit</SelectItem>
                  <SelectItem value="validation_schema">Validation/Schema</SelectItem>
                  <SelectItem value="request_response">Request/Response</SelectItem>
                  <SelectItem value="mapping_integration">Mapping/Integration</SelectItem>
                  <SelectItem value="other_unexpected">Other/Unexpected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Класс события</TableHead>
                    <TableHead>Код ошибки</TableHead>
                    <TableHead>Сообщение</TableHead>
                    <TableHead>ID компании</TableHead>
                    <TableHead>Детали</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {incident.timestamp}
                      </TableCell>
                      <TableCell>
                        {getEventClassBadge(incident.eventClass)}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {incident.errorCode}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm">{incident.message}</p>
                      </TableCell>
                      <TableCell>
                        {incident.companyId ? (
                          <Badge variant="outline">{incident.companyId}</Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <details className="cursor-pointer">
                          <summary className="text-sm text-blue-600 hover:underline">
                            JSON
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-w-xs">
                            {JSON.stringify(incident.details, null, 2)}
                          </pre>
                        </details>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Показано {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredIncidents.length)} из {filteredIncidents.length}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Назад
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}