'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Play,
  Pause,
  Square,
  Copy,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Users,
  Download,
  FileText,
  Volume2,
  AlertTriangle,
  Check,
  Link2,
  UserCheck,
  PhoneOff,
  Bot,
  Calendar,
  Filter,
  FileDown,
  GitBranch
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { maskPhoneNumber } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BaseType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { DateFilter } from '@/components/ui/date-filter'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CompanyDetails {
  id: string
  companyId: string
  name: string
  baseType: BaseType
  status: 'active' | 'paused' | 'completed' | 'draft'
  agent: string
  voice: string
  // Метрики передачи в ERP
  totalReceived: number  // Сколько контактов передано ERP
  totalProcessed: number  // Сколько обработано
  totalInProgress: number  // Сколько в работе
  // Декомпозиция обработанных
  successfulTransferred: number  // Успешно передано
  refusals: number  // Отказы
  noAnswers: number  // Недозвоны
  voicemails: number  // Автоответчики (человек)
  robotVoicemails: number  // Автоответчики (роботы)
  progress: number
  historicalConversion: number  // Историческая результативность
  startTime?: Date
  endTime?: Date
}

interface CallRecord {
  id: string
  leadId: string  // ID контакта вместо номера
  dateTime: Date
  result: 'success' | 'refused' | 'no_answer' | 'voicemail' | 'robot_voicemail' | 'busy'
  category: string  // Категория результата
  duration: number
  hasTransferred: boolean
  hasLinkClick: boolean
  hasRegistration: boolean
  transferredToErp: boolean  // Флаг "передано в ERP/B24"
  hasRecording: boolean
  hasTranscript: boolean
  abVariant?: 'A' | 'B'  // Вариант A/B теста
}

// Моковые данные
const mockCompanyDetails: { [key: string]: CompanyDetails } = {
  'obz-1': {
    id: 'obz-1',
    companyId: 'CMP-1A2B3C4D',
    name: 'Новогодняя акция 2025',
    baseType: 'registration' as BaseType,
    status: 'active',
    agent: 'Анна',
    voice: 'Женский дружелюбный',
    totalReceived: 2500,
    totalProcessed: 1847,
    totalInProgress: 653,
    successfulTransferred: 1234,
    refusals: 312,
    noAnswers: 189,
    voicemails: 71,
    robotVoicemails: 41,
    progress: 73.88,
    historicalConversion: 68.4,
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  'obz-2': {
    id: 'obz-2',
    companyId: 'CMP-5E6F7G8H',
    name: 'Реактивация клиентов',
    baseType: 'reactivation' as BaseType,
    status: 'paused',
    agent: 'Михаил',
    voice: 'Мужской деловой',
    totalReceived: 1800,
    totalProcessed: 456,
    totalInProgress: 1344,
    successfulTransferred: 234,
    refusals: 89,
    noAnswers: 78,
    voicemails: 35,
    robotVoicemails: 20,
    progress: 25.33,
    historicalConversion: 51.3,
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  'obz-3': {
    id: 'obz-3',
    companyId: 'CMP-9I0J1K2L',
    name: 'Холодная база январь',
    baseType: 'no_answer' as BaseType,
    status: 'completed',
    agent: 'Елена',
    voice: 'Женский энергичный',
    totalReceived: 850,
    totalProcessed: 850,
    totalInProgress: 0,
    successfulTransferred: 445,
    refusals: 178,
    noAnswers: 156,
    voicemails: 51,
    robotVoicemails: 20,
    progress: 100,
    historicalConversion: 52.4,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }
}

const mockCallRecords: CallRecord[] = [
  {
    id: 'call-1',
    leadId: 'LEAD-001234',
    dateTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    result: 'success',
    category: 'Передано успешно',
    duration: 245,
    hasTransferred: true,
    hasLinkClick: true,
    hasRegistration: true,
    transferredToErp: true,
    hasRecording: true,
    hasTranscript: true,
    abVariant: 'A'
  },
  {
    id: 'call-2',
    leadId: 'LEAD-002345',
    dateTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    result: 'refused',
    category: 'Отказ',
    duration: 89,
    hasTransferred: false,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: false,
    hasRecording: true,
    hasTranscript: true,
    abVariant: 'B'
  },
  {
    id: 'call-3',
    leadId: 'LEAD-003456',
    dateTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    result: 'voicemail',
    category: 'Автоответчик',
    duration: 15,
    hasTransferred: false,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: false,
    hasRecording: false,
    hasTranscript: false,
    abVariant: 'A'
  },
  {
    id: 'call-6',
    leadId: 'LEAD-004567',
    dateTime: new Date(Date.now() - 7 * 60 * 60 * 1000),
    result: 'robot_voicemail',
    category: 'Робот-автоответчик',
    duration: 5,
    hasTransferred: false,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: false,
    hasRecording: false,
    hasTranscript: false,
    abVariant: 'B'
  },
  {
    id: 'call-4',
    leadId: 'LEAD-005678',
    dateTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    result: 'no_answer',
    category: 'Недозвон',
    duration: 0,
    hasTransferred: false,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: false,
    hasRecording: false,
    hasTranscript: false,
    abVariant: 'A'
  },
  {
    id: 'call-5',
    leadId: 'LEAD-006789',
    dateTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    result: 'success',
    category: 'Передано успешно',
    duration: 312,
    hasTransferred: true,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: true,
    hasRecording: true,
    hasTranscript: true,
    abVariant: 'B'
  }
]

export default function CompanyDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  
  const [company, setCompany] = useState<CompanyDetails | null>(
    mockCompanyDetails[companyId] || null
  )
  const [callRecords] = useState<CallRecord[]>(mockCallRecords)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  // Единый период для всей страницы
  const [globalPeriod, setGlobalPeriod] = useState('all')
  const [globalIntervalStart, setGlobalIntervalStart] = useState('')
  const [globalIntervalEnd, setGlobalIntervalEnd] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [resultFilter, setResultFilter] = useState('all')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportPeriod, setExportPeriod] = useState('today')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  
  // Состояния для графика
  const [selectedMetric, setSelectedMetric] = useState<'success' | 'refusal' | 'noAnswer' | 'voicemail' | 'robot'>('success')
  const [isAbTest, setIsAbTest] = useState(false) // Мок для A/B теста

  const handleCompanyAction = async (action: 'start' | 'pause' | 'stop') => {
    if (!company) return
    
    setIsLoading(true)
    setTimeout(() => {
      setCompany(prev => prev ? {
        ...prev,
        status: action === 'start' ? 'active' : action === 'pause' ? 'paused' : 'completed'
      } : null)
      setIsLoading(false)
    }, 1000)
  }

  const handleCopyCompanyId = () => {
    if (company) {
      navigator.clipboard.writeText(company.companyId)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активна</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Пауза</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Завершена</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Черновик</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getResultBadge = (result: string, category: string) => {
    switch (result) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">{category}</Badge>
      case 'refused':
        return <Badge className="bg-red-100 text-red-800">{category}</Badge>
      case 'no_answer':
        return <Badge className="bg-gray-100 text-gray-800">{category}</Badge>
      case 'voicemail':
        return <Badge className="bg-purple-100 text-purple-800">{category}</Badge>
      case 'robot_voicemail':
        return <Badge className="bg-indigo-100 text-indigo-800">{category}</Badge>
      case 'busy':
        return <Badge className="bg-orange-100 text-orange-800">Занято</Badge>
      default:
        return <Badge>{category}</Badge>
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleExport = () => {
    // Фильтруем данные по периоду и статусам
    const filteredData = callRecords.filter(call => {
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(call.result)) {
        return false
      }
      // Здесь бы была логика фильтрации по периоду
      return true
    })

    // Создаем CSV строку БЕЗ номеров телефонов
    const csvHeader = 'lead_id,call_id,datetime,result,category,duration_seconds,has_transferred,has_link_click,has_registration,transferred_to_erp\n'
    const csvRows = filteredData.map(call => 
      `${call.leadId},${call.id},${call.dateTime.toISOString()},${call.result},${call.category},${call.duration},${call.hasTransferred},${call.hasLinkClick},${call.hasRegistration},${call.transferredToErp}`
    ).join('\n')
    
    const csvContent = csvHeader + csvRows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `campaign_${company?.id}_calls_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setShowExportModal(false)
    setSelectedStatuses([])
  }

  const statusOptions = [
    { value: 'success', label: 'Успешные' },
    { value: 'refused', label: 'Отказы' },
    { value: 'no_answer', label: 'Недозвоны' },
    { value: 'voicemail', label: 'Автоответчики' },
    { value: 'robot_voicemail', label: 'Роботы' },
    { value: 'busy', label: 'Занято' }
  ]

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">Компания не найдена</h2>
              <p className="text-gray-600 mb-4">
                Компания с ID &quot;{companyId}&quot; не существует или была удалена.
              </p>
              <Button onClick={() => router.push('/companies')}>
                Вернуться к списку
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {company.name}
            </h1>
            <p className="text-gray-600">
              Карточка компании и результаты обзвона
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge(company.status)}
          
          <Button 
            variant="outline"
            onClick={() => router.push(`/companies/${company.id}/ab-tests`)}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            A/B тесты
          </Button>
          
          <div className="flex space-x-2">
            {company.status === 'draft' && (
              <Button 
                onClick={() => handleCompanyAction('start')}
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                Запустить
              </Button>
            )}
            {company.status === 'active' && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => handleCompanyAction('pause')}
                  disabled={isLoading}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Пауза
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleCompanyAction('stop')}
                  disabled={isLoading}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Завершить
                </Button>
              </>
            )}
            {company.status === 'paused' && (
              <>
                <Button 
                  onClick={() => handleCompanyAction('start')}
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Продолжить
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleCompanyAction('stop')}
                  disabled={isLoading}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Завершить
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Верхняя информационная панель - расширенный хедер */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Статус</p>
              <div className="flex items-center space-x-2">
                {getStatusBadge(company.status)}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Тип базы</p>
              <Badge className={
                company.baseType === 'registration' ? 'bg-blue-100 text-blue-800' :
                company.baseType === 'no_answer' ? 'bg-yellow-100 text-yellow-800' :
                company.baseType === 'refusals' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }>
                {company.baseType === 'registration' ? 'Регистрация' :
                 company.baseType === 'no_answer' ? 'Недозвон' :
                 company.baseType === 'refusals' ? 'Отказники' :
                 'Отклики/реактивация'}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Агент</p>
              <div className="flex items-center">
                <Bot className="h-4 w-4 text-gray-400 mr-2" />
                <span className="font-medium">{company.agent}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Историческая результативность</p>
              <div className="flex items-center">
                <span className="text-xl font-bold text-green-600">{company.historicalConversion}%</span>
                <span className="text-xs text-gray-500 ml-2">успешных звонков за все время</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Company ID</p>
              <div className="flex items-center space-x-2">
                <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {company.companyId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCompanyId}
                >
                  {isCopied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Прогресс</p>
              <div className="flex items-center space-x-2">
                <Progress value={company.progress} className="flex-1" />
                <span className="text-sm font-medium">{company.progress}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Основные метрики с учетом периода */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Статистика за период</CardTitle>
            <DateFilter
              value={globalPeriod}
              onValueChange={setGlobalPeriod}
              intervalStart={globalIntervalStart}
              intervalEnd={globalIntervalEnd}
              onIntervalChange={(start, end) => {
                setGlobalIntervalStart(start)
                setGlobalIntervalEnd(end)
              }}
              label=""
              className="w-[180px]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Всего принято</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {company.totalReceived.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      контактов от ERP
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-gray-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Обработано</p>
                <p className="text-2xl font-bold text-blue-600">
                  {company.totalProcessed.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((company.totalProcessed / company.totalReceived) * 100)}% от принятых
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В работе</p>
                <p className="text-2xl font-bold text-orange-600">
                  {company.totalInProgress.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((company.totalInProgress / company.totalReceived) * 100)}% от принятых
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {company.baseType === 'registration' ? 'Регистрации' :
                   company.baseType === 'no_answer' ? 'Дозвоны' :
                   company.baseType === 'refusals' ? 'Переубеждения' :
                   'Реактивации'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {company.successfulTransferred.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((company.successfulTransferred / company.totalProcessed) * 100)}% конверсия
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
          </div>
        </CardContent>
      </Card>

      {/* График динамики метрик */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Динамика метрик</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Процент от обзвоненных контактов
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Чекбокс A/B теста */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ab-test"
                  checked={isAbTest}
                  onCheckedChange={(checked) => setIsAbTest(checked as boolean)}
                />
                <Label htmlFor="ab-test" className="text-sm cursor-pointer">
                  A/B тест
                </Label>
              </div>
              
              {/* Переключатель метрик */}
              <div className="flex items-center space-x-2">
                <Label className="text-sm">Метрика:</Label>
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={selectedMetric === 'success' ? 'default' : 'ghost'}
                    onClick={() => setSelectedMetric('success')}
                    className={selectedMetric === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    Успех
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedMetric === 'refusal' ? 'default' : 'ghost'}
                    onClick={() => setSelectedMetric('refusal')}
                    className={selectedMetric === 'refusal' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    Отказ
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedMetric === 'noAnswer' ? 'default' : 'ghost'}
                    onClick={() => setSelectedMetric('noAnswer')}
                    className={selectedMetric === 'noAnswer' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                  >
                    Недозвон
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedMetric === 'voicemail' ? 'default' : 'ghost'}
                    onClick={() => setSelectedMetric('voicemail')}
                    className={selectedMetric === 'voicemail' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                  >
                    Автоответчик
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedMetric === 'robot' ? 'default' : 'ghost'}
                    onClick={() => setSelectedMetric('robot')}
                    className={selectedMetric === 'robot' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                  >
                    Робот
                  </Button>
                </div>
              </div>
              
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* График динамики */}
          <div className="space-y-4">
            {/* Легенда для A/B теста */}
            {isAbTest && (
              <div className="flex items-center justify-end space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span>Σ (сумма)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span>Агент A</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                  <span>Агент B</span>
                </div>
              </div>
            )}
            
            {/* Область графика */}
            <div className="bg-gray-50 rounded-lg p-6">
              {/* График всегда линейный с улучшенным масштабированием */}
              <div className="relative h-64">
                  {/* Линейный график с синхронизацией периода */}
                  <div className="absolute inset-0 flex flex-col">
                    {/* Сетка Y-оси */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[100, 75, 50, 25, 0].map((value) => (
                        <div key={value} className="flex items-center">
                          <span className="text-xs text-gray-400 -ml-10 w-8 text-right">{value}%</span>
                          <div className="flex-1 border-b border-gray-200 ml-2"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* SVG с графиком */}
                    <svg className="absolute inset-0 w-full h-full" style={{ marginLeft: '0px' }}>
                      {isAbTest ? (
                        /* A/B тест - 3 линии */
                        <>
                          {/* Линия общая (синяя) */}
                          <polyline
                            points="10,35 90,30 170,33 250,28 330,31 410,26 490,29 570,24 650,27 730,22 810,25 890,20"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                          />
                          
                          {/* Линия Агент A (зеленая) */}
                          <polyline
                            points="10,40 90,33 170,37 250,31 330,34 410,29 490,32 570,27 650,30 730,26 810,28 890,25"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                          />
                          
                          {/* Линия Агент B (оранжевая) */}
                          <polyline
                            points="10,32 90,25 170,29 250,23 330,26 410,21 490,24 570,19 650,22 730,18 810,20 890,17"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="3"
                          />
                        </>
                      ) : (
                        /* Обычный режим - одна линия */
                        <polyline
                          points="10,35 90,30 170,33 250,28 330,31 410,26 490,29 570,24 650,27 730,22 810,25 890,20"
                          fill="none"
                          stroke={
                            selectedMetric === 'success' ? '#10b981' :
                            selectedMetric === 'refusal' ? '#ef4444' :
                            selectedMetric === 'noAnswer' ? '#6b7280' :
                            selectedMetric === 'voicemail' ? '#a855f7' :
                            '#6366f1'
                          }
                          strokeWidth="3"
                        />
                      )}
                    </svg>
                  </div>
                
                {/* Горизонтальные линии сетки */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[100, 75, 50, 25, 0].map((value) => (
                    <div key={value} className="flex items-center">
                      <span className="text-xs text-gray-400 -ml-10 w-8 text-right">{value}%</span>
                      <div className="flex-1 border-b border-gray-200 ml-2"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Ось X - динамическая в зависимости от периода */}
              <div className="flex justify-between mt-4 px-2 text-xs text-gray-500">
                {globalPeriod === 'today' ? (
                  ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].map(time => (
                    <span key={time}>{time}</span>
                  ))
                ) : globalPeriod === 'week' ? (
                  ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
                    <span key={i}>{day}</span>
                  ))
                ) : globalPeriod === 'month' ? (
                  ['1', '5', '10', '15', '20', '25', '30'].map(day => (
                    <span key={day}>{day}</span>
                  ))
                ) : (
                  ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'].map((month, i) => (
                    <span key={i}>{month}</span>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Показатель A/B теста */}
          {isAbTest && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">A/B тест активен</p>
              <p className="text-xs text-blue-700 mt-1">
                Агент A: конверсия {company.successfulTransferred ? Math.round((company.successfulTransferred / company.totalProcessed) * 100 * 0.95) : 0}% | 
                Агент B: конверсия {company.successfulTransferred ? Math.round((company.successfulTransferred / company.totalProcessed) * 100 * 1.05) : 0}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Мониторинг/декомпозиция обработанных контактов по исходам */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Мониторинг обработанных контактов по исходам</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Всего обработано: {company.totalProcessed.toLocaleString()} контактов
              </p>
            </div>
            {isAbTest && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span>Агент A</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                  <span>Агент B</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Передано</Badge>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {company.successfulTransferred.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Успешно передано</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((company.successfulTransferred / company.totalProcessed) * 100)}% от обработанных
              </p>
              {isAbTest && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">A: {Math.round(company.successfulTransferred * 0.48).toLocaleString()}</span>
                    <span className="text-orange-700">B: {Math.round(company.successfulTransferred * 0.52).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {company.refusals.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Отказы</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((company.refusals / company.totalProcessed) * 100)}% от обработанных
              </p>
              {isAbTest && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">A: {Math.round(company.refusals * 0.55).toLocaleString()}</span>
                    <span className="text-orange-700">B: {Math.round(company.refusals * 0.45).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <PhoneOff className="h-5 w-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-600">
                {company.noAnswers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Недозвоны</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((company.noAnswers / company.totalProcessed) * 100)}% от обработанных
              </p>
              {isAbTest && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">A: {Math.round(company.noAnswers * 0.51).toLocaleString()}</span>
                    <span className="text-orange-700">B: {Math.round(company.noAnswers * 0.49).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Volume2 className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {company.voicemails.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Автоответчики</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((company.voicemails / company.totalProcessed) * 100)}% от обработанных
              </p>
              {isAbTest && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">A: {Math.round(company.voicemails * 0.47).toLocaleString()}</span>
                    <span className="text-orange-700">B: {Math.round(company.voicemails * 0.53).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <Bot className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-600">
                {company.robotVoicemails.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Роботы</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((company.robotVoicemails / company.totalProcessed) * 100)}% от обработанных
              </p>
              {isAbTest && (
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">A: {Math.round(company.robotVoicemails * 0.50).toLocaleString()}</span>
                    <span className="text-orange-700">B: {Math.round(company.robotVoicemails * 0.50).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Единая таблица звонков */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Таблица звонков</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="result-filter" className="text-sm">Статус:</Label>
                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger id="result-filter" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все результаты</SelectItem>
                    <SelectItem value="success">Передано успешно</SelectItem>
                    <SelectItem value="refused">Отказ</SelectItem>
                    <SelectItem value="no_answer">Недозвон</SelectItem>
                    <SelectItem value="voicemail">Автоответчик</SelectItem>
                    <SelectItem value="robot_voicemail">Робот-автоответчик</SelectItem>
                    <SelectItem value="busy">Занято</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                placeholder="Поиск по Lead ID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-48"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowExportModal(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID контакта
                  </th>
                  {isAbTest && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      A/B
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Дата/время
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Результат
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Длительность
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Флаги
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {callRecords
                  .filter((call) => {
                    // Фильтр по статусу результата
                    if (resultFilter !== 'all' && call.result !== resultFilter) {
                      return false
                    }
                    // Фильтр по поиску Lead ID
                    if (searchFilter && !call.leadId.toLowerCase().includes(searchFilter.toLowerCase())) {
                      return false
                    }
                    return true
                  })
                  .map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-mono text-sm font-medium text-blue-600">{call.leadId}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 p-0"
                          onClick={() => navigator.clipboard.writeText(call.leadId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    {isAbTest && (
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <Badge 
                          className={call.abVariant === 'A' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                          }
                        >
                          {call.abVariant || 'A'}
                        </Badge>
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        <div className="flex items-center text-gray-900">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {call.dateTime.toLocaleDateString('ru-RU')}
                        </div>
                        <div className="flex items-center text-gray-500 text-xs">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {call.dateTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getResultBadge(call.result, call.category)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {call.duration > 0 ? formatDuration(call.duration) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        {call.hasTransferred && (
                          <div className="group relative">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Успешно передано
                            </span>
                          </div>
                        )}
                        {call.hasLinkClick && (
                          <div className="group relative">
                            <Link2 className="h-4 w-4 text-green-600" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Переход по ссылке
                            </span>
                          </div>
                        )}
                        {call.hasRegistration && (
                          <div className="group relative">
                            <UserCheck className="h-4 w-4 text-purple-600" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Регистрация
                            </span>
                          </div>
                        )}
                        {call.transferredToErp && (
                          <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                            ERP
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {call.hasRecording && (
                          <Button size="sm" variant="ghost" title="Прослушать">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                        {call.hasTranscript && (
                          <Button size="sm" variant="ghost" title="Транскрипт">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" title="Экспорт">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Модальное окно экспорта */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileDown className="h-5 w-5 mr-2" />
              Экспорт таблицы звонков
            </DialogTitle>
            <DialogDescription>
              Настройте параметры экспорта данных в CSV
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="export-period">Период</Label>
              <Select value={exportPeriod} onValueChange={setExportPeriod}>
                <SelectTrigger id="export-period" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="yesterday">Вчера</SelectItem>
                  <SelectItem value="week">Последняя неделя</SelectItem>
                  <SelectItem value="month">Последний месяц</SelectItem>
                  <SelectItem value="all">Все время</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Фильтр по статусам</Label>
              <p className="text-xs text-gray-500 mb-3">Выберите статусы для экспорта (если ничего не выбрано - экспортируются все)</p>
              <div className="space-y-2 mt-2">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={status.value}
                      checked={selectedStatuses.includes(status.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStatuses([...selectedStatuses, status.value])
                        } else {
                          setSelectedStatuses(selectedStatuses.filter(s => s !== status.value))
                        }
                      }}
                    />
                    <Label 
                      htmlFor={status.value} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-medium mb-1">Важно:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Экспортируются только ID контактов и метаданные</li>
                <li>• Номера телефонов НЕ включены в экспорт</li>
                <li>• Файл будет сохранен в формате CSV</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Скачать CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}