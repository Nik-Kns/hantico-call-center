'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  Download,
  Search,
  Clock,
  AlertCircle,
  Server,
  Activity,
  Shield,
  Database,
  HardDrive,
  Zap,
  RefreshCw,
  Filter,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

type SystemType = 'asterisk' | 'erp_api' | 'internal_api' | 'queue' | 'auth' | 'storage'
type EventClass = 'connectivity' | 'auth_permission' | 'timeout_ratelimit' | 'validation_schema' | 'request_response' | 'mapping_integration' | 'other_unexpected'

interface ErrorIncident {
  id: string
  timestamp: string
  eventClass: EventClass
  errorCode: string
  message: string
  companyId?: string
  details: any
  stackTrace?: string[]
  affectedUsers?: number
  resolution?: string
}

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

const systemInfo: Record<SystemType, { name: string; icon: any; color: string }> = {
  asterisk: { name: 'Asterisk (телефония)', icon: Zap, color: 'bg-purple-100 text-purple-800' },
  erp_api: { name: 'ERP API / Hook', icon: Database, color: 'bg-blue-100 text-blue-800' },
  internal_api: { name: 'Внутренний API', icon: Server, color: 'bg-green-100 text-green-800' },
  queue: { name: 'Очередь/шина', icon: Activity, color: 'bg-orange-100 text-orange-800' },
  auth: { name: 'Аутентификация/ключи', icon: Shield, color: 'bg-yellow-100 text-yellow-800' },
  storage: { name: 'Хранилище/файлы', icon: HardDrive, color: 'bg-gray-100 text-gray-800' }
}

const eventClassInfo: Record<EventClass, { name: string; color: string }> = {
  connectivity: { name: 'Connectivity', color: 'bg-red-100 text-red-800' },
  auth_permission: { name: 'Auth/Permission', color: 'bg-yellow-100 text-yellow-800' },
  timeout_ratelimit: { name: 'Timeout/Rate limit', color: 'bg-orange-100 text-orange-800' },
  validation_schema: { name: 'Validation/Schema', color: 'bg-purple-100 text-purple-800' },
  request_response: { name: 'Request/Response', color: 'bg-blue-100 text-blue-800' },
  mapping_integration: { name: 'Mapping/Integration', color: 'bg-green-100 text-green-800' },
  other_unexpected: { name: 'Other/Unexpected', color: 'bg-gray-100 text-gray-800' }
}

// Mock data - в реальном приложении будет загружаться с сервера
const mockErrorGroups: Record<string, ErrorGroup> = {
  'group-1': {
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
          lastAttempt: '12:43:18',
          protocol: 'AMI',
          version: '13.0'
        },
        stackTrace: [
          'at AsteriskManager.connect (asterisk-manager.js:145)',
          'at ConnectionPool.getConnection (connection-pool.js:78)',
          'at CallHandler.initiateCall (call-handler.js:234)',
          'at async processCallQueue (queue-processor.js:56)'
        ],
        affectedUsers: 15,
        resolution: 'Автоматический реконнект через 30 секунд'
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
        },
        affectedUsers: 8
      },
      {
        id: 'inc-3',
        timestamp: '2025-09-22 12:30:15',
        eventClass: 'connectivity',
        errorCode: 'AST_502',
        message: 'Bad Gateway response from Asterisk server',
        companyId: 'COMP-001',
        details: {
          server: 'pbx.yourcompany.com',
          statusCode: 502,
          response: 'Service temporarily unavailable'
        },
        affectedUsers: 23
      }
    ]
  },
  'group-2': {
    id: 'group-2',
    system: 'erp_api',
    systemName: 'ERP API / Hook',
    lastErrorTime: '2025-09-22 14:28',
    totalEvents: 24,
    uniqueCodes: 5,
    isActive: false,
    incidents: [
      {
        id: 'inc-4',
        timestamp: '2025-09-22 14:28:45',
        eventClass: 'auth_permission',
        errorCode: 'ERP_401',
        message: 'API key expired or invalid',
        companyId: 'COMP-003',
        details: {
          endpoint: '/api/v2/auth',
          statusCode: 401,
          apiKeyLastChars: '...a4b2',
          headers: {
            'X-API-Version': '2.0',
            'Content-Type': 'application/json'
          }
        },
        resolution: 'Требуется обновление API ключа в настройках интеграции'
      }
    ]
  },
  'group-3': {
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
          method: 'POST',
          requestBody: {
            campaignId: 'camp_123',
            action: 'sync'
          }
        }
      }
    ]
  },
  'group-4': {
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
          userId: 'user_456',
          scopes: ['read', 'write']
        }
      }
    ]
  }
}

export default function ErrorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [errorGroup, setErrorGroup] = useState<ErrorGroup | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [eventClassFilter, setEventClassFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedIncidents, setExpandedIncidents] = useState<Set<string>>(new Set())
  const [autoRefresh, setAutoRefresh] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    // Загрузка данных группы ошибок
    const groupId = params.id as string
    if (mockErrorGroups[groupId]) {
      setErrorGroup(mockErrorGroups[groupId])
    } else {
      // Если группа не найдена, перенаправляем обратно
      router.push('/settings')
    }
  }, [params.id, router])

  useEffect(() => {
    if (autoRefresh && errorGroup) {
      const interval = setInterval(() => {
        // В реальном приложении здесь будет запрос к API
        console.log('Refreshing data...')
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, errorGroup])

  if (!errorGroup) {
    return null
  }

  const SystemIcon = systemInfo[errorGroup.system].icon

  const filteredIncidents = errorGroup.incidents.filter(incident => {
    if (eventClassFilter !== 'all' && incident.eventClass !== eventClassFilter) {
      return false
    }
    if (searchQuery) {
      const search = searchQuery.toLowerCase()
      return incident.message.toLowerCase().includes(search) ||
             incident.errorCode.toLowerCase().includes(search) ||
             (incident.companyId && incident.companyId.toLowerCase().includes(search))
    }
    return true
  })

  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage)

  const toggleIncidentExpansion = (incidentId: string) => {
    const newExpanded = new Set(expandedIncidents)
    if (newExpanded.has(incidentId)) {
      newExpanded.delete(incidentId)
    } else {
      newExpanded.add(incidentId)
    }
    setExpandedIncidents(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportData = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const json = JSON.stringify(filteredIncidents, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-group-${errorGroup.id}-${new Date().toISOString()}.json`
      a.click()
    } else {
      let csv = 'Время,Класс события,Код,Сообщение,ID компании,Затронуто пользователей\n'
      filteredIncidents.forEach(incident => {
        csv += `"${incident.timestamp}","${eventClassInfo[incident.eventClass].name}","${incident.errorCode}","${incident.message}","${incident.companyId || ''}","${incident.affectedUsers || ''}"\n`
      })
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-group-${errorGroup.id}-${new Date().toISOString()}.csv`
      a.click()
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/settings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к настройкам
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-lg ${systemInfo[errorGroup.system].color} flex items-center justify-center`}>
              <SystemIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{errorGroup.systemName}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>ID группы: {errorGroup.id}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Последняя ошибка: {errorGroup.lastErrorTime}
                </span>
                {errorGroup.isActive && (
                  <>
                    <span>•</span>
                    <span className="flex items-center text-red-600 font-medium">
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      Активная группа
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Остановить' : 'Автообновление'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportData('json')}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего событий</p>
                <p className="text-2xl font-bold">{errorGroup.totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Уникальных кодов</p>
                <p className="text-2xl font-bold">{errorGroup.uniqueCodes}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Затронуто пользователей</p>
                <p className="text-2xl font-bold">
                  {errorGroup.incidents.reduce((sum, inc) => sum + (inc.affectedUsers || 0), 0)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Частота ошибок</p>
                <p className="text-2xl font-bold">
                  {(errorGroup.totalEvents / 24).toFixed(1)}/час
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Детальная информация об инцидентах</CardTitle>
            <Badge variant="secondary">
              {filteredIncidents.length} инцидентов
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по сообщению, коду или ID компании..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={eventClassFilter} onValueChange={setEventClassFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Все классы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все классы событий</SelectItem>
                {Object.entries(eventClassInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${info.color}`}>
                      {info.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Incidents Table */}
          <div className="space-y-4">
            {paginatedIncidents.map((incident) => (
              <div key={incident.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleIncidentExpansion(incident.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={eventClassInfo[incident.eventClass].color}>
                          {eventClassInfo[incident.eventClass].name}
                        </Badge>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {incident.errorCode}
                        </code>
                        {incident.companyId && (
                          <Badge variant="outline">{incident.companyId}</Badge>
                        )}
                        <span className="text-sm text-gray-500">{incident.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-800">{incident.message}</p>
                      {incident.affectedUsers && (
                        <p className="text-xs text-gray-500 mt-1">
                          Затронуто пользователей: {incident.affectedUsers}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedIncidents.has(incident.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {expandedIncidents.has(incident.id) && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Details */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center justify-between">
                          Детали
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(JSON.stringify(incident.details, null, 2))
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </h4>
                        <pre className="p-3 bg-white rounded border text-xs overflow-auto max-h-64">
                          {JSON.stringify(incident.details, null, 2)}
                        </pre>
                      </div>
                      
                      {/* Stack Trace / Resolution */}
                      <div>
                        {incident.stackTrace && (
                          <>
                            <h4 className="font-medium mb-2">Stack Trace</h4>
                            <div className="p-3 bg-white rounded border text-xs overflow-auto max-h-64">
                              {incident.stackTrace.map((line, idx) => (
                                <div key={idx} className="font-mono text-gray-600">
                                  {line}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        
                        {incident.resolution && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2 text-green-700">Решение</h4>
                            <p className="text-sm bg-green-50 p-3 rounded border border-green-200">
                              {incident.resolution}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
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
    </div>
  )
}