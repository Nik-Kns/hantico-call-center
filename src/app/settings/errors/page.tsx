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

// Генерация реалистичных временных меток
const getTimestamp = (hoursAgo: number, minutesAgo: number = 0) => {
  const date = new Date()
  date.setHours(date.getHours() - hoursAgo)
  date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

const mockErrorGroups: ErrorGroup[] = [
  // Asterisk errors - последние 30 минут
  {
    id: 'group-1',
    system: 'asterisk',
    systemName: 'Asterisk',
    lastErrorTime: getTimestamp(0, 30),
    totalEvents: 57,
    uniqueCodes: 3,
    isActive: true,
    incidents: [
      {
        id: 'inc-1',
        timestamp: getTimestamp(0, 30),
        eventClass: 'connectivity',
        errorCode: 'AST_503',
        message: 'Service Unavailable: Asterisk manager interface connection lost',
        companyId: 'COMP-001',
        details: {
          server: 'pbx.hantico.ru',
          port: 5038,
          protocol: 'AMI',
          retryCount: 5,
          lastAttempt: getTimestamp(0, 30)
        }
      },
      {
        id: 'inc-2',
        timestamp: getTimestamp(0, 45),
        eventClass: 'timeout_ratelimit',
        errorCode: 'AST_408',
        message: 'Request Timeout: AMI command execution exceeded 30s',
        companyId: 'COMP-002',
        details: {
          command: 'Originate',
          channel: 'SIP/trunk-001',
          timeout: 30000,
          extension: '88005553535'
        }
      },
      {
        id: 'inc-3',
        timestamp: getTimestamp(1, 0),
        eventClass: 'validation_schema',
        errorCode: 'AST_400',
        message: 'Invalid channel format in Originate command',
        companyId: 'COMP-003',
        details: {
          channel: 'SIP/invalid-format',
          error: 'Channel must match pattern: SIP/trunk-XXX/number'
        }
      }
    ]
  },
  
  // Kafka errors - последние 2 часа
  {
    id: 'group-2',
    system: 'kafka',
    systemName: 'Kafka',
    lastErrorTime: getTimestamp(0, 15),
    totalEvents: 89,
    uniqueCodes: 5,
    isActive: true,
    incidents: [
      {
        id: 'inc-4',
        timestamp: getTimestamp(0, 15),
        eventClass: 'connectivity',
        errorCode: 'KAFKA_BROKER_UNREACHABLE',
        message: 'Failed to connect to Kafka broker at kafka-1.hantico.local:9092',
        companyId: 'COMP-004',
        details: {
          broker: 'kafka-1.hantico.local:9092',
          topic: 'tasks-topic',
          partition: 0,
          error: 'java.net.ConnectException: Connection refused'
        }
      },
      {
        id: 'inc-5',
        timestamp: getTimestamp(0, 20),
        eventClass: 'other_unexpected',
        errorCode: 'KAFKA_PRODUCER_ERROR',
        message: 'Producer failed to send message to topic',
        details: {
          topic: 'results-topic',
          messageSize: '2.5MB',
          maxSize: '1MB',
          error: 'MessageSizeTooLargeException'
        }
      },
      {
        id: 'inc-6',
        timestamp: getTimestamp(1, 30),
        eventClass: 'timeout_ratelimit',
        errorCode: 'KAFKA_CONSUMER_LAG',
        message: 'Consumer group lagging behind by 10000 messages',
        details: {
          consumerGroup: 'hantico-dialer-group',
          topic: 'tasks-topic',
          lag: 10000,
          lastOffset: 245678,
          currentOffset: 235678
        }
      }
    ]
  },
  
  // ERP API errors - последние 4 часа
  {
    id: 'group-3',
    system: 'erp_api',
    systemName: 'ERP API',
    lastErrorTime: getTimestamp(2, 0),
    totalEvents: 34,
    uniqueCodes: 4,
    isActive: false,
    incidents: [
      {
        id: 'inc-7',
        timestamp: getTimestamp(2, 0),
        eventClass: 'auth_permission',
        errorCode: 'ERP_401',
        message: 'Unauthorized: Invalid or expired API key for ERP system',
        companyId: 'COMP-005',
        details: {
          endpoint: 'https://erp.company.ru/api/v2/leads',
          method: 'POST',
          statusCode: 401,
          apiKeyLastChars: '...a4b2',
          headers: {
            'X-API-Key': '***hidden***',
            'Content-Type': 'application/json'
          }
        }
      },
      {
        id: 'inc-8',
        timestamp: getTimestamp(3, 0),
        eventClass: 'validation_schema',
        errorCode: 'ERP_422',
        message: 'Validation failed: Required field phone is missing',
        companyId: 'COMP-006',
        details: {
          endpoint: 'https://erp.company.ru/api/v2/leads',
          validationErrors: [
            { field: 'phone', message: 'Required field' },
            { field: 'email', message: 'Invalid format' }
          ]
        }
      },
      {
        id: 'inc-9',
        timestamp: getTimestamp(4, 0),
        eventClass: 'mapping_integration',
        errorCode: 'ERP_MAPPING_ERROR',
        message: 'Failed to map Hantico lead to ERP format',
        details: {
          field: 'customField_123',
          value: 'invalid_enum_value',
          expectedValues: ['new', 'hot', 'cold']
        }
      }
    ]
  },
  
  // AMI errors - последние 6 часов
  {
    id: 'group-4',
    system: 'ami',
    systemName: 'AMI',
    lastErrorTime: getTimestamp(1, 45),
    totalEvents: 23,
    uniqueCodes: 3,
    isActive: true,
    incidents: [
      {
        id: 'inc-10',
        timestamp: getTimestamp(1, 45),
        eventClass: 'connectivity',
        errorCode: 'AMI_CONNECTION_LOST',
        message: 'Lost connection to Asterisk Manager Interface',
        companyId: 'COMP-007',
        details: {
          host: '10.0.1.50',
          port: 5038,
          lastPing: getTimestamp(1, 46),
          reconnectAttempts: 3
        }
      },
      {
        id: 'inc-11',
        timestamp: getTimestamp(3, 0),
        eventClass: 'auth_permission',
        errorCode: 'AMI_AUTH_FAILED',
        message: 'Authentication failed for AMI user',
        details: {
          username: 'hantico_ami',
          reason: 'Invalid secret',
          ip: '10.0.1.50'
        }
      },
      {
        id: 'inc-12',
        timestamp: getTimestamp(6, 0),
        eventClass: 'request_response',
        errorCode: 'AMI_INVALID_ACTION',
        message: 'Invalid AMI action requested',
        details: {
          action: 'InvalidCommand',
          response: 'Error: Invalid/unknown command'
        }
      }
    ]
  },
  
  // REST API errors - последние 8 часов
  {
    id: 'group-5',
    system: 'rest_api',
    systemName: 'REST API',
    lastErrorTime: getTimestamp(3, 30),
    totalEvents: 45,
    uniqueCodes: 4,
    isActive: false,
    incidents: [
      {
        id: 'inc-13',
        timestamp: getTimestamp(3, 30),
        eventClass: 'timeout_ratelimit',
        errorCode: 'REST_429',
        message: 'Rate limit exceeded: Too many requests to /api/campaigns',
        companyId: 'COMP-008',
        details: {
          endpoint: '/api/campaigns',
          limit: 100,
          window: '1 minute',
          currentRate: 145,
          resetTime: getTimestamp(3, 29)
        }
      },
      {
        id: 'inc-14',
        timestamp: getTimestamp(5, 0),
        eventClass: 'request_response',
        errorCode: 'REST_500',
        message: 'Internal Server Error in campaign creation',
        details: {
          endpoint: '/api/campaigns',
          method: 'POST',
          error: 'Database connection timeout',
          trace: 'at CampaignController.create (line 145)'
        }
      },
      {
        id: 'inc-15',
        timestamp: getTimestamp(8, 0),
        eventClass: 'validation_schema',
        errorCode: 'REST_400',
        message: 'Bad Request: Invalid campaign configuration',
        details: {
          validationErrors: [
            'concurrency must be between 1 and 100',
            'scriptId is required'
          ]
        }
      }
    ]
  },
  
  // Internal API errors - последние 12 часов
  {
    id: 'group-6',
    system: 'internal_api',
    systemName: 'Internal API',
    lastErrorTime: getTimestamp(5, 0),
    totalEvents: 18,
    uniqueCodes: 2,
    isActive: false,
    incidents: [
      {
        id: 'inc-16',
        timestamp: getTimestamp(5, 0),
        eventClass: 'request_response',
        errorCode: 'INTERNAL_500',
        message: 'Failed to sync campaign data with dialer',
        details: {
          service: 'CampaignSyncService',
          campaignId: 'camp_789',
          error: 'Connection pool exhausted'
        }
      },
      {
        id: 'inc-17',
        timestamp: getTimestamp(12, 0),
        eventClass: 'other_unexpected',
        errorCode: 'INTERNAL_MEMORY',
        message: 'Memory leak detected in worker process',
        details: {
          process: 'worker-3',
          memoryUsage: '4.2GB',
          limit: '4GB',
          pid: 12345
        }
      }
    ]
  },
  
  // Queue errors - 2 дня назад
  {
    id: 'group-7',
    system: 'queue',
    systemName: 'Queue',
    lastErrorTime: getTimestamp(48, 0),
    totalEvents: 12,
    uniqueCodes: 2,
    isActive: false,
    incidents: [
      {
        id: 'inc-18',
        timestamp: getTimestamp(48, 0),
        eventClass: 'other_unexpected',
        errorCode: 'QUEUE_OVERFLOW',
        message: 'Message queue overflow, dropping messages',
        details: {
          queueName: 'dialer-tasks',
          maxSize: 10000,
          currentSize: 10001,
          droppedMessages: 15
        }
      },
      {
        id: 'inc-19',
        timestamp: getTimestamp(50, 0),
        eventClass: 'connectivity',
        errorCode: 'RABBITMQ_DOWN',
        message: 'RabbitMQ cluster unavailable',
        details: {
          nodes: ['rabbit@node1', 'rabbit@node2'],
          lastSeen: getTimestamp(50, 5)
        }
      }
    ]
  },
  
  // Auth errors - 3 дня назад
  {
    id: 'group-8',
    system: 'auth',
    systemName: 'Auth',
    lastErrorTime: getTimestamp(72, 0),
    totalEvents: 8,
    uniqueCodes: 2,
    isActive: false,
    incidents: [
      {
        id: 'inc-20',
        timestamp: getTimestamp(72, 0),
        eventClass: 'auth_permission',
        errorCode: 'JWT_EXPIRED',
        message: 'JWT token expired for user session',
        companyId: 'COMP-009',
        details: {
          userId: 'user_123',
          tokenId: 'tok_abc456',
          expiresAt: getTimestamp(72, 30),
          issuedAt: getTimestamp(96, 0)
        }
      },
      {
        id: 'inc-21',
        timestamp: getTimestamp(75, 0),
        eventClass: 'auth_permission',
        errorCode: 'PERMISSION_DENIED',
        message: 'User lacks permission to access resource',
        details: {
          userId: 'user_456',
          resource: '/api/admin/users',
          requiredRole: 'admin',
          userRole: 'operator'
        }
      }
    ]
  },
  
  // Storage errors - неделю назад
  {
    id: 'group-9',
    system: 'storage',
    systemName: 'Storage',
    lastErrorTime: getTimestamp(168, 0),
    totalEvents: 5,
    uniqueCodes: 2,
    isActive: false,
    incidents: [
      {
        id: 'inc-22',
        timestamp: getTimestamp(168, 0),
        eventClass: 'other_unexpected',
        errorCode: 'STORAGE_FULL',
        message: 'Storage volume reached 95% capacity',
        details: {
          volume: '/var/recordings',
          totalSize: '500GB',
          usedSize: '475GB',
          freeSpace: '25GB'
        }
      },
      {
        id: 'inc-23',
        timestamp: getTimestamp(170, 0),
        eventClass: 'request_response',
        errorCode: 'S3_UPLOAD_FAILED',
        message: 'Failed to upload recording to S3',
        details: {
          bucket: 'hantico-recordings',
          key: 'recordings/2024/09/call_12345.mp3',
          error: 'RequestTimeout',
          size: '15MB'
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
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Логи ошибок</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => exportData('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт логов (CSV)
            </Button>
            <Button 
              variant="outline"
              onClick={() => exportData('json')}
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт логов (JSON)
            </Button>
          </div>
        </div>
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
          <div className="mb-6">
            {/* Main filters row */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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