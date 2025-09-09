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
  Check
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
    serviceAvailable: false
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isCheckingService, setIsCheckingService] = useState(false)

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

  const isFormValid = () => {
    return form.name.trim() !== '' && 
           form.agent !== '' && 
           form.voice !== '' && 
           form.instructions.trim() !== '' &&
           form.serviceReady
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

      {/* Основная форма */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

          {/* Настройка агента */}
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

              <Separator />

              <div>
                <Label htmlFor="instructions" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Инструкции для агента *
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Опишите, как должен вести себя агент, какую информацию сообщать, как реагировать на вопросы..."
                  value={form.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  className="mt-1 min-h-[150px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Подробные инструкции помогут агенту эффективнее общаться с клиентами
                </p>
              </div>
            </CardContent>
          </Card>
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

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Название</span>
                  {form.name ? (
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  ) : (
                    <Badge variant="outline">—</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Агент</span>
                  {form.agent ? (
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  ) : (
                    <Badge variant="outline">—</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Голос</span>
                  {form.voice ? (
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  ) : (
                    <Badge variant="outline">—</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Инструкции</span>
                  {form.instructions ? (
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  ) : (
                    <Badge variant="outline">—</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Готовность</span>
                  {form.serviceReady ? (
                    <Badge className="bg-green-100 text-green-800">✓</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">!</Badge>
                  )}
                </div>
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