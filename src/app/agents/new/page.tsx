'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Save,
  Play,
  Volume2,
  Settings,
  MessageSquare,
  User,
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
import { mockVoices, mockVoiceLibrary } from '@/lib/mock-data'
import { Agent } from '@/lib/types'

interface AgentForm {
  name: string
  description: string
  role: string
  voiceId: string
  responseDelay: number
  interruptionHandling: boolean
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
    voiceId: '',
    responseDelay: 500,
    interruptionHandling: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

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
        return form.name && form.description && form.role
      case 2:
        return form.voiceId
      case 3:
        return true // Настройки имеют значения по умолчанию
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

  const steps = [
    { id: 1, name: 'Основная информация', icon: User },
    { id: 2, name: 'Выбор голоса', icon: Volume2 },
    { id: 3, name: 'Настройки', icon: Settings }
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
          {/* Шаг 1: Основная информация */}
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

          {/* Шаг 3: Настройки */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Настройки поведения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="responseDelay">Задержка ответа (мс)</Label>
                  <Input
                    id="responseDelay"
                    type="number"
                    min="0"
                    max="2000"
                    step="100"
                    value={form.responseDelay}
                    onChange={(e) => handleInputChange('responseDelay', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Время ожидания перед ответом агента (0-2000 мс)
                  </p>
                </div>

                {/* Настройка максимальной тишины удалена по требованиям */}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Обработка прерываний</Label>
                    <p className="text-sm text-gray-600">
                      Позволить клиенту прерывать речь агента
                    </p>
                  </div>
                  <Switch
                    checked={form.interruptionHandling}
                    onCheckedChange={(checked) => handleInputChange('interruptionHandling', checked)}
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Совет</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        После создания агента вы сможете настроить промты для каждого этапа разговора.
                        Рекомендуем начать с базовых настроек и корректировать их по результатам тестирования.
                      </p>
                    </div>
                  </div>
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
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={currentStep === 3 || !isStepCompleted(currentStep)}
            >
              Следующий шаг
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
