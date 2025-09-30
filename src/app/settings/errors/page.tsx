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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  ArrowLeft,
  Bell,
  Search,
  Calendar,
  Download,
  ChevronRight,
  Clock,
  Server,
  Activity,
  Shield,
  Database,
  HardDrive,
  Zap,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Filter,
  X,
  Wifi,
  Cloud
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type SystemType = 'asterisk' | 'erp_api' | 'internal_api' | 'queue' | 'auth' | 'storage' | 'kafka' | 'rest_api' | 'ami'
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
  asterisk: { name: 'Asterisk', icon: Zap, color: 'bg-purple-100 text-purple-800' },
  erp_api: { name: 'ERP API', icon: Database, color: 'bg-blue-100 text-blue-800' },
  internal_api: { name: 'Internal API', icon: Server, color: 'bg-green-100 text-green-800' },
  queue: { name: 'Queue', icon: Activity, color: 'bg-orange-100 text-orange-800' },
  auth: { name: 'Auth', icon: Shield, color: 'bg-yellow-100 text-yellow-800' },
  storage: { name: 'Storage', icon: HardDrive, color: 'bg-gray-100 text-gray-800' },
  kafka: { name: 'Kafka', icon: Cloud, color: 'bg-indigo-100 text-indigo-800' },
  rest_api: { name: 'REST API', icon: Wifi, color: 'bg-teal-100 text-teal-800' },
  ami: { name: 'AMI', icon: Activity, color: 'bg-pink-100 text-pink-800' }
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
    systemName: 'Asterisk',
    lastErrorTime: '2025-09-22 12:43',
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
    systemName: 'ERP API',
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
    systemName: 'Internal API',
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
    systemName: 'Auth',
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
    system: 'kafka',
    systemName: 'Kafka',
    lastErrorTime: '2025-09-22 15:30',
    totalEvents: 42,
    uniqueCodes: 4,
    isActive: true,
    incidents: [
      {
        id: 'inc-7',
        timestamp: '2025-09-22 15:30:00',
        eventClass: 'connectivity',
        errorCode: 'KAFKA_BROKER_DOWN',
        message: 'Broker not available',
        companyId: 'COMP-006',
        details: {
          broker: 'kafka-broker-1:9092',
          topic: 'tasks-topic'
        }
      }
    ]
  },
  {
    id: 'group-6',
    system: 'rest_api',
    systemName: 'REST API',
    lastErrorTime: '2025-09-22 11:20',
    totalEvents: 15,
    uniqueCodes: 2,
    isActive: false,
    incidents: [
      {
        id: 'inc-8',
        timestamp: '2025-09-22 11:20:00',
        eventClass: 'timeout_ratelimit',
        errorCode: 'REST_429',
        message: 'Too many requests',
        details: {
          endpoint: '/api/v1/leads',
          limit: 100,
          window: '1m'
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
  const [selectedSystems, setSelectedSystems] = useState<SystemType[]>([])
  const [selectedErrorTypes, setSelectedErrorTypes] = useState<EventClass[]>([])
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [showCustomDate, setShowCustomDate] = useState(false)

  const getSystemIcon = (system: SystemType) => {
    const Icon = systemInfo[system].icon
    return <Icon className="h-4 w-4 text-gray-500" />
  }

  const formatLastError = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 5) {
      return `${diffMins} мин назад`
    } else if (diffHours < 1) {
      return `${diffMins} мин назад`
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`
    } else if (diffDays < 7) {
      return `${diffDays} д назад`
    }
    return date.toLocaleDateString('ru-RU')
  }

  const isWithinPeriod = (time: string): boolean => {
    const date = new Date(time)
    const now = new Date()
    
    if (showCustomDate && customDateRange.from && customDateRange.to) {
      const from = new Date(customDateRange.from)
      const to = new Date(customDateRange.to)
      to.setHours(23, 59, 59, 999)
      return date >= from && date <= to
    }
    
    switch (selectedPeriod) {
      case '1h':
        return now.getTime() - date.getTime() <= 3600000
      case '24h':
        return now.getTime() - date.getTime() <= 86400000
      case '7d':
        return now.getTime() - date.getTime() <= 604800000
      case '30d':
        return now.getTime() - date.getTime() <= 2592000000
      case 'custom':
        return true
      default:
        return true
    }
  }

  const toggleSystem = (system: SystemType) => {
    setSelectedSystems(prev => 
      prev.includes(system) 
        ? prev.filter(s => s !== system)
        : [...prev, system]
    )
  }

  const toggleErrorType = (errorType: EventClass) => {
    setSelectedErrorTypes(prev => 
      prev.includes(errorType)
        ? prev.filter(e => e !== errorType)
        : [...prev, errorType]
    )
  }

  const clearFilters = () => {
    setSelectedSystems([])
    setSelectedErrorTypes([])
    setSearchQuery('')
    setSelectedPeriod('24h')
    setShowCustomDate(false)
    setCustomDateRange({ from: '', to: '' })
  }

  const filteredGroups = errorGroups.filter(group => {
    // Filter by search query
    if (searchQuery && 
        !group.systemName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !group.incidents.some(inc => 
          inc.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inc.errorCode.toLowerCase().includes(searchQuery.toLowerCase())
        )) {
      return false
    }
    
    // Filter by system
    if (selectedSystems.length > 0 && !selectedSystems.includes(group.system)) {
      return false
    }
    
    // Filter by error type
    if (selectedErrorTypes.length > 0 && 
        !group.incidents.some(inc => selectedErrorTypes.includes(inc.eventClass))) {
      return false
    }
    
    // Filter by time period
    if (!isWithinPeriod(group.lastErrorTime)) {
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

  // Подсчет статистики
  const totalErrors = errorGroups.reduce((sum, group) => sum + group.totalEvents, 0)
  const activeGroups = errorGroups.filter(group => group.isActive).length
  const affectedSystems = new Set(errorGroups.map(group => group.system)).size

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
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
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold">Логи ошибок</h1>
            </div>
            <p className="text-gray-600">
              Негативные события интеграций • Хранение 30 дней с автоочисткой
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные ошибки</p>
                <p className="text-2xl font-bold text-red-600">{activeGroups}</p>
                <p className="text-xs text-gray-500 mt-1">Требуют внимания</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего событий</p>
                <p className="text-2xl font-bold">{totalErrors}</p>
                <p className="text-xs text-gray-500 mt-1">За последние 24 часа</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Затронуто систем</p>
                <p className="text-2xl font-bold">{affectedSystems}</p>
                <p className="text-xs text-gray-500 mt-1">Из 6 возможных</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Server className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Статус системы</p>
                <p className="text-2xl font-bold text-green-600">98.5%</p>
                <p className="text-xs text-gray-500 mt-1">Uptime</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Группы ошибок по системам</CardTitle>
              <CardDescription className="mt-1">
                Кликните на группу для просмотра детальной информации
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {filteredGroups.length} групп
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Bar */}
          <div className="space-y-4 mb-6">
            {/* Main filters row */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по системе, коду ошибки или сообщению..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              {/* Period selector */}
              <Select 
                value={showCustomDate ? 'custom' : selectedPeriod} 
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setShowCustomDate(true)
                    setSelectedPeriod(value)
                  } else {
                    setShowCustomDate(false)
                    setSelectedPeriod(value)
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Последний час</SelectItem>
                  <SelectItem value="24h">24 часа</SelectItem>
                  <SelectItem value="7d">7 дней</SelectItem>
                  <SelectItem value="30d">30 дней</SelectItem>
                  <SelectItem value="custom">Выбрать период...</SelectItem>
                </SelectContent>
              </Select>
              
              {/* System filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Система
                    {selectedSystems.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedSystems.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Выберите системы</Label>
                    <Separator />
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {Object.entries(systemInfo).map(([key, info]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`system-${key}`}
                            checked={selectedSystems.includes(key as SystemType)}
                            onChange={() => toggleSystem(key as SystemType)}
                            className="h-4 w-4"
                          />
                          <label 
                            htmlFor={`system-${key}`} 
                            className="flex items-center space-x-2 cursor-pointer flex-1"
                          >
                            <info.icon className="h-4 w-4" />
                            <span className="text-sm">{info.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedSystems.length > 0 && (
                      <>
                        <Separator />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedSystems([])}
                        >
                          Очистить
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Error type filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Тип ошибки
                    {selectedErrorTypes.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedErrorTypes.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Выберите типы ошибок</Label>
                    <Separator />
                    <div className="space-y-2">
                      {Object.entries(eventClassInfo).map(([key, name]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`error-${key}`}
                            checked={selectedErrorTypes.includes(key as EventClass)}
                            onChange={() => toggleErrorType(key as EventClass)}
                            className="h-4 w-4"
                          />
                          <label 
                            htmlFor={`error-${key}`} 
                            className="text-sm cursor-pointer flex-1"
                          >
                            {name}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedErrorTypes.length > 0 && (
                      <>
                        <Separator />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedErrorTypes([])}
                        >
                          Очистить
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Export buttons */}
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
            
            {/* Custom date range (shown when custom is selected) */}
            {showCustomDate && (
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <Label className="text-sm">Период:</Label>
                <Input
                  type="date"
                  value={customDateRange.from}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-40"
                />
                <span className="text-sm">—</span>
                <Input
                  type="date"
                  value={customDateRange.to}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-40"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowCustomDate(false)
                    setSelectedPeriod('24h')
                    setCustomDateRange({ from: '', to: '' })
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Active filters display */}
            {(selectedSystems.length > 0 || selectedErrorTypes.length > 0 || searchQuery) && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">Активные фильтры:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedSystems.map(system => (
                    <Badge key={system} variant="secondary" className="text-xs">
                      {systemInfo[system].name}
                      <button
                        onClick={() => toggleSystem(system)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedErrorTypes.map(type => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {eventClassInfo[type]}
                      <button
                        onClick={() => toggleErrorType(type)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">
                      Поиск: {searchQuery}
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={clearFilters}
                >
                  Очистить все
                </Button>
              </div>
            )}
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

          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Нет ошибок для отображения</p>
              <p className="text-sm text-gray-400 mt-2">
                Попробуйте изменить фильтры или период времени
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Информация о логировании</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Автоматическая очистка</p>
                <p className="text-xs text-gray-500">Логи старше 30 дней удаляются автоматически</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Безопасность данных</p>
                <p className="text-xs text-gray-500">Чувствительная информация автоматически маскируется</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Activity className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Мониторинг в реальном времени</p>
                <p className="text-xs text-gray-500">Критические ошибки отслеживаются моментально</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}