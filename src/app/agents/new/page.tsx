'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Save,
  Play,
  Volume2,
  Settings,
  MessageSquare,
  User,
  AlertCircle,
  FileUp,
  Phone,
  Shield,
  Eye,
  Mic,
  CheckSquare
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { mockVoices, mockVoiceLibrary } from '@/lib/mock-data'
import { Agent, BaseType } from '@/lib/types'
import { CallTestModal } from '@/components/call-test-modal'

interface AgentForm {
  name: string
  description: string
  role: string
  baseType: BaseType | ''
  voiceId: string
  responseDelay: number
  interruptionHandling: boolean
  basePrompt: string
  kbFileName?: string | null
  testPhone?: string
  // Новые поля для структурированного промтинга
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
  model?: string
  additionalContext?: string
}

const agentRoles = [
  { id: 'registration_agent', name: 'Агент регистрации', description: 'Помогает новым пользователям зарегистрироваться' },
  { id: 'reactivation_agent', name: 'Агент реактивации', description: 'Возвращает неактивных клиентов' },
  { id: 'cold_calling_agent', name: 'Агент холодных звонков', description: 'Работает с новыми лидами' }
]

export default function NewAgentPage() {
  const router = useRouter()
  const [form, setForm] = useState<AgentForm>({
    name: '',
    description: '',
    role: '',
    baseType: '',
    voiceId: '',
    responseDelay: 500,
    interruptionHandling: true,
    basePrompt: '',
    kbFileName: null,
    testPhone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'in_call'>('idle')
  const [testInput, setTestInput] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isVoiceCall, setIsVoiceCall] = useState(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const recognitionRef = useRef<any | null>(null)

  const handleInputChange = (field: keyof AgentForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async (asDraft = true) => {
    setIsLoading(true)
    
    // Имитация сохранения
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Saving agent:', { ...form, status: asDraft ? 'inactive' : 'active' })
    
    setIsLoading(false)
    router.push('/agents')
  }

  const isStepCompleted = (step: number) => {
    switch (step) {
      case 1:
        return form.name && form.description && form.role && form.baseType
      case 2:
        return form.voiceId
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  const getVoiceById = (voiceId: string) => {
    return mockVoices.find(v => v.id === voiceId)
  }

  const getRoleById = (roleId: string) => {
    return agentRoles.find(r => r.id === roleId)
  }

  // Голосовой режим через микрофон (без телефонии)
  const startVoiceCall = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) {
      alert('Браузер не поддерживает распознавание речи')
      return
    }
    const rec = new SR()
    rec.lang = 'ru-RU'
    rec.continuous = true
    rec.interimResults = false
    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(' ')
      if (transcript) {
        const response = form.basePrompt
          ? `Ответ агента (по инструкции): ${form.basePrompt.slice(0, 60)}...`
          : 'Ответ агента: готов к работе.'
        setTestResponse(`${transcript} → ${response}`)
      }
    }
    rec.onend = () => {
      if (isVoiceCall) rec.start()
    }
    rec.start()
    recognitionRef.current = rec
    setIsVoiceCall(true)
    setCallStatus('in_call')
  }

  const stopVoiceCall = () => {
    try { recognitionRef.current?.stop?.() } catch {}
    recognitionRef.current = null
    setIsVoiceCall(false)
  }

  const steps = [
    { id: 1, name: 'Роль/этап', icon: User },
    { id: 2, name: 'Голос (TTS)', icon: Volume2 },
    { id: 3, name: 'Промтинг', icon: MessageSquare },
    { id: 4, name: 'Итоги', icon: CheckSquare }
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
              Создание агента
            </h1>
            <p className="text-gray-600">
              Настройте параметры AI-агента для обзвонов
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => handleSave(true)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить как черновик
          </Button>
          <Button onClick={() => handleSave(false)} disabled={isLoading || !isStepCompleted(3)}>
            <Play className="h-4 w-4 mr-2" />
            Создать и активировать
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
          {/* Шаг 1: Роль/этап */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Роль и базовая информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name">Название агента *</Label>
                  <Input
                    id="name"
                    placeholder="Например: Анна - Регистрация"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Описание *</Label>
                  <Textarea
                    id="description"
                    placeholder="Опишите назначение и особенности агента..."
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Роль агента *</Label>
                  <Select value={form.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Выберите роль агента" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div>
                            <div className="font-medium">{role.name}</div>
                            <div className="text-xs text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Шаг 2: Выбор голоса */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Volume2 className="h-5 w-5 mr-2" />
                  Выбор голоса
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockVoiceLibrary.categories.map((category) => (
                  <div key={category.id}>
                    <h3 className="font-medium text-gray-900 mb-3">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.voiceIds.map((voiceId) => {
                        const voice = getVoiceById(voiceId)
                        if (!voice) return null
                        
                        return (
                          <Card 
                            key={voice.id} 
                            className={`cursor-pointer transition-colors ${
                              form.voiceId === voice.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleInputChange('voiceId', voice.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{voice.name}</h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {voice.gender === 'male' ? 'Мужской' : 'Женский'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {voice.style}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {voice.provider}
                                    </Badge>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Play className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                    {category.id !== mockVoiceLibrary.categories[mockVoiceLibrary.categories.length - 1].id && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Шаг 3: Промтинг и настройки */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Системные инструкции */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Системные инструкции</Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Ты отвечаешь только тогда когда сообщение начинается с Мия, если не это условие не выполнено не пиши в ответе ни чего просто ставь пробел
Режим 1: Ответ по триггеру"
                  value={form.basePrompt}
                  onChange={(e) => handleInputChange('basePrompt', e.target.value)}
                  className="min-h-[120px] font-mono text-sm bg-gray-50 border-gray-200"
                />
              </div>

              {/* Модель */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Модель</Label>
                <Select
                  value={form.model || 'gpt-4o'}
                  onValueChange={(value) => handleInputChange('model', value)}
                >
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">gpt-4o-2024-11-20</SelectItem>
                    <SelectItem value="gpt-4">gpt-4-turbo</SelectItem>
                    <SelectItem value="gpt-3.5">gpt-3.5-turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Документы */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-4">ДОКУМЕНТЫ</h3>
                
                {/* Документ знаний */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <FileUp className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Документ знаний</Label>
                      <p className="text-xs text-gray-600">
                        {form.kbFileName || 'Загрузить базу знаний'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    + Файлы
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".txt,.pdf,.md"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      handleInputChange('kbFileName', f ? f.name : null)
                    }}
                  />
                </div>
              </div>
              
              {/* Финальный тест */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-4">ФИНАЛЬНЫЙ ТЕСТ</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Номер для теста</Label>
                    <div className="mt-2 flex space-x-2">
                      <Input
                        placeholder="Например: +7 900 000-00-00"
                        value={form.testPhone}
                        onChange={(e) => handleInputChange('testPhone', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          setCallStatus('calling')
                          setTimeout(() => setCallStatus('ringing'), 600)
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Запустить
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCallModalOpen(true)}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Говорить через микрофон
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Статус: Готов к вызову
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Шаг 4: Итоговые настройки */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2" />
                  Итоговые настройки
                </CardTitle>
                <CardDescription>
                  Проверьте все настройки перед сохранением агента
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Основная информация */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Основная информация</h3>
                  <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Название:</span>
                      <span className="text-sm font-medium">{form.name || 'Не указано'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Описание:</span>
                      <span className="text-sm font-medium">{form.description || 'Не указано'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Роль:</span>
                      <span className="text-sm font-medium">
                        {agentRoles.find(r => r.id === form.role)?.name || 'Не выбрана'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Голос */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Голос и TTS</h3>
                  <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Голос:</span>
                      <span className="text-sm font-medium">
                        {mockVoices.find(v => v.id === form.voiceId)?.name || 'Не выбран'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Задержка ответа:</span>
                      <span className="text-sm font-medium">{form.responseDelay} мс</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Обработка прерываний:</span>
                      <span className="text-sm font-medium">
                        {form.interruptionHandling ? 'Включена' : 'Выключена'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Промптинг */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Системные инструкции</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {form.basePrompt || 'Не заданы'}
                    </p>
                  </div>
                </div>

                {/* Документы */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Документы</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">База знаний:</span>
                      <span className="text-sm font-medium">
                        {form.kbFileName || 'Не загружена'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Кнопка сохранения */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSave(true)}
                    disabled={isLoading}
                  >
                    Сохранить как черновик
                  </Button>
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={isLoading || !isStepCompleted(1) || !isStepCompleted(2)}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Сохранить и активировать
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Предпросмотр агента */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Предпросмотр агента</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Название</p>
                <p className="font-medium">{form.name || 'Без названия'}</p>
              </div>

              {form.description && (
                <div>
                  <p className="text-sm text-gray-600">Описание</p>
                  <p className="text-sm">{form.description}</p>
                </div>
              )}

              {form.role && (
                <div>
                  <p className="text-sm text-gray-600">Роль</p>
                  <p className="font-medium">{getRoleById(form.role)?.name}</p>
                </div>
              )}

              {form.voiceId && (
                <div>
                  <p className="text-sm text-gray-600">Голос</p>
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{getVoiceById(form.voiceId)?.name}</span>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Настройки</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Задержка ответа:</span>
                    <span>{form.responseDelay} мс</span>
                  </div>
                  {/* Макс. тишина удалена */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Прерывания:</span>
                    <span>{form.interruptionHandling ? 'Включены' : 'Отключены'}</span>
                  </div>
                  {form.basePrompt && (
                    <div className="text-xs text-gray-600 mt-2">Инструкция задана</div>
                  )}
                  {form.kbFileName && (
                    <div className="text-xs text-gray-600">Документ: {form.kbFileName}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Навигация между шагами */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Предыдущий шаг
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              disabled={currentStep === 4 || !isStepCompleted(currentStep)}
            >
              Следующий шаг
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Call Test Modal */}
      <CallTestModal 
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        agentName={form.name || 'AI Agent'}
      />
    </div>
  )
}
