'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Mic, 
  FileText, 
  Settings, 
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Save,
  Play,
  Check,
  Users,
  Clock
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

interface CampaignForm {
  name: string
  companyId: string
  agent: string
  voice: string
  instructions: string
  serviceReady: boolean
  balanceOk: boolean
  telephonyOk: boolean
  serviceAvailable: boolean
  // Параметры запуска
  batchSize: number
  maxCalls: number
  retryAttempts: number
  retryInterval: number
  enableSms: boolean
  smsTemplate: string
}

const mockAgents = [
  { id: 'anna-1', name: 'Анна', description: 'Продажи и консультации' },
  { id: 'mikhail-2', name: 'Михаил', description: 'Поддержка и помощь' },
  { id: 'elena-3', name: 'Елена', description: 'Опросы и исследования' },
  { id: 'dmitry-4', name: 'Дмитрий', description: 'Информирование' }
]

const mockVoices = [
  { id: 'voice-1', name: 'Женский дружелюбный', description: 'Теплый, располагающий' },
  { id: 'voice-2', name: 'Мужской деловой', description: 'Уверенный, профессиональный' },
  { id: 'voice-3', name: 'Женский энергичный', description: 'Активный, позитивный' },
  { id: 'voice-4', name: 'Мужской спокойный', description: 'Размеренный, вдумчивый' }
]

export default function NewObzvonPage() {
  const router = useRouter()
  const [form, setForm] = useState<CampaignForm>({
    name: '',
    companyId: `CMP-${Date.now().toString(36).toUpperCase()}`,
    agent: '',
    voice: '',
    instructions: '',
    serviceReady: false,
    balanceOk: false,
    telephonyOk: false,
    serviceAvailable: false,
    batchSize: 50,
    maxCalls: 1000,
    retryAttempts: 3,
    retryInterval: 30,
    enableSms: true,
    smsTemplate: 'Спасибо за разговор! Ссылка на регистрацию: [LINK]'
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isCheckingService, setIsCheckingService] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const handleInputChange = (field: keyof CampaignForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCopyCompanyId = () => {
    navigator.clipboard.writeText(form.companyId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const checkServiceReadiness = async () => {
    setIsCheckingService(true)
    // Имитация проверки готовности сервиса
    setTimeout(() => {
      const balanceOk = Math.random() > 0.3
      const telephonyOk = Math.random() > 0.2
      const serviceAvailable = Math.random() > 0.1
      
      setForm(prev => ({
        ...prev,
        balanceOk,
        telephonyOk,
        serviceAvailable,
        serviceReady: balanceOk && telephonyOk && serviceAvailable
      }))
      setIsCheckingService(false)
    }, 1500)
  }

  useEffect(() => {
    // Автоматическая проверка готовности при монтировании
    checkServiceReadiness()
  }, [])

  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1:
        return form.name.trim() !== '' && form.serviceReady
      case 2:
        return form.agent !== '' && form.voice !== ''
      case 3:
        return form.instructions.trim() !== ''
      case 4:
        return form.batchSize > 0 && form.maxCalls > 0
      default:
        return false
    }
  }

  const isFormValid = () => {
    return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3)
  }

  const handleSave = async (startNow = false) => {
    setIsLoading(true)
    
    // Имитация сохранения
    setTimeout(() => {
      setIsLoading(false)
      if (startNow) {
        router.push('/obzvoni/monitor')
      } else {
        router.push('/obzvoni')
      }
    }, 1500)
  }

  const steps = [
    { id: 1, name: 'Основные настройки', icon: Settings },
    { id: 2, name: 'Настройка агента', icon: Mic },
    { id: 3, name: 'Инструкции', icon: FileText },
    { id: 4, name: 'Параметры запуска', icon: Play }
  ]

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
              Создание компании
            </h1>
            <p className="text-gray-600">
              Настройте параметры новой компании обзвона
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading || !form.name}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isLoading || !isFormValid()}>
            <Play className="h-4 w-4 mr-2" />
            Запустить
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
        <div className="lg:col-span-2 space-y-6">
          {/* Шаг 1: Основные настройки и готовность сервиса */}
          {currentStep === 1 && (
            <>
              {/* Блок готовности сервиса */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Готовность сервиса
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={checkServiceReadiness}
                      disabled={isCheckingService}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingService ? 'animate-spin' : ''}`} />
                      Проверить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Баланс */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${form.balanceOk ? 'bg-green-100' : 'bg-red-100'}`}>
                          {form.balanceOk ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Баланс</p>
                          <p className="text-sm text-gray-600">
                            {form.balanceOk ? '15,340 ₽' : 'Недостаточно средств'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Телефония */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${form.telephonyOk ? 'bg-green-100' : 'bg-red-100'}`}>
                          {form.telephonyOk ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Телефония</p>
                          <p className="text-sm text-gray-600">
                            {form.telephonyOk ? 'Подключена' : 'Не настроена'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Доступность */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${form.serviceAvailable ? 'bg-green-100' : 'bg-yellow-100'}`}>
                          {form.serviceAvailable ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">Доступность</p>
                          <p className="text-sm text-gray-600">
                            {form.serviceAvailable ? 'Сервис доступен' : 'Ограниченный доступ'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!form.serviceReady && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900">Требуется внимание</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Некоторые компоненты системы не готовы. Проверьте настройки перед запуском.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Основные настройки */}
              <Card>
                <CardHeader>
                  <CardTitle>Основные настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="name">Название компании *</Label>
                    <Input
                      id="name"
                      placeholder="Например: Новогодняя акция 2025"
                      value={form.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Company ID</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={form.companyId}
                        readOnly
                        className="font-mono bg-gray-50"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyCompanyId}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Используйте этот ID для интеграции с внешними системами
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Шаг 2: Настройка агента */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Настройка агента
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Выберите агента *</Label>
                  <Select value={form.agent} onValueChange={(value) => handleInputChange('agent', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите агента для звонков" />
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

                <div>
                  <Label>Выберите голос *</Label>
                  <Select value={form.voice} onValueChange={(value) => handleInputChange('voice', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите тип голоса" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVoices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div>
                            <div className="font-medium">{voice.name}</div>
                            <div className="text-xs text-gray-500">{voice.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Шаг 3: Инструкции */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Инструкции для агента
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="instructions">Инструкции для агента *</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Опишите, как должен вести себя агент, какую информацию сообщать, как реагировать на вопросы..."
                    value={form.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    className="mt-1 min-h-[200px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Подробные инструкции помогут агенту эффективнее общаться с клиентами
                  </p>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Общее количество звонков
                    </p>
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

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">SMS уведомления</Label>
                      <p className="text-sm text-gray-600">
                        Отправлять SMS после успешного звонка
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
                        className="mt-1"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Используйте [LINK] для вставки ссылки
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-4">
          {/* Сводка */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Сводка компании</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Название</p>
                <p className="font-medium">{form.name || 'Не указано'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Company ID</p>
                <p className="font-mono text-sm">{form.companyId}</p>
              </div>

              {form.agent && (
                <div>
                  <p className="text-sm text-gray-600">Агент</p>
                  <p className="font-medium">
                    {mockAgents.find(a => a.id === form.agent)?.name}
                  </p>
                </div>
              )}

              {form.voice && (
                <div>
                  <p className="text-sm text-gray-600">Голос</p>
                  <p className="font-medium">
                    {mockVoices.find(v => v.id === form.voice)?.name}
                  </p>
                </div>
              )}

              {form.instructions && (
                <div>
                  <p className="text-sm text-gray-600">Инструкции</p>
                  <Badge className="bg-green-100 text-green-800">✓</Badge>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Готовность</span>
                  {form.serviceReady ? (
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">!</Badge>
                  )}
                </div>
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

          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/agents')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Настроить агентов
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/settings/telephony')}
              >
                <Mic className="h-4 w-4 mr-2" />
                Настройки телефонии
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}