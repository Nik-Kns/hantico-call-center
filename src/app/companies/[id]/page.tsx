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
  Filter
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { maskPhoneNumber } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CompanyDetails {
  id: string
  companyId: string
  name: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  agent: string
  voice: string
  // Метрики передачи в ERP
  totalReceived: number  // Сколько контактов передано ERP
  totalProcessed: number  // Сколько обработано
  totalInProgress: number  // Сколько в работе
  // Декомпозиция обработанных
  successfulConsent: number  // Успешные/согласие (SMS)
  refusals: number  // Отказы
  noAnswers: number  // Недозвоны
  voicemails: number  // Автоответчики (человек)
  robotVoicemails: number  // Автоответчики (роботы)
  progress: number
  startTime?: Date
  endTime?: Date
}

interface CallRecord {
  id: string
  phoneNumber: string  // Маскированный номер
  dateTime: Date
  result: 'success' | 'refused' | 'no_answer' | 'voicemail' | 'robot_voicemail' | 'busy'
  category: string  // Категория результата
  duration: number
  hasSms: boolean
  hasLinkClick: boolean
  hasRegistration: boolean
  transferredToErp: boolean  // Флаг "передано в ERP/B24"
  hasRecording: boolean
  hasTranscript: boolean
}

// Моковые данные
const mockCompanyDetails: { [key: string]: CompanyDetails } = {
  'obz-1': {
    id: 'obz-1',
    companyId: 'CMP-1A2B3C4D',
    name: 'Новогодняя акция 2025',
    status: 'active',
    agent: 'Анна',
    voice: 'Женский дружелюбный',
    totalReceived: 2500,
    totalProcessed: 1847,
    totalInProgress: 653,
    successfulConsent: 1234,
    refusals: 312,
    noAnswers: 189,
    voicemails: 71,
    robotVoicemails: 41,
    progress: 73.88,
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  'obz-2': {
    id: 'obz-2',
    companyId: 'CMP-5E6F7G8H',
    name: 'Реактивация клиентов',
    status: 'paused',
    agent: 'Михаил',
    voice: 'Мужской деловой',
    totalReceived: 1800,
    totalProcessed: 456,
    totalInProgress: 1344,
    successfulConsent: 234,
    refusals: 89,
    noAnswers: 78,
    voicemails: 35,
    robotVoicemails: 20,
    progress: 25.33,
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  'obz-3': {
    id: 'obz-3',
    companyId: 'CMP-9I0J1K2L',
    name: 'Холодная база январь',
    status: 'completed',
    agent: 'Елена',
    voice: 'Женский энергичный',
    totalReceived: 850,
    totalProcessed: 850,
    totalInProgress: 0,
    successfulConsent: 445,
    refusals: 178,
    noAnswers: 156,
    voicemails: 51,
    robotVoicemails: 20,
    progress: 100,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }
}

const mockCallRecords: CallRecord[] = [
  {
    id: 'call-1',
    phoneNumber: '+7 (9••) •••-45-67',
    dateTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    result: 'success',
    category: 'Согласие',
    duration: 245,
    hasSms: true,
    hasLinkClick: true,
    hasRegistration: true,
    transferredToErp: true,
    hasRecording: true,
    hasTranscript: true
  },
  {
    id: 'call-2',
    phoneNumber: '+7 (9••) •••-56-78',
    dateTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    result: 'refused',
    category: 'Отказ',
    duration: 89,
    hasSms: false,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: false,
    hasRecording: true,
    hasTranscript: true
  },
  {
    id: 'call-3',
    phoneNumber: '+7 (9••) •••-67-89',
    dateTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    result: 'voicemail',
    category: 'Автоответчик',
    duration: 15,
    hasSms: false,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: false,
    hasRecording: false,
    hasTranscript: false
  },
  {
    id: 'call-6',
    phoneNumber: '+7 (9••) •••-12-34',
    dateTime: new Date(Date.now() - 7 * 60 * 60 * 1000),
    result: 'robot_voicemail',
    category: 'Робот-автоответчик',
    duration: 5,
    hasSms: false,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: false,
    hasRecording: false,
    hasTranscript: false
  },
  {
    id: 'call-4',
    phoneNumber: '+7 (9••) •••-78-90',
    dateTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    result: 'no_answer',
    category: 'Недозвон',
    duration: 0,
    hasSms: false,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: false,
    hasRecording: false,
    hasTranscript: false
  },
  {
    id: 'call-5',
    phoneNumber: '+7 (9••) •••-89-01',
    dateTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
    result: 'success',
    category: 'Согласие',
    duration: 312,
    hasSms: true,
    hasLinkClick: false,
    hasRegistration: false,
    transferredToErp: true,
    hasRecording: true,
    hasTranscript: true
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
  const [dateFilter, setDateFilter] = useState('today')
  const [searchFilter, setSearchFilter] = useState('')

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

      {/* Верхняя информационная панель */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Статус</p>
              <div className="flex items-center space-x-2">
                {getStatusBadge(company.status)}
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
              <p className="text-sm text-gray-600 mb-1">Передано ERP</p>
              <p className="text-2xl font-bold">{company.totalReceived.toLocaleString()}</p>
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

      {/* Основные метрики */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Обработано</p>
                <p className="text-2xl font-bold text-blue-600">
                  {company.totalProcessed.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round((company.totalProcessed / company.totalReceived) * 100)}% от переданных
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
                  {Math.round((company.totalInProgress / company.totalReceived) * 100)}% от переданных
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
                <p className="text-sm text-gray-600">Конверсия</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((company.successfulConsent / company.totalProcessed) * 100)}%
                </p>
                <p className="text-xs text-gray-500">
                  Успешные из обработанных
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Декомпозиция обработанных */}
      <Card>
        <CardHeader>
          <CardTitle>Декомпозиция обработанных контактов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <Badge className="bg-green-100 text-green-800">SMS</Badge>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {company.successfulConsent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Успешные/согласие</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((company.successfulConsent / company.totalProcessed) * 100)}% от обработанных
              </p>
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
                <Label htmlFor="date-filter" className="text-sm">Период:</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="date-filter" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Сегодня</SelectItem>
                    <SelectItem value="week">Неделя</SelectItem>
                    <SelectItem value="month">Месяц</SelectItem>
                    <SelectItem value="all">Все время</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Поиск по номеру..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-48"
              />
              <Button variant="outline" size="sm">
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
                    Номер
                  </th>
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
                {callRecords.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-sm">{call.phoneNumber}</span>
                    </td>
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
                        {call.hasSms && (
                          <div className="group relative">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              SMS отправлено
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
    </div>
  )
}