'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
  FileCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Shield,
  FileText,
  User,
  Clock,
  Eye
} from 'lucide-react'

interface ConsentRecord {
  id: string
  phone: string
  name: string
  consentSms: boolean
  consentCall: boolean
  consentData: boolean
  scriptVersion: string
  offertaVersion: string
  timestamp: string
  campaign: string
  source: 'call' | 'sms' | 'web' | 'import'
  ipAddress?: string
  userAgent?: string
}

const mockConsents: ConsentRecord[] = [
  {
    id: 'cns_1',
    phone: '+7 (900) 123-45-67',
    name: 'Иванов Иван Иванович',
    consentSms: true,
    consentCall: true,
    consentData: true,
    scriptVersion: 'v2.1',
    offertaVersion: 'Оферта от 01.01.2024',
    timestamp: '2024-01-09 10:45:23',
    campaign: 'Новогодняя кампания',
    source: 'call',
    ipAddress: '192.168.1.1'
  },
  {
    id: 'cns_2',
    phone: '+7 (900) 234-56-78',
    name: 'Петрова Мария Сергеевна',
    consentSms: true,
    consentCall: false,
    consentData: true,
    scriptVersion: 'v2.1',
    offertaVersion: 'Оферта от 01.01.2024',
    timestamp: '2024-01-09 09:30:15',
    campaign: 'Реактивация клиентов',
    source: 'sms',
    ipAddress: '10.0.0.5'
  },
  {
    id: 'cns_3',
    phone: '+7 (900) 345-67-89',
    name: 'Сидоров Алексей Петрович',
    consentSms: false,
    consentCall: true,
    consentData: true,
    scriptVersion: 'v1.9',
    offertaVersion: 'Оферта от 15.12.2023',
    timestamp: '2024-01-08 18:20:00',
    campaign: 'Обзвон базы',
    source: 'call'
  },
  {
    id: 'cns_4',
    phone: '+7 (900) 456-78-90',
    name: 'Козлова Елена Викторовна',
    consentSms: true,
    consentCall: true,
    consentData: true,
    scriptVersion: 'v2.1',
    offertaVersion: 'Оферта от 01.01.2024',
    timestamp: '2024-01-08 14:15:30',
    campaign: 'VIP сегмент',
    source: 'web',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: 'cns_5',
    phone: '+7 (900) 567-89-01',
    name: 'Новиков Дмитрий Андреевич',
    consentSms: false,
    consentCall: false,
    consentData: false,
    scriptVersion: 'v2.0',
    offertaVersion: 'Оферта от 01.01.2024',
    timestamp: '2024-01-08 11:00:00',
    campaign: 'Холодные звонки',
    source: 'call'
  }
]

const stats = {
  total: 12456,
  withSmsConsent: 8934,
  withCallConsent: 10234,
  withDataConsent: 11890,
  todayAdded: 234
}

export default function ConsentPage() {
  const router = useRouter()
  const [consents, setConsents] = useState<ConsentRecord[]>(mockConsents)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterConsent, setFilterConsent] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [selectedConsents, setSelectedConsents] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedConsents(consents.map(c => c.id))
    } else {
      setSelectedConsents([])
    }
  }

  const handleSelectConsent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedConsents([...selectedConsents, id])
    } else {
      setSelectedConsents(selectedConsents.filter(cId => cId !== id))
    }
  }

  const getConsentBadges = (consent: ConsentRecord) => {
    return (
      <div className="flex space-x-1">
        {consent.consentSms && (
          <Badge className="bg-green-100 text-green-800 text-xs">SMS</Badge>
        )}
        {consent.consentCall && (
          <Badge className="bg-blue-100 text-blue-800 text-xs">Звонки</Badge>
        )}
        {consent.consentData && (
          <Badge className="bg-purple-100 text-purple-800 text-xs">Данные</Badge>
        )}
        {!consent.consentSms && !consent.consentCall && !consent.consentData && (
          <Badge className="bg-gray-100 text-gray-800 text-xs">Нет согласий</Badge>
        )}
      </div>
    )
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'call':
        return <Badge variant="outline" className="text-xs"><User className="h-3 w-3 mr-1" />Звонок</Badge>
      case 'sms':
        return <Badge variant="outline" className="text-xs"><FileText className="h-3 w-3 mr-1" />SMS</Badge>
      case 'web':
        return <Badge variant="outline" className="text-xs"><Shield className="h-3 w-3 mr-1" />Web</Badge>
      case 'import':
        return <Badge variant="outline" className="text-xs"><Upload className="h-3 w-3 mr-1" />Импорт</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{source}</Badge>
    }
  }

  const filteredConsents = consents.filter(consent => {
    if (searchQuery && !consent.phone.includes(searchQuery) && !consent.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filterConsent === 'with_sms' && !consent.consentSms) return false
    if (filterConsent === 'without_sms' && consent.consentSms) return false
    if (filterConsent === 'no_consent' && (consent.consentSms || consent.consentCall || consent.consentData)) return false
    if (filterSource !== 'all' && consent.source !== filterSource) return false
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
            <h1 className="text-3xl font-bold mb-2">Реестр согласий</h1>
            <p className="text-gray-600">
              Управление согласиями на обработку данных и коммуникации
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего записей</p>
                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SMS согласия</p>
                <p className="text-2xl font-bold text-green-600">{stats.withSmsConsent.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{Math.round(stats.withSmsConsent / stats.total * 100)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Звонки</p>
                <p className="text-2xl font-bold text-blue-600">{stats.withCallConsent.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{Math.round(stats.withCallConsent / stats.total * 100)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Данные</p>
                <p className="text-2xl font-bold text-purple-600">{stats.withDataConsent.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{Math.round(stats.withDataConsent / stats.total * 100)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Сегодня</p>
                <p className="text-2xl font-bold">+{stats.todayAdded}</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-600 opacity-60" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Телефон или имя..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="consent-filter">Согласия</Label>
              <Select value={filterConsent} onValueChange={setFilterConsent}>
                <SelectTrigger id="consent-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все записи</SelectItem>
                  <SelectItem value="with_sms">Есть SMS согласие</SelectItem>
                  <SelectItem value="without_sms">Нет SMS согласия</SelectItem>
                  <SelectItem value="no_consent">Нет согласий</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="source-filter">Источник</Label>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger id="source-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все источники</SelectItem>
                  <SelectItem value="call">Звонок</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="web">Web форма</SelectItem>
                  <SelectItem value="import">Импорт</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Записи согласий</CardTitle>
            <div className="flex items-center space-x-2">
              {selectedConsents.length > 0 && (
                <>
                  <Badge variant="outline">{selectedConsents.length} выбрано</Badge>
                  <Button variant="outline" size="sm">
                    Экспортировать выбранные
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedConsents.length === filteredConsents.length && filteredConsents.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Согласия</TableHead>
                <TableHead>Версии документов</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Кампания</TableHead>
                <TableHead>Дата и время</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsents.map((consent) => (
                <TableRow key={consent.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedConsents.includes(consent.id)}
                      onCheckedChange={(checked) => handleSelectConsent(consent.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-mono">{consent.phone}</TableCell>
                  <TableCell>{consent.name}</TableCell>
                  <TableCell>{getConsentBadges(consent)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">Скрипт: {consent.scriptVersion}</div>
                      <div className="text-xs text-gray-600">{consent.offertaVersion}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getSourceIcon(consent.source)}</TableCell>
                  <TableCell>{consent.campaign}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{consent.timestamp}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
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