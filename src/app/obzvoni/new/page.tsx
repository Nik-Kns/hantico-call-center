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
    autoStart: false
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
    { id: 3, name: 'Скрипт', icon: FileText },
    { id: 4, name: 'Параметры запуска', icon: Play }
  ]

  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1:
        return form.name.trim() !== ''
      case 2:
        return form.database !== '' && form.agent !== ''
      case 3:
        return form.script !== '' && (form.script !== 'custom' || form.customScript.trim() !== '')
      case 4:
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
              </CardContent>
            </Card>
          )}

          {/* Шаг 3: Скрипт */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Скрипт обзвона
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Выберите шаблон скрипта *</Label>
                  <Select value={form.script} onValueChange={(value) => handleInputChange('script', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Выберите готовый скрипт или создайте свой" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockScripts.map((script) => (
                        <SelectItem key={script.id} value={script.id}>
                          <div>
                            <div className="font-medium">{script.name}</div>
                            <div className="text-xs text-gray-500">{script.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {form.script === 'custom' && (
                  <div>
                    <Label htmlFor="customScript">Собственный скрипт *</Label>
                    <Textarea
                      id="customScript"
                      placeholder="Введите текст скрипта для агента..."
                      value={form.customScript}
                      onChange={(e) => handleInputChange('customScript', e.target.value)}
                      rows={8}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Используйте переменные: [ИМЯ], [ТЕЛЕФОН], [ДАТА] для персонализации
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS после успешного звонка</Label>
                      <p className="text-sm text-gray-600">
                        Отправлять SMS при согласии клиента
                      </p>
                    </div>
                    <Switch
                      checked={form.enableSms}
                      onCheckedChange={(checked) => handleInputChange('enableSms', checked)}
                    />
                  </div>

                  {form.enableSms && (
                    <div>
                      <Label htmlFor="smsTemplate">Шаблон SMS</Label>
                      <Textarea
                        id="smsTemplate"
                        value={form.smsTemplate}
                        onChange={(e) => handleInputChange('smsTemplate', e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  )}
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
