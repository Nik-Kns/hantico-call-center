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
  CheckSquare,
  Copy,
  FileText
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
  subtitle: string // Подзаголовок/описание назначения
  description: string
  role: string
  voiceId: string
  responseDelay: number
  interruptionHandling: boolean
  instruction: string // Инструкция (промт)
  knowledgeFiles?: File[] | null // Файлы знаний
  knowledgeFileNames?: string[] | null
  createdBy?: string // Кто создал
  model?: string
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
    subtitle: '',
    description: '',
    role: '',
    voiceId: '',
    responseDelay: 500,
    interruptionHandling: true,
    instruction: '',
    knowledgeFiles: null,
    knowledgeFileNames: null,
    createdBy: 'admin@company.com', // Мок данные
    model: 'gpt-4o'
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
        return form.name && form.subtitle && form.role
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
        const response = form.instruction
          ? `Ответ агента (по инструкции): ${form.instruction.slice(0, 60)}...`
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
          <Button 
            variant="outline" 
            onClick={() => {
              // Логика создания копии
              console.log('Создание копии агента')
            }}
            disabled={!form.name}
          >
            <Copy className="h-4 w-4 mr-2" />
            Создать копию
          </Button>
          <Button variant="outline" onClick={() => handleSave(true)} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
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
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name">Заголовок *</Label>
                  <Input
                    id="name"
                    placeholder="Например: Анна - Регистрация"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Подзаголовок/описание назначения *</Label>
                  <Input
                    id="subtitle"
                    placeholder="Краткое описание назначения агента"
                    value={form.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Роль/этап *</Label>
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

                {/* Поле "Кто создал" */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Кто создал:</span>
                    <span className="font-medium">{form.createdBy}</span>
                  </div>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Инструкция и файлы знаний
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Инструкция (промт) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Инструкция (промт)</Label>
                  <Textarea
                    id="instruction"
                    placeholder="Опишите инструкции для агента..."
                    value={form.instruction}
                    onChange={(e) => handleInputChange('instruction', e.target.value)}
                    className="min-h-[200px] font-mono text-sm bg-gray-50 border-gray-200"
                  />
                </div>


                {/* Файлы знаний */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Файлы знаний</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Перетащите файлы сюда или кликните для выбора
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('knowledge-files')?.click()}
                    >
                      Выбрать файлы
                    </Button>
                    <input
                      id="knowledge-files"
                      type="file"
                      multiple
                      className="hidden"
                      accept=".txt,.pdf,.md,.doc,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        handleInputChange('knowledgeFiles', files.length > 0 ? files : null)
                        handleInputChange('knowledgeFileNames', files.length > 0 ? files.map(f => f.name) : null)
                      }}
                    />
                    {form.knowledgeFileNames && form.knowledgeFileNames.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {form.knowledgeFileNames.map((fileName, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                            <span className="text-gray-700">{fileName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = form.knowledgeFileNames?.filter((_, i) => i !== index)
                                handleInputChange('knowledgeFileNames', newFiles?.length ? newFiles : null)
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Удалить
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              
                {/* Тестирование */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium mb-4">ТЕСТИРОВАНИЕ</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Тест по телефону */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-5 w-5 text-blue-600" />
                          <Label className="text-sm font-medium">Тест по телефону</Label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        Используется тестовый номер из интеграций
                      </p>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                          setCallStatus('calling')
                          setTimeout(() => setCallStatus('ringing'), 600)
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Запустить тест
                      </Button>
                    </Card>

                    {/* Тест через микрофон */}
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Mic className="h-5 w-5 text-green-600" />
                          <Label className="text-sm font-medium">Тест через микрофон</Label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        Голосовое взаимодействие в браузере
                      </p>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => setIsCallModalOpen(true)}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Начать разговор
                      </Button>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                      <span className="text-sm text-gray-600">Заголовок:</span>
                      <span className="text-sm font-medium">{form.name || 'Не указано'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Подзаголовок:</span>
                      <span className="text-sm font-medium">{form.subtitle || 'Не указано'}</span>
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
                      {form.instruction || 'Не заданы'}
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
                        {form.knowledgeFileNames?.[0] || 'Не загружена'}
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
                  {form.instruction && (
                    <div className="text-xs text-gray-600 mt-2">Инструкция задана</div>
                  )}
                  {form.knowledgeFileNames?.[0] && (
                    <div className="text-xs text-gray-600">Документ: {form.knowledgeFileNames[0]}</div>
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
