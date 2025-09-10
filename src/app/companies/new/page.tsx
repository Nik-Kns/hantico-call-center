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
  Edit
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BaseType } from '@/lib/types'

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
  companyId: string
  baseType: BaseType | ''
  agent: string
  voice: string
  instructions: string
  knowledgeDoc?: File
  serviceReady: boolean
  balanceOk: boolean
  telephonyOk: boolean
  serviceAvailable: boolean
  testPhone: string
  isTestCalling: boolean
  selectedABTest?: ABTest
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
}

const mockAgents = [
  { id: 'anna-1', name: 'Анна', description: 'Продажи и консультации', baseType: 'registration' as BaseType },
  { id: 'mikhail-2', name: 'Михаил', description: 'Поддержка и помощь', baseType: 'no_answer' as BaseType },
  { id: 'elena-3', name: 'Елена', description: 'Опросы и исследования', baseType: 'refusals' as BaseType },
  { id: 'dmitry-4', name: 'Дмитрий', description: 'Информирование', baseType: 'reactivation' as BaseType },
  { id: 'olga-5', name: 'Ольга', description: 'Регистрация новых клиентов', baseType: 'registration' as BaseType },
  { id: 'ivan-6', name: 'Иван', description: 'Работа с недозвонами', baseType: 'no_answer' as BaseType }
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
    companyId: `CMP-${Date.now().toString(36).toUpperCase()}`,
    baseType: '',
    agent: '',
    voice: '',
    instructions: '',
    serviceReady: false,
    balanceOk: false,
    telephonyOk: false,
    serviceAvailable: false,
    testPhone: '',
    isTestCalling: false,
    selectedABTest: undefined,
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
    agentTestFeedback: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isCheckingService, setIsCheckingService] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [testCallStatus, setTestCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle')
  const [showABTests, setShowABTests] = useState(false)
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
    // Автоматическая проверка готовности при монтировании на 3 шаге
    if (currentStep === 3) {
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

  const handleSelectABTest = (test: ABTest) => {
    handleInputChange('selectedABTest', test)
    setShowABTests(false)
  }

  const handleRemoveABTest = () => {
    handleInputChange('selectedABTest', undefined)
  }

  const handleTestAgent = () => {
    handleInputChange('agentTestStatus', 'testing')
    
    // Симуляция теста агента
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3
      handleInputChange('agentTestStatus', isSuccess ? 'passed' : 'failed')
      handleInputChange('agentTestFeedback', 
        isSuccess 
          ? 'Агент успешно протестирован. Все системы работают корректно.'
          : 'Обнаружены проблемы: голос не распознан. Проверьте настройки.'
      )
    }, 3000)
  }

  const handleCreateAgent = () => {
    // Сохраняем нового агента
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: form.newAgentName,
      description: form.newAgentDescription,
      baseType: form.baseType as BaseType
    }
    mockAgents.push(newAgent)
    handleInputChange('agent', newAgent.id)
    handleInputChange('createNewAgent', false)
    setShowCreateAgent(false)
  }

  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1:
        return form.name.trim() !== '' && form.baseType !== ''
      case 2:
        return form.callWindow.start !== '' && form.callWindow.end !== ''
      case 3:
        return (form.agent !== '' || (form.createNewAgent && form.newAgentName !== '')) && 
               form.voice !== '' && 
               form.instructions.trim() !== '' && 
               form.serviceReady
      case 4:
        return true // A/B тесты опциональны
      case 5:
        return true // Резюме всегда доступно
      default:
        return false
    }
  }

  const isFormValid = () => {
    return isStepCompleted(1) && isStepCompleted(2) && isStepCompleted(3)
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
    { id: 1, name: 'Название и тип', icon: Settings },
    { id: 2, name: 'Время и повторы', icon: Clock },
    { id: 3, name: 'Настройка Агента', icon: Mic },
    { id: 4, name: 'A/B тесты', icon: FlaskConical },
    { id: 5, name: 'Резюме', icon: CheckCircle }
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
          {/* Шаг 1: Название компании */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Название и тип кампании</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="baseType">Тип кампании *</Label>
                  <Select value={form.baseType} onValueChange={(value) => {
                    handleInputChange('baseType', value as BaseType)
                    // Сбрасываем выбранного агента при смене типа
                    if (form.agent) {
                      const agent = mockAgents.find(a => a.id === form.agent)
                      if (agent && agent.baseType !== value) {
                        handleInputChange('agent', '')
                      }
                    }
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите тип кампании" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registration">Регистрация</SelectItem>
                      <SelectItem value="no_answer">Недозвон</SelectItem>
                      <SelectItem value="refusals">Отказники</SelectItem>
                      <SelectItem value="reactivation">Отклики/реактивация</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Тип кампании определяет, какие агенты будут доступны
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

          {/* Шаг 3: Настройка Агента (объединенный) */}
          {currentStep === 3 && (
            <>
            {/* Выбор агента и голоса */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Настройка агента
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Выберите или создайте агента *</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={form.createNewAgent ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          handleInputChange('createNewAgent', !form.createNewAgent)
                          if (!form.createNewAgent) {
                            handleInputChange('agent', '')
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Создать нового
                      </Button>
                    </div>
                  </div>
                  
                  {!form.baseType ? (
                    <div className="mt-1 p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Сначала выберите тип кампании на первом шаге
                      </p>
                    </div>
                  ) : form.createNewAgent ? (
                    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <Label htmlFor="new-agent-name">Имя агента *</Label>
                        <Input
                          id="new-agent-name"
                          placeholder="Например: Анна"
                          value={form.newAgentName}
                          onChange={(e) => handleInputChange('newAgentName', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-agent-desc">Описание агента</Label>
                        <Input
                          id="new-agent-desc"
                          placeholder="Например: Дружелюбный консультант"
                          value={form.newAgentDescription}
                          onChange={(e) => handleInputChange('newAgentDescription', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-agent-prompt">Системный промт агента *</Label>
                        <Textarea
                          id="new-agent-prompt"
                          placeholder="Введите инструкции для поведения агента..."
                          value={form.newAgentPrompt}
                          onChange={(e) => handleInputChange('newAgentPrompt', e.target.value)}
                          className="mt-1 min-h-[120px]"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={handleCreateAgent}
                          disabled={!form.newAgentName || !form.newAgentPrompt}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Сохранить агента
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleInputChange('createNewAgent', false)
                            handleInputChange('newAgentName', '')
                            handleInputChange('newAgentDescription', '')
                            handleInputChange('newAgentPrompt', '')
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Select value={form.agent} onValueChange={(value) => handleInputChange('agent', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Выберите агента для звонков" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAgents
                            .filter(agent => agent.baseType === form.baseType)
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
                      <p className="text-xs text-gray-500 mt-1">
                        Доступны только агенты для типа кампании &quot;{form.baseType === 'registration' ? 'Регистрация' : form.baseType === 'no_answer' ? 'Недозвон' : form.baseType === 'refusals' ? 'Отказники' : 'Отклики/реактивация'}&quot;
                      </p>
                    </>
                  )}
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
                  <Button variant="outline" size="sm" className="mt-2">
                    Прослушать образец
                  </Button>
                </div>

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

            {/* Инструкция и документ знаний */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Инструкция и база знаний
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <Separator />

                <div>
                  <Label htmlFor="knowledge">Документ знаний (опционально)</Label>
                  <div className="mt-1">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            {form.knowledgeDoc 
                              ? form.knowledgeDoc.name 
                              : 'Нажмите для загрузки документа'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, DOCX, TXT до 10MB
                          </p>
                        </div>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Загрузите документ с дополнительной информацией о продукте или услуге
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Проверка готовности */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2" />
                    Проверка готовности
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
              <CardContent className="space-y-6">
                {/* Проверка готовности сервиса */}
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
              </CardContent>
            </Card>
            </>
          )}

          {/* Шаг 4: A/B тесты */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FlaskConical className="h-5 w-5 mr-2" />
                  A/B тестирование
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Настройте A/B тесты для сравнения эффективности разных сценариев и агентов (опционально)
                </p>
                
                {form.selectedABTest ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-blue-900">{form.selectedABTest.name}</h4>
                          <Badge className={form.selectedABTest.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {form.selectedABTest.status === 'active' ? 'Активен' : 'Черновик'}
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">
                          {form.selectedABTest.description}
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-white/50 rounded px-3 py-2">
                            <span className="font-medium">Вариант A:</span>
                            <p className="text-gray-700">{form.selectedABTest.variantA}</p>
                          </div>
                          <div className="bg-white/50 rounded px-3 py-2">
                            <span className="font-medium">Вариант B:</span>
                            <p className="text-gray-700">{form.selectedABTest.variantB}</p>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-blue-600">
                          Распределение трафика: {form.selectedABTest.splitRatio}% / {100 - form.selectedABTest.splitRatio}%
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveABTest}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowABTestSelection(true)
                          setShowABTestCreation(false)
                        }}
                      >
                        Изменить тест
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-4">
                        A/B тесты помогут определить наиболее эффективные сценарии и агентов
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowABTestSelection(!showABTestSelection)
                            setShowABTestCreation(false)
                          }}
                          className="flex-1"
                        >
                          <FlaskConical className="h-4 w-4 mr-2" />
                          Выбрать A/B тест
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowABTestCreation(!showABTestCreation)
                            setShowABTestSelection(false)
                          }}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Создать новый A/B тест
                        </Button>
                      </div>
                    </div>

                    {/* Интерфейс выбора A/B теста */}
                    {showABTestSelection && (
                      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                        <h4 className="font-medium flex items-center">
                          <FlaskConical className="h-4 w-4 mr-2" />
                          Доступные A/B тесты
                        </h4>
                        <div className="space-y-3">
                          {mockABTests.map((test) => (
                            <div key={test.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                                 onClick={() => handleSelectABTest(test)}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="font-medium">{test.name}</h5>
                                    <Badge className={test.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                      {test.status === 'active' ? 'Активен' : 'Черновик'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>Вариант A: {test.variantA}</span>
                                    <span>•</span>
                                    <span>Вариант B: {test.variantB}</span>
                                    <span>•</span>
                                    <span>Распределение: {test.splitRatio}%/{100-test.splitRatio}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Интерфейс создания нового A/B теста */}
                    {showABTestCreation && (
                      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-4">
                        <h4 className="font-medium flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Создание нового A/B теста
                        </h4>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="ab-test-name">Название теста *</Label>
                            <Input
                              id="ab-test-name"
                              placeholder="Например: Тест приветствия"
                              value={newABTest.name}
                              onChange={(e) => setNewABTest({...newABTest, name: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="ab-test-desc">Описание теста</Label>
                            <Textarea
                              id="ab-test-desc"
                              placeholder="Опишите цель и гипотезу теста"
                              value={newABTest.description}
                              onChange={(e) => setNewABTest({...newABTest, description: e.target.value})}
                              className="mt-1 min-h-[80px]"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="variant-a">Вариант A *</Label>
                              <Input
                                id="variant-a"
                                placeholder="Описание варианта A"
                                value={newABTest.variantA}
                                onChange={(e) => setNewABTest({...newABTest, variantA: e.target.value})}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="variant-b">Вариант B *</Label>
                              <Input
                                id="variant-b"
                                placeholder="Описание варианта B"
                                value={newABTest.variantB}
                                onChange={(e) => setNewABTest({...newABTest, variantB: e.target.value})}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="split-ratio">Распределение трафика</Label>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm">Вариант A: {newABTest.splitRatio}%</span>
                              <input
                                type="range"
                                min="10"
                                max="90"
                                value={newABTest.splitRatio}
                                onChange={(e) => setNewABTest({...newABTest, splitRatio: parseInt(e.target.value)})}
                                className="flex-1"
                              />
                              <span className="text-sm">Вариант B: {100 - newABTest.splitRatio}%</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => {
                                if (newABTest.name && newABTest.variantA && newABTest.variantB) {
                                  const test = {
                                    id: `ab-${Date.now()}`,
                                    ...newABTest,
                                    status: 'draft' as const
                                  }
                                  handleSelectABTest(test)
                                  setNewABTest({
                                    name: '',
                                    description: '',
                                    variantA: '',
                                    variantB: '',
                                    splitRatio: 50
                                  })
                                  setShowABTestCreation(false)
                                }
                              }}
                              disabled={!newABTest.name || !newABTest.variantA || !newABTest.variantB}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Создать и добавить
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowABTestCreation(false)
                                setNewABTest({
                                  name: '',
                                  description: '',
                                  variantA: '',
                                  variantB: '',
                                  splitRatio: 50
                                })
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 Совет: A/B тесты позволяют сравнить разные подходы и выбрать наиболее эффективный
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Шаг 5: Резюме */}
          {currentStep === 5 && (
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

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Название компании</p>
                    <p className="font-medium text-lg">{form.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Тип кампании</p>
                    <p className="font-medium">
                      {form.baseType === 'registration' ? 'Регистрация' : 
                       form.baseType === 'no_answer' ? 'Недозвон' : 
                       form.baseType === 'refusals' ? 'Отказники' : 
                       form.baseType === 'reactivation' ? 'Отклики/реактивация' : 'Не выбран'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Агент</p>
                      <p className="font-medium">
                        {mockAgents.find(a => a.id === form.agent)?.name || 'Не выбран'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Голос</p>
                      <p className="font-medium">
                        {mockVoices.find(v => v.id === form.voice)?.name || 'Не выбран'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Инструкции</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm">{form.instructions || 'Не указаны'}</p>
                    </div>
                  </div>

                  {form.knowledgeDoc && (
                    <div>
                      <p className="text-sm text-gray-600">Документ знаний</p>
                      <p className="font-medium">{form.knowledgeDoc.name}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Готовность сервиса</p>
                    <div className="flex items-center space-x-4">
                      <Badge className={form.telephonyOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        Телефония: {form.telephonyOk ? '✓' : '✗'}
                      </Badge>
                      <Badge className={form.balanceOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        Баланс: {form.balanceOk ? '✓' : '✗'}
                      </Badge>
                      <Badge className={form.serviceAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        API: {form.serviceAvailable ? '✓' : '!'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Проверка готовности сервиса */}
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
                  variant={currentStep < 5 ? 'default' : 'ghost'}
                  disabled={currentStep === 5}
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
                  Выберите понятное название и тип кампании. Тип определяет, какие агенты будут доступны.
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
                  Убедитесь, что все системы готовы перед созданием компании.
                </p>
              )}
              {currentStep === 5 && (
                <p className="text-sm text-gray-600">
                  После создания компании передайте Company ID в вашу ERP систему для привязки контактов.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}
