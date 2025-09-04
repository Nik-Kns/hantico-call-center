'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Save,
  Play,
  Settings,
  GitBranch,
  Target,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2
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
import { mockAgents, mockAgentVersions } from '@/lib/mock-data'
import { ABTestSettings, ABTestVariant } from '@/lib/types'

interface ABTestForm {
  name: string
  description: string
  variants: ABTestVariant[]
  settings: ABTestSettings
}

const primaryMetrics = [
  { id: 'conversion_rate', name: 'Конверсия', description: 'Процент успешных звонков' },
  { id: 'success_rate', name: 'Успешность', description: 'Общий процент успеха' },
  { id: 'avg_call_duration', name: 'Длительность звонка', description: 'Среднее время разговора' },
  { id: 'sms_consent_rate', name: 'Согласие на SMS', description: 'Процент согласий на SMS' }
]

const secondaryMetrics = [
  'conversion_rate',
  'success_rate', 
  'avg_call_duration',
  'sms_consent_rate',
  'rejection_rate',
  'callback_requests'
]

export default function NewABTestPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  
  const agent = mockAgents.find(a => a.id === agentId)
  const versions = mockAgentVersions.filter(v => v.agentId === agentId)
  
  const [form, setForm] = useState<ABTestForm>({
    name: '',
    description: '',
    variants: [
      {
        id: 'variant-a',
        name: 'A (Контроль)',
        versionId: '',
        trafficAllocation: 50,
        isControl: true
      },
      {
        id: 'variant-b', 
        name: 'B',
        versionId: '',
        trafficAllocation: 50
      }
    ],
    settings: {
      duration: 14,
      minSampleSize: 1000,
      confidenceLevel: 95,
      primaryMetric: 'conversion_rate',
      secondaryMetrics: ['sms_consent_rate'],
      autoStop: true,
      trafficRampUp: {
        enabled: false,
        startPercent: 10,
        rampUpDays: 3
      }
    }
  })
  
  const [isLoading, setIsLoading] = useState(false)

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Агент не найден</p>
        <Button className="mt-4" onClick={() => router.back()}>
          Назад к списку агентов
        </Button>
      </div>
    )
  }

  const handleSave = async (startTest = false) => {
    setIsLoading(true)
    
    // Валидация
    if (!form.name.trim()) {
      alert('Введите название теста')
      setIsLoading(false)
      return
    }
    
    if (form.variants.some(v => !v.versionId)) {
      alert('Выберите версии для всех вариантов')
      setIsLoading(false)
      return
    }
    
    const totalTraffic = form.variants.reduce((sum, v) => sum + v.trafficAllocation, 0)
    if (totalTraffic !== 100) {
      alert('Сумма распределения трафика должна быть 100%')
      setIsLoading(false)
      return
    }
    
    // Имитация сохранения
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Creating AB test:', {
      ...form,
      agentId,
      status: startTest ? 'running' : 'draft'
    })
    
    setIsLoading(false)
    router.push(`/agents/${agentId}/ab-tests`)
  }

  const handleVariantChange = (index: number, field: keyof ABTestVariant, value: any) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }))
  }

  const addVariant = () => {
    const newVariant: ABTestVariant = {
      id: `variant-${String.fromCharCode(65 + form.variants.length)}`.toLowerCase(),
      name: String.fromCharCode(65 + form.variants.length),
      versionId: '',
      trafficAllocation: 0
    }
    
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }))
  }

  const removeVariant = (index: number) => {
    if (form.variants.length <= 2) return
    
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const redistributeTraffic = () => {
    const equalShare = Math.floor(100 / form.variants.length)
    const remainder = 100 - (equalShare * form.variants.length)
    
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => ({
        ...v,
        trafficAllocation: equalShare + (i === 0 ? remainder : 0)
      }))
    }))
  }

  const getVersionName = (versionId: string) => {
    const version = versions.find(v => v.id === versionId)
    return version ? `v${version.version} - ${version.name}` : 'Выберите версию'
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
              Создание A/B теста
            </h1>
            <p className="text-gray-600">
              {agent.name} • Настройка эксперимента
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить как черновик
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isLoading}>
            <Play className="h-4 w-4 mr-2" />
            Создать и запустить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная форма */}
        <div className="lg:col-span-2 space-y-6">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GitBranch className="h-5 w-5 mr-2" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Название теста *</Label>
                <Input
                  id="name"
                  placeholder="Например: Персонализация vs Стандарт"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Опишите цель и гипотезу теста..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Варианты теста */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Варианты теста
                </CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={redistributeTraffic}>
                    Равномерно
                  </Button>
                  <Button size="sm" variant="outline" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-1" />
                    Вариант
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.variants.map((variant, index) => (
                <div key={variant.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">Вариант {variant.name}</h4>
                      {variant.isControl && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          Контроль
                        </Badge>
                      )}
                    </div>
                    {form.variants.length > 2 && (
                      <Button size="sm" variant="outline" onClick={() => removeVariant(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Версия агента *</Label>
                      <Select 
                        value={variant.versionId} 
                        onValueChange={(value) => handleVariantChange(index, 'versionId', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Выберите версию" />
                        </SelectTrigger>
                        <SelectContent>
                          {versions.map((version) => (
                            <SelectItem key={version.id} value={version.id}>
                              <div>
                                <div className="font-medium">v{version.version} - {version.name}</div>
                                <div className="text-xs text-gray-500">{version.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Доля трафика (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={variant.trafficAllocation}
                        onChange={(e) => handleVariantChange(index, 'trafficAllocation', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Общее распределение:</span>
                  <span className={`font-medium ${
                    form.variants.reduce((sum, v) => sum + v.trafficAllocation, 0) === 100 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {form.variants.reduce((sum, v) => sum + v.trafficAllocation, 0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Настройки теста */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Настройки теста
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Длительность (дни)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="90"
                    value={form.settings.duration}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, duration: parseInt(e.target.value) || 14 }
                    }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="minSample">Минимальная выборка</Label>
                  <Input
                    id="minSample"
                    type="number"
                    min="100"
                    value={form.settings.minSampleSize}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      settings: { ...prev.settings, minSampleSize: parseInt(e.target.value) || 1000 }
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Основная метрика *</Label>
                <Select 
                  value={form.settings.primaryMetric} 
                  onValueChange={(value: any) => setForm(prev => ({
                    ...prev,
                    settings: { ...prev.settings, primaryMetric: value }
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {primaryMetrics.map((metric) => (
                      <SelectItem key={metric.id} value={metric.id}>
                        <div>
                          <div className="font-medium">{metric.name}</div>
                          <div className="text-xs text-gray-500">{metric.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Уровень доверия (%)</Label>
                <Select 
                  value={form.settings.confidenceLevel.toString()} 
                  onValueChange={(value) => setForm(prev => ({
                    ...prev,
                    settings: { ...prev.settings, confidenceLevel: parseInt(value) }
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                    <SelectItem value="99">99%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Автоматическая остановка</Label>
                  <p className="text-sm text-gray-600">
                    Остановить тест при достижении статистической значимости
                  </p>
                </div>
                <Switch
                  checked={form.settings.autoStop}
                  onCheckedChange={(checked) => setForm(prev => ({
                    ...prev,
                    settings: { ...prev.settings, autoStop: checked }
                  }))}
                />
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label>Плавный запуск трафика</Label>
                    <p className="text-sm text-gray-600">
                      Постепенное увеличение доли трафика в тесте
                    </p>
                  </div>
                  <Switch
                    checked={form.settings.trafficRampUp.enabled}
                    onCheckedChange={(checked) => setForm(prev => ({
                      ...prev,
                      settings: { 
                        ...prev.settings, 
                        trafficRampUp: { ...prev.settings.trafficRampUp, enabled: checked }
                      }
                    }))}
                  />
                </div>

                {form.settings.trafficRampUp.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div>
                      <Label>Начальный процент (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={form.settings.trafficRampUp.startPercent}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          settings: { 
                            ...prev.settings, 
                            trafficRampUp: { 
                              ...prev.settings.trafficRampUp, 
                              startPercent: parseInt(e.target.value) || 10 
                            }
                          }
                        }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Дни развертывания</Label>
                      <Input
                        type="number"
                        min="1"
                        max="14"
                        value={form.settings.trafficRampUp.rampUpDays}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          settings: { 
                            ...prev.settings, 
                            trafficRampUp: { 
                              ...prev.settings.trafficRampUp, 
                              rampUpDays: parseInt(e.target.value) || 3 
                            }
                          }
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Предпросмотр */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Предпросмотр теста</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Название</p>
                <p className="font-medium">{form.name || 'Без названия'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Варианты</p>
                <div className="space-y-2">
                  {form.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between text-sm">
                      <span>{variant.name}</span>
                      <span>{variant.trafficAllocation}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Настройки</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Длительность:</span>
                    <span>{form.settings.duration} дней</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Мин. выборка:</span>
                    <span>{form.settings.minSampleSize.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Уровень доверия:</span>
                    <span>{form.settings.confidenceLevel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Автостоп:</span>
                    <span>{form.settings.autoStop ? 'Да' : 'Нет'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex">
                  <AlertCircle className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Совет</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Убедитесь, что у вас достаточно трафика для получения 
                      статистически значимых результатов
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
