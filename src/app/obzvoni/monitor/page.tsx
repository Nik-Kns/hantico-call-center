'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Filter,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
  Bot,
  Settings2,
  ChevronDown,
  Check,
  X,
  GitBranch
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'

interface CompanyMonitor {
  id: string
  companyId: string
  name: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  // Основные метрики
  totalTransferred: number  // Передано (от нас клиенту)
  totalReceived: number  // Получено (принято клиентом)
  totalProcessed: number  // Обработано
  totalInProgress: number  // В работе
  completionPercent: number  // % выполнения
  // Категории результатов
  successCount: number  // Успешные
  refusalCount: number  // Отказы
  noAnswerCount: number  // Недозвоны
  voicemailCount: number  // Автоответчики (отдельная категория)
  // A/B тестирование
  hasABTest: boolean  // Есть ли активный A/B тест
  abTestVariants?: {
    A: { agent: string; calls: number; conversions: number }
    B: { agent: string; calls: number; conversions: number }
  }
  // Дополнительные данные
  lastActivity: Date
  agent: string
}

// Моковые данные
const mockCompanies: CompanyMonitor[] = [
  {
    id: 'obz-1',
    companyId: 'CMP-1A2B3C4D',
    name: 'Новогодняя акция 2025',
    status: 'active',
    totalTransferred: 2500,
    totalReceived: 2487,
    totalProcessed: 1847,
    totalInProgress: 640,
    completionPercent: 74.26,
    successCount: 1234,
    refusalCount: 312,
    noAnswerCount: 189,
    voicemailCount: 112,
    hasABTest: true,
    abTestVariants: {
      A: { agent: 'Анна', calls: 924, conversions: 617 },
      B: { agent: 'Елена', calls: 923, conversions: 617 }
    },
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
    agent: 'Анна'
  },
  {
    id: 'obz-2',
    companyId: 'CMP-5E6F7G8H',
    name: 'Реактивация клиентов',
    status: 'paused',
    totalTransferred: 1800,
    totalReceived: 1795,
    totalProcessed: 456,
    totalInProgress: 1339,
    completionPercent: 25.40,
    successCount: 234,
    refusalCount: 89,
    noAnswerCount: 78,
    voicemailCount: 55,
    hasABTest: false,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    agent: 'Михаил'
  },
  {
    id: 'obz-3',
    companyId: 'CMP-9I0J1K2L',
    name: 'Холодная база январь',
    status: 'completed',
    totalTransferred: 850,
    totalReceived: 850,
    totalProcessed: 850,
    totalInProgress: 0,
    completionPercent: 100,
    successCount: 445,
    refusalCount: 178,
    noAnswerCount: 156,
    voicemailCount: 71,
    hasABTest: true,
    abTestVariants: {
      A: { agent: 'Елена', calls: 425, conversions: 213 },
      B: { agent: 'Ольга', calls: 425, conversions: 232 }
    },
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
    agent: 'Елена'
  },
  {
    id: 'obz-4',
    companyId: 'CMP-3M4N5O6P',
    name: 'VIP клиенты',
    status: 'active',
    totalTransferred: 450,
    totalReceived: 448,
    totalProcessed: 380,
    totalInProgress: 68,
    completionPercent: 84.82,
    successCount: 312,
    refusalCount: 23,
    noAnswerCount: 28,
    voicemailCount: 17,
    hasABTest: false,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000),
    agent: 'Дмитрий'
  },
  {
    id: 'obz-5',
    companyId: 'CMP-7Q8R9S0T',
    name: 'Повторные продажи',
    status: 'draft',
    totalTransferred: 1200,
    totalReceived: 0,
    totalProcessed: 0,
    totalInProgress: 0,
    completionPercent: 0,
    successCount: 0,
    refusalCount: 0,
    noAnswerCount: 0,
    voicemailCount: 0,
    hasABTest: false,
    lastActivity: new Date(Date.now() - 48 * 60 * 60 * 1000),
    agent: 'Анна'
  }
]

// Определяем все возможные колонки
const allColumns = [
  { id: 'select', label: '', fixed: true },
  { id: 'company', label: 'Кампания', fixed: true },
  { id: 'status', label: 'Статус', default: true },
  { id: 'abTest', label: 'A/B тест', default: true },
  { id: 'transferred', label: 'Передано', default: true },
  { id: 'received', label: 'Получено', default: true },
  { id: 'processed', label: 'Обработано', default: true },
  { id: 'inProgress', label: 'В работе', default: true },
  { id: 'completion', label: '% выполнения', default: true },
  { id: 'success', label: 'Успешные', default: false },
  { id: 'refusals', label: 'Отказы', default: false },
  { id: 'noAnswer', label: 'Недозвоны', default: false },
  { id: 'conversion', label: 'Конверсия', default: true },
  { id: 'voicemail', label: 'Автоответчики', default: true },
  { id: 'lastActivity', label: 'Последняя активность', default: true },
  { id: 'agent', label: 'Агент', default: false },
  { id: 'actions', label: 'Действия', fixed: true }
]

export default function ObzvoniMonitorPage() {
  const router = useRouter()
  const [companies] = useState<CompanyMonitor[]>(mockCompanies)
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Состояние для настройки колонок
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.filter(col => col.fixed || col.default).map(col => col.id)
  )

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

  const formatLastActivity = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    return `${days} дн назад`
  }

  const getConversionRate = (company: CompanyMonitor) => {
    if (company.totalProcessed === 0) return 0
    return Math.round((company.successCount / company.totalProcessed) * 100)
  }

  // Фильтрация компаний с учетом выбранных
  const filteredCompanies = useMemo(() => {
    let filtered = companies

    // Фильтр по выбранным кампаниям
    if (selectedCompanies.length > 0) {
      filtered = filtered.filter(c => selectedCompanies.includes(c.id))
    }

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.companyId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [companies, selectedCompanies, searchQuery])

  // Подсчет агрегированных метрик с учетом фильтров
  const totalMetrics = useMemo(() => ({
    transferred: filteredCompanies.reduce((sum, c) => sum + c.totalTransferred, 0),
    received: filteredCompanies.reduce((sum, c) => sum + c.totalReceived, 0),
    processed: filteredCompanies.reduce((sum, c) => sum + c.totalProcessed, 0),
    inProgress: filteredCompanies.reduce((sum, c) => sum + c.totalInProgress, 0),
    success: filteredCompanies.reduce((sum, c) => sum + c.successCount, 0),
    voicemail: filteredCompanies.reduce((sum, c) => sum + c.voicemailCount, 0)
  }), [filteredCompanies])

  // Обработчик выбора всех
  const handleSelectAll = () => {
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([])
    } else {
      setSelectedCompanies(filteredCompanies.map(c => c.id))
    }
  }

  // Обработчик выбора одной кампании
  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  // Обработчик изменения видимости колонки
  const toggleColumnVisibility = (columnId: string) => {
    const column = allColumns.find(col => col.id === columnId)
    if (column?.fixed) return // Не позволяем скрывать фиксированные колонки
    
    setVisibleColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    )
  }

  // Экспорт с учетом фильтров
  const handleExport = () => {
    const dataToExport = filteredCompanies.map(company => ({
      'Кампания': company.name,
      'ID': company.companyId,
      'Статус': company.status,
      'Передано': company.totalTransferred,
      'Получено': company.totalReceived,
      'Обработано': company.totalProcessed,
      'В работе': company.totalInProgress,
      '% выполнения': company.completionPercent,
      'Успешные': company.successCount,
      'Отказы': company.refusalCount,
      'Недозвоны': company.noAnswerCount,
      'Автоответчики': company.voicemailCount,
      'Конверсия %': getConversionRate(company),
      'Агент': company.agent
    }))
    
    // Здесь логика экспорта в CSV/Excel
    console.log('Экспорт данных:', dataToExport)
    alert(`Экспортировано ${dataToExport.length} кампаний`)
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
              Мониторинг кампаний
            </h1>
            <p className="text-gray-600">
              Обзор состояния и метрик всех кампаний (только просмотр)
            </p>
          </div>
        </div>
        
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Экспорт ({selectedCompanies.length || filteredCompanies.length})
        </Button>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Label className="text-sm">Фильтры:</Label>
            </div>
            
            {/* Мультивыбор кампаний */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-48">
                  <span className="truncate">
                    {selectedCompanies.length === 0 
                      ? 'Все кампании'
                      : `Выбрано: ${selectedCompanies.length}`
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Выбор кампаний</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedCompanies([])
                    }}
                    className="h-auto p-1 text-xs"
                  >
                    Сбросить
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {companies.map(company => (
                  <DropdownMenuCheckboxItem
                    key={company.id}
                    checked={selectedCompanies.includes(company.id)}
                    onCheckedChange={() => handleSelectCompany(company.id)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {company.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              placeholder="Поиск по названию или ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />

            <div className="flex-1" />

            <div className="text-sm text-gray-600">
              Найдено: <span className="font-medium">{filteredCompanies.length}</span> кампаний
              {selectedCompanies.length > 0 && (
                <span className="ml-2">
                  (выбрано: {selectedCompanies.length})
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Сводная статистика (реагирует на фильтры) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Передано</p>
            <p className="text-2xl font-bold">{totalMetrics.transferred.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">от нас клиенту</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Получено</p>
            <p className="text-2xl font-bold text-green-600">{totalMetrics.received.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">принято клиентом</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Обработано</p>
            <p className="text-2xl font-bold text-blue-600">{totalMetrics.processed.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">В работе</p>
            <p className="text-2xl font-bold text-orange-600">{totalMetrics.inProgress.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Успешные</p>
            <p className="text-2xl font-bold text-green-600">{totalMetrics.success.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Автоответчики</p>
            <p className="text-2xl font-bold text-purple-600">{totalMetrics.voicemail.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Таблица кампаний с горизонтальным скроллом */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Список кампаний</CardTitle>
            
            {/* Настройка видимости колонок */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Колонки
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Видимость колонок</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allColumns.filter(col => !col.fixed).map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={visibleColumns.includes(column.id)}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  {/* Чекбокс для выбора всех */}
                  {visibleColumns.includes('select') && (
                    <th className="px-4 py-3 w-12">
                      <Checkbox
                        checked={selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                  )}
                  
                  {/* Остальные колонки */}
                  {visibleColumns.includes('company') && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50">
                      Кампания
                    </th>
                  )}
                  {visibleColumns.includes('status') && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Статус
                    </th>
                  )}
                  {visibleColumns.includes('abTest') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      A/B тест
                    </th>
                  )}
                  {visibleColumns.includes('transferred') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Передано
                    </th>
                  )}
                  {visibleColumns.includes('received') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Получено
                    </th>
                  )}
                  {visibleColumns.includes('processed') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Обработано
                    </th>
                  )}
                  {visibleColumns.includes('inProgress') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      В работе
                    </th>
                  )}
                  {visibleColumns.includes('completion') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      % выполнения
                    </th>
                  )}
                  {visibleColumns.includes('success') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Успешные
                    </th>
                  )}
                  {visibleColumns.includes('refusals') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Отказы
                    </th>
                  )}
                  {visibleColumns.includes('noAnswer') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Недозвоны
                    </th>
                  )}
                  {visibleColumns.includes('conversion') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Конверсия
                    </th>
                  )}
                  {visibleColumns.includes('voicemail') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" title="Автоответчики">
                      <Bot className="h-4 w-4 mx-auto" />
                    </th>
                  )}
                  {visibleColumns.includes('lastActivity') && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Последняя активность
                    </th>
                  )}
                  {visibleColumns.includes('agent') && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Агент
                    </th>
                  )}
                  {visibleColumns.includes('actions') && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Действия
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => {
                  const conversionRate = getConversionRate(company)
                  const isHighConversion = conversionRate > 60
                  const isLowConversion = conversionRate < 30
                  const isSelected = selectedCompanies.includes(company.id)

                  return (
                    <tr key={company.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                      {/* Чекбокс */}
                      {visibleColumns.includes('select') && (
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectCompany(company.id)}
                          />
                        </td>
                      )}
                      
                      {/* Кампания */}
                      {visibleColumns.includes('company') && (
                        <td className="px-4 py-3 sticky left-0 bg-white">
                          <div>
                            <p className="font-medium text-gray-900">{company.name}</p>
                            <p className="text-xs text-gray-500">{company.companyId}</p>
                          </div>
                        </td>
                      )}
                      
                      {/* Статус */}
                      {visibleColumns.includes('status') && (
                        <td className="px-4 py-3">
                          {getStatusBadge(company.status)}
                        </td>
                      )}
                      
                      {/* A/B тест */}
                      {visibleColumns.includes('abTest') && (
                        <td className="px-4 py-3 text-center">
                          {company.hasABTest ? (
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center space-x-2">
                                <GitBranch className="h-4 w-4 text-purple-600" />
                                <span className="text-xs font-medium text-purple-600">Активен</span>
                              </div>
                              {company.abTestVariants && (
                                <div className="flex space-x-1">
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    A: {company.abTestVariants.A.agent.substring(0, 3)}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs px-1 py-0">
                                    B: {company.abTestVariants.B.agent.substring(0, 3)}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                      )}
                      
                      {/* Передано */}
                      {visibleColumns.includes('transferred') && (
                        <td className="px-4 py-3 text-center font-medium">
                          {company.totalTransferred.toLocaleString()}
                        </td>
                      )}
                      
                      {/* Получено */}
                      {visibleColumns.includes('received') && (
                        <td className="px-4 py-3 text-center">
                          <div>
                            <span className="font-medium text-green-600">
                              {company.totalReceived.toLocaleString()}
                            </span>
                            {company.totalTransferred !== company.totalReceived && (
                              <p className="text-xs text-red-500">
                                Δ {Math.abs(company.totalTransferred - company.totalReceived)}
                              </p>
                            )}
                          </div>
                        </td>
                      )}
                      
                      {/* Обработано */}
                      {visibleColumns.includes('processed') && (
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-blue-600">
                            {company.totalProcessed.toLocaleString()}
                          </span>
                        </td>
                      )}
                      
                      {/* В работе */}
                      {visibleColumns.includes('inProgress') && (
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-orange-600">
                            {company.totalInProgress.toLocaleString()}
                          </span>
                        </td>
                      )}
                      
                      {/* % выполнения */}
                      {visibleColumns.includes('completion') && (
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Progress value={company.completionPercent} className="flex-1 max-w-[100px]" />
                            <span className="text-sm font-medium min-w-[3rem] text-right">
                              {company.completionPercent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      )}
                      
                      {/* Успешные */}
                      {visibleColumns.includes('success') && (
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-green-600">
                            {company.successCount.toLocaleString()}
                          </span>
                        </td>
                      )}
                      
                      {/* Отказы */}
                      {visibleColumns.includes('refusals') && (
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-red-600">
                            {company.refusalCount.toLocaleString()}
                          </span>
                        </td>
                      )}
                      
                      {/* Недозвоны */}
                      {visibleColumns.includes('noAnswer') && (
                        <td className="px-4 py-3 text-center">
                          <span className="font-medium text-gray-600">
                            {company.noAnswerCount.toLocaleString()}
                          </span>
                        </td>
                      )}
                      
                      {/* Конверсия */}
                      {visibleColumns.includes('conversion') && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {isHighConversion && <TrendingUp className="h-4 w-4 text-green-600" />}
                            {isLowConversion && <TrendingDown className="h-4 w-4 text-red-600" />}
                            <span className={`font-medium ${
                              isHighConversion ? 'text-green-600' : 
                              isLowConversion ? 'text-red-600' : 
                              'text-gray-900'
                            }`}>
                              {conversionRate}%
                            </span>
                          </div>
                        </td>
                      )}
                      
                      {/* Автоответчики */}
                      {visibleColumns.includes('voicemail') && (
                        <td className="px-4 py-3 text-center">
                          {company.voicemailCount > 0 ? (
                            <Badge className="bg-purple-100 text-purple-800">
                              {company.voicemailCount}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                      )}
                      
                      {/* Последняя активность */}
                      {visibleColumns.includes('lastActivity') && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {formatLastActivity(company.lastActivity)}
                          </div>
                        </td>
                      )}
                      
                      {/* Агент */}
                      {visibleColumns.includes('agent') && (
                        <td className="px-4 py-3 text-sm">
                          {company.agent}
                        </td>
                      )}
                      
                      {/* Действия (только просмотр) */}
                      {visibleColumns.includes('actions') && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => router.push(`/obzvoni/${company.id}`)}
                              title="Подробнее"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Кампании не найдены</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}