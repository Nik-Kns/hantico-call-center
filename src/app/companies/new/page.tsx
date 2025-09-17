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
  User,
  Clock,
  Upload,
  CheckSquare,
  Phone,
  Headphones,
  FlaskConical,
  Plus,
  Eye,
  Pause,
  X,
  Edit,
  MessageSquare,
  Shield,
  Volume2,
  UserCheck
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { BaseType } from '@/lib/types'
import { CallTestModal } from '@/components/call-test-modal'

interface ABTest {
  id: string
  name: string
  description: string
  status: 'active' | 'draft'
  variantA: string
  variantB: string
  splitRatio: number
  callsCount?: number
}

interface CampaignForm {
  name: string
  description: string
  companyId: string
  baseType: BaseType | ''
  agent: string
  voice: string
  knowledgeDoc?: File
  serviceReady: boolean
  balanceOk: boolean
  telephonyOk: boolean
  serviceAvailable: boolean
  testPhone: string
  isTestCalling: boolean
  // A/B тестирование
  isABTestEnabled: boolean
  agentA: string
  agentB: string
  trafficSplit: number
  // Время и повторы
  callWindow: {
    start: string
    end: string
  }
  retryPolicy: {
    maxAttempts: number
    delayMinutes: number
  }
  // Создание агента инлайн
  createNewAgent: boolean
  newAgentName: string
  newAgentDescription: string
  newAgentPrompt: string
  // Результат теста агента
  agentTestStatus: 'idle' | 'testing' | 'passed' | 'failed'
  agentTestFeedback: string
  // Поля для структурированного промтинга
  agentRole?: string
  agentLanguage?: string
  agentScript?: string
  introTemplate?: string
  customIntro?: string
  conversationGoals?: string[]
  objectionHandling?: string
  maxAttempts?: number
  forbiddenTopics?: string
  consentRecording?: string
  dataProcessing?: string
  disclaimerText?: string
  // Исходящий номер
  outgoingNumber: string
}

const mockAgents = [
  { 
    id: 'anna-1', 
    name: 'Анна', 
    description: 'Продажи и консультации', 
    baseType: 'registration' as BaseType,
    prompt: `Ты - менеджер по продажам Анна. Твоя задача - консультировать клиентов по продуктам компании и помогать им с регистрацией.

Основные правила:
- Будь дружелюбной и вежливой
- Внимательно слушай клиента
- Предлагай решения, подходящие под их потребности
- Если клиент сомневается, приведи примеры успешных кейсов
- Всегда уточняй контактные данные для обратной связи`
  },
  { 
    id: 'mikhail-2', 
    name: 'Михаил', 
    description: 'Поддержка и помощь', 
    baseType: 'no_answer' as BaseType,
    prompt: `Ты - специалист технической поддержки Михаил. Твоя задача - помогать клиентам решать технические вопросы.

Основные правила:
- Будь терпеливым и понимающим
- Объясняй решения простым языком
- Предлагай пошаговые инструкции
- При сложных проблемах предложи эскалацию к специалисту
- Обязательно уточни, решена ли проблема`
  },
  { 
    id: 'elena-3', 
    name: 'Елена', 
    description: 'Опросы и исследования', 
    baseType: 'refusals' as BaseType,
    prompt: `Ты - специалист по исследованиям Елена. Твоя задача - проводить опросы и собирать обратную связь.

Основные правила:
- Представься и объясни цель опроса
- Задавай вопросы последовательно
- Не перебивай респондента
- Благодари за каждый ответ
- В конце опроса предложи бонус за участие`
  },
  { 
    id: 'dmitry-4', 
    name: 'Дмитрий', 
    description: 'Информирование', 
    baseType: 'reactivation' as BaseType,
    prompt: `Ты - менеджер по работе с клиентами Дмитрий. Твоя задача - информировать о новых предложениях и акциях.

Основные правила:
- Кратко представь актуальное предложение
- Подчеркни выгоды для клиента
- Ответь на вопросы о условиях
- Предложи оформить заявку прямо сейчас
- Если клиент не готов - предложи отправить информацию на email`
  },
  { 
    id: 'olga-5', 
    name: 'Ольга', 
    description: 'Регистрация новых клиентов', 
    baseType: 'registration' as BaseType,
    prompt: `Ты - специалист по регистрации Ольга. Твоя задача - помочь новым клиентам зарегистрироваться в системе.

Основные правила:
- Приветствуй тепло и дружелюбно
- Пошагово проведи через процесс регистрации
- Запрашивай данные по одному
- Подтверждай каждый введенный параметр
- В конце подтверди успешную регистрацию и расскажи о следующих шагах`
  },
  { 
    id: 'ivan-6', 
    name: 'Иван', 
    description: 'Работа с недозвонами', 
    baseType: 'no_answer' as BaseType,
    prompt: `Ты - менеджер Иван. Твоя задача - обработать пропущенные звонки и выяснить потребности клиента.

Основные правила:
- Извинись за пропущенный звонок
- Уточни, по какому вопросу звонил клиент
- Предложи помощь прямо сейчас
- Если вопрос решен - уточни, нужна ли дополнительная помощь
- Предложи удобное время для повторного звонка при необходимости`
  }
]

const mockOutgoingNumbers = [
  { id: 'num-1', number: '+7 (495) 123-45-67', description: 'Основной номер', status: 'active' },
  { id: 'num-2', number: '+7 (499) 987-65-43', description: 'Дополнительный номер', status: 'active' },
  { id: 'num-3', number: '+7 (800) 555-35-35', description: 'Бесплатная линия', status: 'active' },
  { id: 'num-4', number: '+7 (495) 777-77-77', description: 'Корпоративный', status: 'inactive' },
  { id: 'num-5', number: '+7 (499) 111-22-33', description: 'Тестовый номер', status: 'active' }
]

const mockVoices = [
  { id: 'voice-1', name: 'Женский дружелюбный', description: 'Теплый, располагающий' },
  { id: 'voice-2', name: 'Мужской деловой', description: 'Уверенный, профессиональный' },
  { id: 'voice-3', name: 'Женский энергичный', description: 'Активный, позитивный' },
  { id: 'voice-4', name: 'Мужской спокойный', description: 'Размеренный, вдумчивый' }
]

const mockABTests: ABTest[] = [
  {
    id: 'ab-1',
    name: 'Тест приветствия v2',
    description: 'Сравнение стандартного и персонализированного приветствия',
    status: 'active',
    variantA: 'Стандартное приветствие',
    variantB: 'Персонализированное приветствие',
    splitRatio: 50,
    callsCount: 1234
  },
  {
    id: 'ab-2',
    name: 'Тест длительности разговора',
    description: 'Короткий vs развернутый сценарий',
    status: 'active',
    variantA: 'Короткий сценарий',
    variantB: 'Развернутый сценарий',
    splitRatio: 50,
    callsCount: 567
  },
  {
    id: 'ab-3',
    name: 'Тест голосов агентов',
    description: 'Сравнение мужского и женского голоса для целевой аудитории',
    status: 'draft',
    variantA: 'Мужской голос',
    variantB: 'Женский голос',
    splitRatio: 50
  },
  {
    id: 'ab-4',
    name: 'Тест времени звонка',
    description: 'Оптимальное время для звонков: утро vs вечер',
    status: 'draft',
    variantA: 'Утренние звонки',
    variantB: 'Вечерние звонки',
    splitRatio: 50
  }
]

export default function NewCompanyPage() {
  const router = useRouter()
  const [form, setForm] = useState<CampaignForm>({
    name: '',
    description: '',
    companyId: `CMP-${Date.now().toString(36).toUpperCase()}`,
    baseType: '',
    agent: '',
    voice: '',
    serviceReady: false,
    balanceOk: false,
    telephonyOk: false,
    serviceAvailable: false,
    testPhone: '',
    isTestCalling: false,
    // A/B тестирование
    isABTestEnabled: false,
    agentA: '',
    agentB: '',
    trafficSplit: 50,
    callWindow: {
      start: '09:00',
      end: '20:00'
    },
    retryPolicy: {
      maxAttempts: 3,
      delayMinutes: 60
    },
    createNewAgent: false,
    newAgentName: '',
    newAgentDescription: '',
    newAgentPrompt: '',
    agentTestStatus: 'idle',
    agentTestFeedback: '',
    outgoingNumber: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isCheckingService, setIsCheckingService] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [testCallStatus, setTestCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle')
  const [showABTests, setShowABTests] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [showCreateABTest, setShowCreateABTest] = useState(false)
  const [showCreateAgent, setShowCreateAgent] = useState(false)
  const [showABTestSelection, setShowABTestSelection] = useState(false)
  const [showABTestCreation, setShowABTestCreation] = useState(false)
  const [newABTest, setNewABTest] = useState({
    name: '',
    description: '',
    variantA: '',
    variantB: '',
    splitRatio: 50
  })

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
    // Автоматическая проверка готовности при монтировании на резюме
    if (currentStep === 4) {
      checkServiceReadiness()
    }
  }, [currentStep])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleInputChange('knowledgeDoc', file)
    }
  }

  const handleTestCall = () => {
    if (!form.testPhone) return
    
    setTestCallStatus('calling')
    handleInputChange('isTestCalling', true)
    
    // Симуляция звонка
    setTimeout(() => {
      setTestCallStatus('connected')
      
      // Завершение через 5 секунд
      setTimeout(() => {
        setTestCallStatus('ended')
        handleInputChange('isTestCalling', false)
        
        // Возврат к idle через 2 секунды
        setTimeout(() => {
          setTestCallStatus('idle')
        }, 2000)
      }, 5000)
    }, 2000)
  }

  const startVoiceCall = async () => {
    try {
      setIsRecording(true)
      
      // Здесь была бы интеграция с Web Audio API
      // Для демо просто симулируем
      setTimeout(() => {
        handleInputChange('testPhone', '+7 900 123-45-67')
        setIsRecording(false)
      }, 3000)
    } catch (error) {
      console.error('Ошибка записи:', error)
      setIsRecording(false)
    }
  }


  const handleTestAgent = () => {
    // Открываем модальное окно вместо симуляции
    setIsCallModalOpen(true)
    handleInputChange('agentTestStatus', 'passed')
    handleInputChange('agentTestFeedback', 'Агент успешно протестирован. Все системы работают корректно.')
  }

  const handleCreateAgent = () => {
    // Сохраняем нового агента
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: form.newAgentName,
      description: form.newAgentDescription,
      baseType: form.baseType as BaseType,
      prompt: form.newAgentPrompt || 'Настройки агента не указаны.'
    }
    mockAgents.push(newAgent)
    handleInputChange('agent', newAgent.id)
    handleInputChange('createNewAgent', false)
    setShowCreateAgent(false)
  }

  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1:
        return form.name.trim() !== ''
      case 2:
        return form.callWindow.start !== '' && form.callWindow.end !== ''
      case 3:
        return form.agent !== '' && 
               form.voice !== '' && 
               form.serviceReady
      case 4:
        return form.outgoingNumber !== '' // Исходящий номер обязателен
      default:
        return false
    }
  }

  const isFormValid = () => {
    return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3) && isStepCompleted(4)
  }

  const handleSave = async () => {
    setIsLoading(true)
    
    // Имитация сохранения
    setTimeout(() => {
      setIsLoading(false)
      router.push('/companies')
    }, 1500)
  }

  const steps = [
    { id: 1, name: 'Название и настройки', icon: Settings },
    { id: 2, name: 'Время и повторы', icon: Clock },
    { id: 3, name: 'Настройка Агента', icon: Mic },
    { id: 4, name: 'Резюме', icon: CheckCircle }
  ]

  return (
    <>
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
                  <div className={`w-20 h-0.5 mx-4 ${
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
          {/* Шаг 1: Название компании и A/B тест */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Название кампании и настройки</CardTitle>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Введите понятное название для идентификации компании
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="description">Описание кампании *</Label>
                  <Textarea
                    id="description"
                    placeholder="Опишите цель и задачи кампании обзвона..."
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Введите описание кампании для лучшего понимания ее целей
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Шаг 2: Время и повторы */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Время звонков и политика повторов
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Окно дозвона</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="start-time" className="text-sm text-gray-600">Начало</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={form.callWindow.start}
                        onChange={(e) => handleInputChange('callWindow', { ...form.callWindow, start: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time" className="text-sm text-gray-600">Окончание</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={form.callWindow.end}
                        onChange={(e) => handleInputChange('callWindow', { ...form.callWindow, end: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Укажите временной промежуток для совершения звонков
                  </p>
                </div>

                <Separator />

                <div>
                  <Label>Политика повторов</Label>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label htmlFor="max-attempts" className="text-sm text-gray-600">
                        Максимальное количество попыток
                      </Label>
                      <Select 
                        value={form.retryPolicy.maxAttempts.toString()} 
                        onValueChange={(value) => handleInputChange('retryPolicy', { ...form.retryPolicy, maxAttempts: parseInt(value) })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 попытка</SelectItem>
                          <SelectItem value="2">2 попытки</SelectItem>
                          <SelectItem value="3">3 попытки</SelectItem>
                          <SelectItem value="4">4 попытки</SelectItem>
                          <SelectItem value="5">5 попыток</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="retry-delay" className="text-sm text-gray-600">
                        Задержка между попытками (минуты)
                      </Label>
                      <Select 
                        value={form.retryPolicy.delayMinutes.toString()} 
                        onValueChange={(value) => handleInputChange('retryPolicy', { ...form.retryPolicy, delayMinutes: parseInt(value) })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 минут</SelectItem>
                          <SelectItem value="60">1 час</SelectItem>
                          <SelectItem value="120">2 часа</SelectItem>
                          <SelectItem value="240">4 часа</SelectItem>
                          <SelectItem value="1440">24 часа</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Настройте, сколько раз и с какими интервалами повторять звонки при недозвоне
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Шаг 3: Настройка Агента */}
          {currentStep === 3 && (
            <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Настройка агента
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Переключатель режима кампании */}
                <div className="space-y-4">
                  <Label>Режим кампании</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('isABTestEnabled', false)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        !form.isABTestEnabled 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <UserCheck className="h-5 w-5 mx-auto mb-2" />
                      <div className="font-medium">1 кампания</div>
                      <div className="text-xs mt-1">Один агент для всех звонков</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleInputChange('isABTestEnabled', true)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        form.isABTestEnabled 
                          ? 'border-teal-500 bg-teal-50 text-teal-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <FlaskConical className="h-5 w-5 mx-auto mb-2" />
                      <div className="font-medium">А/Б тест</div>
                      <div className="text-xs mt-1">Сравнение двух агентов</div>
                    </button>
                  </div>
                </div>

                <Separator />
                
                {/* Интерфейс для одной кампании */}
                {!form.isABTestEnabled && (
                  <div className="space-y-4">
                    <div>
                      <Label>Выберите агента *</Label>
                      <Select value={form.agent} onValueChange={(value) => handleInputChange('agent', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Выберите агента для звонков" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAgents
                            .map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                <div>
                                  <div className="font-medium">{agent.name}</div>
                                  <div className="text-xs text-gray-500">{agent.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Описание выбранного агента */}
                      {form.agent && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{mockAgents.find(a => a.id === form.agent)?.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {mockAgents.find(a => a.id === form.agent)?.description}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {}}
                            >
                              <Volume2 className="h-4 w-4 mr-1" />
                              Прослушать
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Интерфейс для A/B теста */}
                {form.isABTestEnabled && (
                    <div className="space-y-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="agent-a">Агент A *</Label>
                          <Select value={form.agentA} onValueChange={(value) => handleInputChange('agentA', value)}>
                            <SelectTrigger id="agent-a" className="mt-1">
                              <SelectValue placeholder="Выберите агента A" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockAgents
                                .filter(agent => agent.id !== form.agentB)
                                .map((agent) => (
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
                          <Label htmlFor="agent-b">Агент B *</Label>
                          <Select value={form.agentB} onValueChange={(value) => handleInputChange('agentB', value)}>
                            <SelectTrigger id="agent-b" className="mt-1">
                              <SelectValue placeholder="Выберите агента B" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockAgents
                                .filter(agent => agent.id !== form.agentA)
                                .map((agent) => (
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
                      </div>
                      
                      <div>
                        <Label htmlFor="traffic-split">Распределение трафика</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm font-medium">Агент A: {form.trafficSplit}%</span>
                          <input
                            id="traffic-split"
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={form.trafficSplit}
                            onChange={(e) => handleInputChange('trafficSplit', parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">Агент B: {100 - form.trafficSplit}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Укажите, какой процент звонков будет направлен на каждого агента
                        </p>
                      </div>
                      
                      {/* Описания выбранных агентов */}
                      {form.agentA && form.agentB && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-3 bg-white rounded-lg border">
                            <h4 className="font-medium text-sm mb-1">
                              Агент A: {mockAgents.find(a => a.id === form.agentA)?.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {mockAgents.find(a => a.id === form.agentA)?.description}
                            </p>
                          </div>
                          <div className="p-3 bg-white rounded-lg border">
                            <h4 className="font-medium text-sm mb-1">
                              Агент B: {mockAgents.find(a => a.id === form.agentB)?.name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {mockAgents.find(a => a.id === form.agentB)?.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Инлайн-тест агента */}
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center">
                      <Headphones className="h-4 w-4 mr-2" />
                      Тестирование агента
                    </h3>
                    {form.agentTestStatus === 'passed' && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Пройдено
                      </Badge>
                    )}
                    {form.agentTestStatus === 'failed' && (
                      <Badge className="bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Есть замечания
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={handleTestAgent}
                      disabled={!form.agent || form.agentTestStatus === 'testing'}
                      className="w-full"
                    >
                      {form.agentTestStatus === 'idle' && (
                        <>
                          <Phone className="h-4 w-4 mr-2" />
                          Тестовый звонок агента
                        </>
                      )}
                      {form.agentTestStatus === 'testing' && (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Тестирование...
                        </>
                      )}
                      {(form.agentTestStatus === 'passed' || form.agentTestStatus === 'failed') && (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Повторить тест
                        </>
                      )}
                    </Button>
                    
                    {form.agentTestFeedback && (
                      <div className={`p-3 rounded-lg border ${
                        form.agentTestStatus === 'passed' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <p className={`text-sm ${
                          form.agentTestStatus === 'passed' 
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          {form.agentTestFeedback}
                        </p>
                        {form.agentTestStatus === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => setCurrentStep(3)}
                          >
                            <ArrowLeft className="h-3 w-3 mr-1" />
                            Назад к настройке агента
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            </>
          )}

          {/* Шаг 4: Резюме */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Резюме компании
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Company ID</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCompanyId}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Скопировано
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Копировать
                        </>
                      )}
                    </Button>
                  </div>
                  <code className="text-2xl font-mono font-bold text-blue-900">
                    {form.companyId}
                  </code>
                  <p className="text-sm text-blue-700 mt-2">
                    Используйте этот ID для интеграции с ERP системой
                  </p>
                </div>

                <Separator />

                {/* Обязательное поле - Исходящий номер */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Label htmlFor="outgoing-number">Исходящий номер *</Label>
                  <Select 
                    value={form.outgoingNumber} 
                    onValueChange={(value) => handleInputChange('outgoingNumber', value)}
                  >
                    <SelectTrigger id="outgoing-number" className="mt-2">
                      <SelectValue placeholder="Выберите номер для исходящих звонков" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockOutgoingNumbers
                        .filter(num => num.status === 'active')
                        .map((num) => (
                          <SelectItem key={num.id} value={num.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{num.number}</span>
                              <span className="text-xs text-gray-500 ml-2">{num.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-2">
                    Номер Asterisk, с которого будут совершаться исходящие звонки
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Название компании</p>
                    <p className="font-medium text-lg">{form.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Режим кампании</p>
                    <p className="font-medium flex items-center">
                      {form.isABTestEnabled ? (
                        <>
                          <FlaskConical className="h-4 w-4 mr-2 text-teal-600" />
                          А/Б тест
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                          1 кампания
                        </>
                      )}
                    </p>
                  </div>

                  {form.isABTestEnabled ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Агенты для тестирования</p>
                      <div className="bg-teal-50 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600">Агент A ({form.trafficSplit}%)</p>
                            <p className="font-medium">
                              {mockAgents.find(a => a.id === form.agentA)?.name || 'Не выбран'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Агент B ({100 - form.trafficSplit}%)</p>
                            <p className="font-medium">
                              {mockAgents.find(a => a.id === form.agentB)?.name || 'Не выбран'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Выбранный агент</p>
                      <p className="font-medium">
                        {mockAgents.find(a => a.id === form.agent)?.name || 'Не выбран'}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600">Исходящий номер</p>
                    <p className="font-medium">
                      {mockOutgoingNumbers.find(n => n.id === form.outgoingNumber)?.number || 'Не выбран'}
                    </p>
                  </div>


                  {form.knowledgeDoc && (
                    <div>
                      <p className="text-sm text-gray-600">Документ знаний</p>
                      <p className="font-medium">{form.knowledgeDoc.name}</p>
                    </div>
                  )}
                </div>

                {/* Проверка готовности сервиса */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Готовность сервиса</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={checkServiceReadiness}
                    disabled={isCheckingService}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingService ? 'animate-spin' : ''}`} />
                    Обновить статусы
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          {form.balanceOk ? '> 0 ₽' : 'Недостаточно средств'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* API/Интеграции */}
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
                        <p className="font-medium">API/Интеграции</p>
                        <p className="text-sm text-gray-600">
                          {form.serviceAvailable ? 'Доступны' : 'Ограниченный доступ'}
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

                {form.serviceReady && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Все системы готовы</p>
                        <p className="text-sm text-green-700 mt-1">
                          Сервис готов к запуску компании.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Редактировать
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading || !isFormValid()}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Создать компанию
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-4">
          {/* Прогресс */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Прогресс создания</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center justify-between">
                  <span className="text-sm">{step.name}</span>
                  {isStepCompleted(step.id) ? (
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  ) : currentStep === step.id ? (
                    <Badge className="bg-blue-100 text-blue-800">...</Badge>
                  ) : (
                    <Badge variant="outline">—</Badge>
                  )}
                </div>
              ))}
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

          {/* Подсказки */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Подсказка</CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <p className="text-sm text-gray-600">
                  Выберите понятное название для вашей кампании.
                </p>
              )}
              {currentStep === 2 && (
                <p className="text-sm text-gray-600">
                  Агент и голос определяют, как будет звучать и вести себя ваш виртуальный помощник.
                </p>
              )}
              {currentStep === 3 && (
                <p className="text-sm text-gray-600">
                  Чем подробнее инструкции, тем эффективнее агент будет общаться с клиентами.
                </p>
              )}
              {currentStep === 4 && (
                <p className="text-sm text-gray-600">
                  После создания компании передайте Company ID в вашу ERP систему для привязки контактов.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Call Test Modal */}
      <CallTestModal 
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        agentName={mockAgents.find(a => a.id === form.agent)?.name || 'AI Agent'}
      />
    </div>
    </>
  )
}
