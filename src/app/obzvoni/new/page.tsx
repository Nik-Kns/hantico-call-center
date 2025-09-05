'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Users, 
  Mic, 
  FileText, 
  Settings, 
  Clock,
  Play,
  Save,
  AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface CampaignForm {
  name: string
  database: string
  agent: string
  script: string
  customScript: string
  batchSize: number
  startTime: string
  endTime: string
  maxCalls: number
  retryAttempts: number
  retryInterval: number
  enableSms: boolean
  smsTemplate: string
  enableBitrix: boolean
  autoStart: boolean
  // A/B тестирование
  enableABTest: boolean
  abTestName: string
  abTestVariants: Array<{
    id: string
    name: string
    description: string
    agentId: string
    trafficAllocation: number
    isControl?: boolean
  }>
  abTestSettings: {
    duration: number
    minSampleSize: number
    confidenceLevel: number
    primaryMetric: string
    autoStop: boolean
  }
}

const mockAgents = [
  { id: 'anna-1', name: 'Анна (голос 1)', description: 'Женский, дружелюбный' },
  { id: 'mikhail-2', name: 'Михаил (голос 2)', description: 'Мужской, деловой' },
  { id: 'elena-3', name: 'Елена (голос 3)', description: 'Женский, профессиональный' },
  { id: 'dmitry-4', name: 'Дмитрий (голос 4)', description: 'Мужской, энергичный' }
]

const mockDatabases = [
  { 
    id: 'vip-clients', 
    name: 'VIP клиенты', 
    description: 'Клиенты с высокой активностью',
    count: 1250,
    lastUpdated: '2 часа назад',
    segment: 'VIP'
  },
  { 
    id: 'inactive-90', 
    name: 'Неактивные 90 дней', 
    description: 'Клиенты без активности более 90 дней',
    count: 2100,
    lastUpdated: '1 день назад',
    segment: 'Реактивация'
  },
  { 
    id: 'new-leads', 
    name: 'Новые лиды', 
    description: 'Свежие лиды из рекламных кампаний',
    count: 850,
    lastUpdated: '30 минут назад',
    segment: 'Холодные'
  },
  { 
    id: 'repeat-customers', 
    name: 'Повторные клиенты', 
    description: 'Клиенты с повторными покупками',
    count: 670,
    lastUpdated: '5 часов назад',
    segment: 'Лояльные'
  },
  { 
    id: 'birthday-list', 
    name: 'Именинники января', 
    description: 'Клиенты с днем рождения в январе',
    count: 340,
    lastUpdated: '1 час назад',
    segment: 'Поздравления'
  }
]

const mockScripts = [
  { id: 'welcome', name: 'Приветствие новых клиентов', description: 'Стандартный скрипт знакомства' },
  { id: 'reactivation', name: 'Реактивация неактивных', description: 'Возвращение с бонусным предложением' },
  { id: 'promo', name: 'Промо-акция', description: 'Информирование об акциях и скидках' },
  { id: 'survey', name: 'Опрос клиентов', description: 'Сбор обратной связи' },
  { id: 'custom', name: 'Собственный скрипт', description: 'Создать уникальный сценарий' }
]

export default function NewObzvonPage() {
  const router = useRouter()
  const [form, setForm] = useState<CampaignForm>({
    name: '',
    database: '',
    agent: '',
    script: '',
    customScript: '',
    batchSize: 50,
    startTime: '',
    endTime: '',
    maxCalls: 1000,
    retryAttempts: 3,
    retryInterval: 30,
    enableSms: true,
    smsTemplate: 'Спасибо за разговор! Ссылка на регистрацию: [LINK]',
    enableBitrix: false,
    autoStart: false,
    // A/B тестирование
    enableABTest: false,
    abTestName: '',
    abTestVariants: [
      {
        id: 'variant-a',
        name: 'A (Контроль)',
        description: 'Основная версия',
        agentId: '',
        trafficAllocation: 50,
        isControl: true
      },
      {
        id: 'variant-b',
        name: 'B',
        description: 'Тестовая версия',
        agentId: '',
        trafficAllocation: 50
      }
    ],
    abTestSettings: {
      duration: 14,
      minSampleSize: 1000,
      confidenceLevel: 95,
      primaryMetric: 'conversion_rate',
      autoStop: true
    }
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof CampaignForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDatabaseSelect = (databaseId: string) => {
    const selectedDb = mockDatabases.find(db => db.id === databaseId)
    if (selectedDb) {
      setForm(prev => ({
        ...prev,
        database: databaseId
      }))
    }
  }

  const handleSave = async (asDraft = true) => {
    setIsLoading(true)
    
    // Имитация сохранения
    setTimeout(() => {
      setIsLoading(false)
      if (asDraft) {
        router.push('/obzvoni')
      } else {
        // Запуск кампании
        router.push('/obzvoni/monitor')
      }
    }, 1500)
  }

  const steps = [
    { id: 1, name: 'Основные настройки', icon: Settings },
    { id: 2, name: 'База и агент', icon: Users },
    { id: 3, name: 'Параметры запуска', icon: Play }
  ]

  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1:
        return form.name.trim() !== ''
      case 2:
        return form.database !== '' && form.agent !== ''
      case 3:
        return form.batchSize > 0 && form.maxCalls > 0
      default:
        return false
    }
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
              Создание кампании обзвона
            </h1>
            <p className="text-gray-600">
              Настройте параметры автоматического обзвона
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => handleSave(true)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить как черновик
          </Button>
          <Button onClick={() => handleSave(false)} disabled={isLoading || !isStepCompleted(4)}>
            <Play className="h-4 w-4 mr-2" />
            Запустить кампанию
          </Button>
        </div>
      </div>

      {/* Шаги */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full cursor-pointer ${
                    currentStep === step.id 
                      ? 'bg-blue-600 text-white' 
                      : isStepCompleted(step.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep === step.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-4 ${
                    isStepCompleted(step.id) ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Содержимое шагов */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Шаг 1: Основные настройки */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Основные настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name">Название кампании *</Label>
                  <Input
                    id="name"
                    placeholder="Например: Новогодняя акция 2025"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Автоматический запуск</Label>
                    <p className="text-sm text-gray-600">
                      Запустить кампанию сразу после создания
                    </p>
                  </div>
                  <Switch
                    checked={form.autoStart}
                    onCheckedChange={(checked) => handleInputChange('autoStart', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Шаг 2: База и агент */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  База номеров и агент
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Выберите базу номеров *</Label>
                  <div className="mt-2 space-y-3">
                    <Select value={form.database} onValueChange={handleDatabaseSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите базу для обзвона" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDatabases.map((database) => (
                          <SelectItem key={database.id} value={database.id}>
                            <div className="flex items-start justify-between w-full">
                              <div>
                                <div className="font-medium">{database.name}</div>
                                <div className="text-xs text-gray-500">{database.description}</div>
                                <div className="text-xs text-blue-600">
                                  {database.count.toLocaleString()} номеров
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {form.database && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        {(() => {
                          const selectedDb = mockDatabases.find(db => db.id === form.database)
                          return selectedDb ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-blue-900">{selectedDb.name}</h4>
                                <Badge className="bg-blue-100 text-blue-800">{selectedDb.segment}</Badge>
                              </div>
                              <p className="text-sm text-blue-700">{selectedDb.description}</p>
                              <div className="flex items-center justify-between text-sm text-blue-600">
                                <span>📊 {selectedDb.count.toLocaleString()} номеров</span>
                                <span>🕒 Обновлено: {selectedDb.lastUpdated}</span>
                              </div>
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Выберите агента (голос) *</Label>
                  <Select value={form.agent} onValueChange={(value) => handleInputChange('agent', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Выберите голос для обзвона" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-xs text-gray-500">{agent.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* A/B тестирование */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-base font-medium">A/B тестирование</Label>
                      <p className="text-sm text-gray-600">
                        Сравните эффективность разных агентов или подходов
                      </p>
                    </div>
                    <Switch
                      checked={form.enableABTest}
                      onCheckedChange={(checked) => handleInputChange('enableABTest', checked)}
                    />
                  </div>

                  {form.enableABTest && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                      <div>
                        <Label htmlFor="abTestName">Название теста</Label>
                        <Input
                          id="abTestName"
                          placeholder="Например: Тест голосов для VIP клиентов"
                          value={form.abTestName}
                          onChange={(e) => handleInputChange('abTestName', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Варианты теста</Label>
                        <div className="mt-2 space-y-3">
                          {form.abTestVariants.map((variant, index) => (
                            <div key={variant.id} className="p-3 bg-white rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">{variant.name}</h4>
                                {variant.isControl && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    Контроль
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Агент</Label>
                                  <Select 
                                    value={variant.agentId} 
                                    onValueChange={(value) => {
                                      const newVariants = [...form.abTestVariants]
                                      newVariants[index].agentId = value
                                      handleInputChange('abTestVariants', newVariants)
                                    }}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue placeholder="Выберите агента" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockAgents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                          {agent.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Доля трафика (%)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={variant.trafficAllocation}
                                    onChange={(e) => {
                                      const newVariants = [...form.abTestVariants]
                                      newVariants[index].trafficAllocation = parseInt(e.target.value) || 0
                                      handleInputChange('abTestVariants', newVariants)
                                    }}
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <Label className="text-xs">Описание</Label>
                                <Input
                                  placeholder="Краткое описание варианта"
                                  value={variant.description}
                                  onChange={(e) => {
                                    const newVariants = [...form.abTestVariants]
                                    newVariants[index].description = e.target.value
                                    handleInputChange('abTestVariants', newVariants)
                                  }}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <div className="flex justify-between">
                            <span>Общее распределение:</span>
                            <span className={`font-medium ${
                              form.abTestVariants.reduce((sum, v) => sum + v.trafficAllocation, 0) === 100 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {form.abTestVariants.reduce((sum, v) => sum + v.trafficAllocation, 0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Длительность (дни)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="90"
                            value={form.abTestSettings.duration}
                            onChange={(e) => handleInputChange('abTestSettings', {
                              ...form.abTestSettings,
                              duration: parseInt(e.target.value) || 14
                            })}
                            className="text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">Мин. выборка</Label>
                          <Input
                            type="number"
                            min="100"
                            value={form.abTestSettings.minSampleSize}
                            onChange={(e) => handleInputChange('abTestSettings', {
                              ...form.abTestSettings,
                              minSampleSize: parseInt(e.target.value) || 1000
                            })}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Основная метрика</Label>
                        <Select 
                          value={form.abTestSettings.primaryMetric} 
                          onValueChange={(value) => handleInputChange('abTestSettings', {
                            ...form.abTestSettings,
                            primaryMetric: value
                          })}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conversion_rate">Конверсия</SelectItem>
                            <SelectItem value="success_rate">Успешность</SelectItem>
                            <SelectItem value="sms_consent_rate">Согласие на SMS</SelectItem>
                            <SelectItem value="avg_call_duration">Длительность звонка</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs">Автоматическая остановка</Label>
                          <p className="text-xs text-gray-600">
                            Остановить при достижении значимости
                          </p>
                        </div>
                        <Switch
                          checked={form.abTestSettings.autoStop}
                          onCheckedChange={(checked) => handleInputChange('abTestSettings', {
                            ...form.abTestSettings,
                            autoStop: checked
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Шаг 3: Параметры запуска и этапы кампании */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Параметры запуска и этапы кампании
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Этапы кампании</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'cold', label: 'Холодная' },
                      { id: 'remind_reg', label: 'Напоминание про регистрацию' },
                      { id: 'remind_incomplete', label: 'Напоминание: не завершил регистрацию (5 типов)' },
                      { id: 'retry_voicemail', label: 'Повтор при автоответчике' }
                    ].map((step) => (
                      <div key={step.id} className="p-4 border rounded-lg">
                        <div className="text-sm text-gray-700 mb-2">{step.label}</div>
                        <Label className="text-xs">Агент для шага</Label>
                        <Select 
                          value={form.agent}
                          onValueChange={(value) => handleInputChange('agent', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Выберите агента" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockAgents.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm">Количество ретраев (недозвон)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.retryAttempts}
                      onChange={(e) => handleInputChange('retryAttempts', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Интервал между повторами (мин)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.retryInterval}
                      onChange={(e) => handleInputChange('retryInterval', parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Автоответчик: количество перезвонов</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.retryAttempts}
                      onChange={(e) => handleInputChange('retryAttempts', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Шаг 4: Параметры запуска */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Параметры запуска
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchSize">Размер пакета</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      min="1"
                      max="200"
                      value={form.batchSize}
                      onChange={(e) => handleInputChange('batchSize', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Количество одновременных звонков
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxCalls">Максимум звонков</Label>
                    <Input
                      id="maxCalls"
                      type="number"
                      min="1"
                      value={form.maxCalls}
                      onChange={(e) => handleInputChange('maxCalls', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Время начала</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">Время окончания</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Настройки повторных звонков</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="retryAttempts">Количество попыток</Label>
                      <Input
                        id="retryAttempts"
                        type="number"
                        min="0"
                        max="10"
                        value={form.retryAttempts}
                        onChange={(e) => handleInputChange('retryAttempts', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="retryInterval">Интервал (минуты)</Label>
                      <Input
                        id="retryInterval"
                        type="number"
                        min="5"
                        max="1440"
                        value={form.retryInterval}
                        onChange={(e) => handleInputChange('retryInterval', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Боковая панель с предпросмотром */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Предпросмотр кампании</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Название</p>
                <p className="font-medium">{form.name || 'Без названия'}</p>
              </div>

              {form.database && (
                <div>
                  <p className="text-sm text-gray-600">База данных</p>
                  <p className="font-medium">
                    {mockDatabases.find(db => db.id === form.database)?.name || form.database}
                  </p>
                  <p className="text-xs text-gray-500">
                    {mockDatabases.find(db => db.id === form.database)?.count.toLocaleString()} номеров
                  </p>
                </div>
              )}

              {form.agent && (
                <div>
                  <p className="text-sm text-gray-600">Агент</p>
                  <p className="font-medium">
                    {mockAgents.find(a => a.id === form.agent)?.name}
                  </p>
                </div>
              )}

              {form.script && (
                <div>
                  <p className="text-sm text-gray-600">Скрипт</p>
                  <p className="font-medium">
                    {mockScripts.find(s => s.id === form.script)?.name}
                  </p>
                </div>
              )}

              <div className="pt-4 space-y-2">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between">
                    <span className="text-sm">{step.name}</span>
                    {isStepCompleted(step.id) ? (
                      <Badge className="bg-green-100 text-green-800">✓</Badge>
                    ) : (
                      <Badge variant="outline">—</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Навигация по шагам */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-2">
                <Button
                  variant={currentStep > 1 ? 'outline' : 'ghost'}
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="w-full"
                >
                  Предыдущий шаг
                </Button>
                <Button
                  variant={currentStep < 4 ? 'default' : 'ghost'}
                  disabled={currentStep === 4}
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="w-full"
                >
                  Следующий шаг
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
