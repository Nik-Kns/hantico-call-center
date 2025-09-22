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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  AlertCircle,
  Search,
  Calendar,
  Download,
  ChevronRight,
  Clock,
  Server,
  RefreshCw
} from 'lucide-react'

interface ErrorGroup {
  id: string
  group: string
  system: 'asterisk' | 'erp' | 'webhook' | 'sip' | 'system'
  lastError: string
  errorCount: number
  incidents: ErrorIncident[]
}

interface ErrorIncident {
  id: string
  timestamp: string
  type: string
  errorCode: string
  message: string
  companyId?: string
  details: any
}

const mockErrorGroups: ErrorGroup[] = [
  {
    id: 'group-1',
    group: 'Asterisk Connection',
    system: 'asterisk',
    lastError: '2025-09-22 15:42:18',
    errorCount: 24,
    incidents: [
      {
        id: 'inc-1',
        timestamp: '2025-09-22 15:42:18',
        type: 'CONNECTION_LOST',
        errorCode: 'AST_503',
        message: 'Failed to connect to Asterisk server at pbx.yourcompany.com',
        companyId: 'COMP-001',
        details: {
          server: 'pbx.yourcompany.com',
          port: 5038,
          retryCount: 5,
          lastAttempt: '15:42:18'
        }
      },
      {
        id: 'inc-2',
        timestamp: '2025-09-22 15:35:22',
        type: 'CONNECTION_TIMEOUT',
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
    group: 'ERP API Authentication',
    system: 'erp',
    lastError: '2025-09-22 14:28:45',
    errorCount: 12,
    incidents: [
      {
        id: 'inc-3',
        timestamp: '2025-09-22 14:28:45',
        type: 'AUTH_FAILED',
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
    group: 'Webhook Timeout',
    system: 'webhook',
    lastError: '2025-09-22 13:15:30',
    errorCount: 8,
    incidents: [
      {
        id: 'inc-4',
        timestamp: '2025-09-22 13:15:30',
        type: 'RESPONSE_TIMEOUT',
        errorCode: 'WH_TIMEOUT',
        message: 'Webhook endpoint did not respond within 10 seconds',
        companyId: 'COMP-001',
        details: {
          url: 'https://client.com/webhook/calls',
          timeout: 10000,
          method: 'POST'
        }
      }
    ]
  },
  {
    id: 'group-4',
    group: 'SIP Registration',
    system: 'sip',
    lastError: '2025-09-22 12:45:15',
    errorCount: 5,
    incidents: [
      {
        id: 'inc-5',
        timestamp: '2025-09-22 12:45:15',
        type: 'REGISTRATION_FAILED',
        errorCode: 'SIP_403',
        message: 'SIP registration rejected - invalid credentials',
        details: {
          sipUser: '1001',
          domain: 'pbx.yourcompany.com',
          transport: 'UDP'
        }
      }
    ]
  },
  {
    id: 'group-5',
    group: 'System Resources',
    system: 'system',
    lastError: '2025-09-22 11:30:00',
    errorCount: 3,
    incidents: [
      {
        id: 'inc-6',
        timestamp: '2025-09-22 11:30:00',
        type: 'DISK_SPACE_LOW',
        errorCode: 'SYS_DISK',
        message: 'Disk space below 5% threshold',
        details: {
          partition: '/var',
          used: '95%',
          available: '2.1GB'
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getSystemBadge = (system: string) => {
    const colors: Record<string, string> = {
      asterisk: 'bg-purple-100 text-purple-800',
      erp: 'bg-blue-100 text-blue-800',
      webhook: 'bg-green-100 text-green-800',
      sip: 'bg-orange-100 text-orange-800',
      system: 'bg-gray-100 text-gray-800'
    }
    return <Badge className={colors[system] || 'bg-gray-100 text-gray-800'}>{system.toUpperCase()}</Badge>
  }

  const filteredGroups = errorGroups.filter(group => {
    if (searchQuery && !group.group.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !group.system.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const getErrorCountForPeriod = (group: ErrorGroup) => {
    const now = new Date()
    const periodMs = {
      'today': 24 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }[selectedPeriod] || 24 * 60 * 60 * 1000

    return group.errorCount
  }

  const filteredIncidents = selectedGroup?.incidents.filter(incident => {
    if (incidentSearch) {
      const search = incidentSearch.toLowerCase()
      return incident.message.toLowerCase().includes(search) ||
             incident.errorCode.toLowerCase().includes(search) ||
             incident.type.toLowerCase().includes(search) ||
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
        csv = 'Time,Type/Code,Message,Company ID\n'
        filteredIncidents.forEach(incident => {
          csv += `"${incident.timestamp}","${incident.type}/${incident.errorCode}","${incident.message}","${incident.companyId || ''}"\n`
        })
      } else {
        csv = 'Group/System,Last Error,Count for Period\n'
        filteredGroups.forEach(group => {
          csv += `"${group.group}/${group.system}","${group.lastError}",${getErrorCountForPeriod(group)}\n`
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
            <h1 className="text-3xl font-bold mb-2">Логи ошибок</h1>
            <p className="text-gray-600">
              Негативные события интеграций (хранение 30 дней с автоочисткой)
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по группе или системе..."
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

      <Card>
        <CardHeader>
          <CardTitle>Группы ошибок</CardTitle>
          <CardDescription>
            Кликните на группу для просмотра деталей инцидентов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Группа / Система</TableHead>
                <TableHead>Последняя ошибка</TableHead>
                <TableHead>Количество за период</TableHead>
                <TableHead className="text-right">Открыть</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow 
                  key={group.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedGroup(group)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">{group.group}</p>
                        <div className="mt-1">
                          {getSystemBadge(group.system)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">{group.lastError}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="font-semibold text-red-600">
                        {getErrorCountForPeriod(group)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedGroup?.group}</span>
              {selectedGroup && getSystemBadge(selectedGroup.system)}
            </DialogTitle>
            <DialogDescription>
              Детали инцидентов группы
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-4 my-4">
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
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Время</TableHead>
                  <TableHead>Тип / Код</TableHead>
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
                      <div>
                        <p className="font-medium text-sm">{incident.type}</p>
                        <p className="text-xs text-gray-500">{incident.errorCode}</p>
                      </div>
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
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
        </DialogContent>
      </Dialog>
    </div>
  )
}