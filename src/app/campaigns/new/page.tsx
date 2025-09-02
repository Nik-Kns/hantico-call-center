'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Play, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Campaign, CampaignCategory, AttemptsPolicy, CallWindow } from '@/lib/types'
import { generateId } from '@/lib/utils'

interface CampaignFormData {
  name: string
  description: string
  category: CampaignCategory
  source: 'csv' | 'segment' | 'manual'
  sourceConfig: {
    csvFile?: string
    segmentId?: string
    filters?: Record<string, any>
  }
  scriptId: string
  scriptVersion: 'A' | 'B'
  callWindows: CallWindow[]
  attemptsPolicy: AttemptsPolicy
  concurrency: number
  priority: number
  settings: {
    enableSms: boolean
    autoEscalation: boolean
    recordCalls: boolean
    enableTranscription: boolean
  }
}

const defaultFormData: CampaignFormData = {
  name: '',
  description: '',
  category: 'acquisition',
  source: 'csv',
  sourceConfig: {},
  scriptId: 'script-1',
  scriptVersion: 'A',
  callWindows: [
    {
      dayOfWeek: 1, // Понедельник
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'Europe/Moscow'
    }
  ],
  attemptsPolicy: {
    no_answer: { maxAttempts: 3, intervalMinutes: 120 },
    busy: { maxAttempts: 2, intervalMinutes: 30 },
    voicemail: { action: 'retry', maxAttempts: 1, intervalMinutes: 240 }
  },
  concurrency: 3,
  priority: 5,
  settings: {
    enableSms: true,
    autoEscalation: true,
    recordCalls: true,
    enableTranscription: true
  }
}

const dayOfWeekLabels = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота'
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CampaignFormData>(defaultFormData)
  const [activeTab, setActiveTab] = useState<'basic' | 'source' | 'script' | 'schedule' | 'attempts' | 'automation'>('basic')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Название кампании обязательно'
    }

    if (formData.source === 'csv' && !formData.sourceConfig.csvFile) {
      newErrors.csvFile = 'Выберите CSV файл'
    }

    if (formData.source === 'segment' && !formData.sourceConfig.segmentId) {
      newErrors.segmentId = 'Выберите сегмент'
    }

    if (formData.concurrency < 1 || formData.concurrency > 20) {
      newErrors.concurrency = 'Параллельность должна быть от 1 до 20'
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Приоритет должен быть от 1 до 10'
    }

    if (formData.callWindows.length === 0) {
      newErrors.callWindows = 'Добавьте хотя бы одно окно дозвона'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Сохранение кампании
  const handleSave = (action: 'draft' | 'start') => {
    if (!validateForm()) return

    const newCampaign: Campaign = {
      id: generateId('campaign'),
      name: formData.name,
      description: formData.description || undefined,
      source: formData.source,
      sourceConfig: formData.sourceConfig,
      scriptId: formData.scriptId,
      scriptVersion: formData.scriptVersion,
      callWindows: formData.callWindows,
      attemptsPolicy: formData.attemptsPolicy,
      concurrency: formData.concurrency,
      priority: formData.priority,
      state: action === 'start' ? 'running' : 'draft',
      category: formData.category,
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: action === 'start' ? new Date() : undefined,
      settings: formData.settings,
      stats: {
        totalLeads: 0,
        processed: 0,
        successful: 0,
        refused: 0,
        pending: 0
      }
    }

    console.log('Создана кампания:', newCampaign)
    
    // В реальном приложении здесь был бы API вызов
    alert(`Кампания "${formData.name}" ${action === 'start' ? 'создана и запущена' : 'сохранена как черновик'}!`)
    router.push('/campaigns')
  }

  // Обновление данных формы
  const updateFormData = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Добавление окна дозвона
  const addCallWindow = () => {
    const newWindow: CallWindow = {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'Europe/Moscow'
    }
    
    updateFormData('callWindows', [...formData.callWindows, newWindow])
  }

  // Удаление окна дозвона
  const removeCallWindow = (index: number) => {
    updateFormData('callWindows', formData.callWindows.filter((_, i) => i !== index))
  }

  // Обновление окна дозвона
  const updateCallWindow = (index: number, field: keyof CallWindow, value: any) => {
    const updatedWindows = formData.callWindows.map((window, i) => 
      i === index ? { ...window, [field]: value } : window
    )
    updateFormData('callWindows', updatedWindows)
  }

  const tabs = [
    { id: 'basic', label: 'Основное', required: true },
    { id: 'source', label: 'Источник данных', required: true },
    { id: 'script', label: 'Скрипт', required: true },
    { id: 'schedule', label: 'Расписание', required: true },
    { id: 'attempts', label: 'Повторы', required: false },
    { id: 'automation', label: 'Автоматизация', required: false }
  ]

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Новая кампания</h1>
            <p className="text-gray-600">
              Создание кампании обзвона с настройкой всех параметров
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить черновик
          </Button>
          
          <Button onClick={() => handleSave('start')}>
            <Play className="h-4 w-4 mr-2" />
            Создать и запустить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Навигация по табам */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Разделы настройки</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{tab.label}</span>
                      {tab.required && (
                        <Badge variant="outline" className="text-xs">
                          Обязательно
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Содержимое табов */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {/* Основные настройки */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Основная информация</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Название кампании *
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Например: Новогодняя акция VIP"
                          value={formData.name}
                          onChange={(e) => updateFormData('name', e.target.value)}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Описание
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Краткое описание цели и особенностей кампании"
                          value={formData.description}
                          onChange={(e) => updateFormData('description', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Категория кампании *
                        </label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => updateFormData('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="acquisition">Привлечение новых клиентов</SelectItem>
                            <SelectItem value="retention">Удержание существующих</SelectItem>
                            <SelectItem value="reactivation">Реактивация неактивных</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Параллельность *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.concurrency ? 'border-red-300' : 'border-gray-300'
                            }`}
                            value={formData.concurrency}
                            onChange={(e) => updateFormData('concurrency', parseInt(e.target.value) || 1)}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Количество одновременных звонков (1-20)
                          </p>
                          {errors.concurrency && (
                            <p className="mt-1 text-sm text-red-600">{errors.concurrency}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Приоритет *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.priority ? 'border-red-300' : 'border-gray-300'
                            }`}
                            value={formData.priority}
                            onChange={(e) => updateFormData('priority', parseInt(e.target.value) || 1)}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Приоритет выполнения (1-10, где 10 - максимальный)
                          </p>
                          {errors.priority && (
                            <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Источник данных */}
              {activeTab === 'source' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Источник лидов</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Тип источника *
                        </label>
                        <Select 
                          value={formData.source} 
                          onValueChange={(value) => updateFormData('source', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="csv">Загрузка CSV файла</SelectItem>
                            <SelectItem value="segment">Сегмент из базы</SelectItem>
                            <SelectItem value="manual">Ручной ввод</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.source === 'csv' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CSV файл *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <div className="space-y-2">
                              <div className="text-gray-500">
                                Перетащите CSV файл сюда или
                              </div>
                              <Button variant="outline">
                                Выбрать файл
                              </Button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              Поддерживаются файлы .csv до 10MB
                            </p>
                          </div>
                          {errors.csvFile && (
                            <p className="mt-1 text-sm text-red-600">{errors.csvFile}</p>
                          )}
                        </div>
                      )}

                      {formData.source === 'segment' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Сегмент *
                          </label>
                          <Select 
                            value={formData.sourceConfig.segmentId || ''} 
                            onValueChange={(value) => updateFormData('sourceConfig', { 
                              ...formData.sourceConfig, 
                              segmentId: value 
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите сегмент" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vip-segment">VIP клиенты</SelectItem>
                              <SelectItem value="inactive-segment">Неактивные 30+ дней</SelectItem>
                              <SelectItem value="new-segment">Новые регистрации</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.segmentId && (
                            <p className="mt-1 text-sm text-red-600">{errors.segmentId}</p>
                          )}
                        </div>
                      )}

                      {formData.source === 'manual' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Контакты
                          </label>
                          <textarea
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Введите контакты в формате: +79001234567,Имя или по одному на строку"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Форматы: +79001234567 или +79001234567,Имя Фамилия
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Скрипт */}
              {activeTab === 'script' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Настройки скрипта</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Скрипт *
                        </label>
                        <Select 
                          value={formData.scriptId} 
                          onValueChange={(value) => updateFormData('scriptId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="script-1">Новогодняя акция VIP</SelectItem>
                            <SelectItem value="script-2">Реактивация неактивных</SelectItem>
                            <SelectItem value="script-3">Тестовый скрипт</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          A/B версия *
                        </label>
                        <Select 
                          value={formData.scriptVersion} 
                          onValueChange={(value) => updateFormData('scriptVersion', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Версия A (основная)</SelectItem>
                            <SelectItem value="B">Версия B (тестовая)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Превью скрипта</h4>
                        <div className="text-sm text-gray-600 space-y-2">
                          <p>
                            <strong>Вступление:</strong> &quot;Добрый день! Меня зовут [Имя агента], 
                            я звоню от [Бренд]. У нас для вас специальное новогоднее предложение.&quot;
                          </p>
                          <p>
                            <strong>Предложение:</strong> &quot;Мы подготовили для VIP клиентов 
                            эксклюзивный бонус 200% на депозит. Вас интересует?&quot;
                          </p>
                          <p className="text-xs text-gray-500">
                            Полный скрипт можно посмотреть в разделе &quot;Скрипты&quot;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Расписание */}
              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Окна дозвона</h3>
                    
                    <div className="space-y-4">
                      {formData.callWindows.map((window, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Окно дозвона #{index + 1}</h4>
                            {formData.callWindows.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeCallWindow(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Удалить
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                День недели
                              </label>
                              <Select 
                                value={window.dayOfWeek.toString()} 
                                onValueChange={(value) => updateCallWindow(index, 'dayOfWeek', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {dayOfWeekLabels.map((label, dayIndex) => (
                                    <SelectItem key={dayIndex} value={dayIndex.toString()}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Начало
                              </label>
                              <input
                                type="time"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={window.startTime}
                                onChange={(e) => updateCallWindow(index, 'startTime', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Окончание
                              </label>
                              <input
                                type="time"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={window.endTime}
                                onChange={(e) => updateCallWindow(index, 'endTime', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Часовой пояс
                              </label>
                              <Select 
                                value={window.timezone} 
                                onValueChange={(value) => updateCallWindow(index, 'timezone', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Europe/Moscow">МСК (UTC+3)</SelectItem>
                                  <SelectItem value="Europe/Samara">SAMT (UTC+4)</SelectItem>
                                  <SelectItem value="Asia/Yekaterinburg">YEKT (UTC+5)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        onClick={addCallWindow}
                        className="w-full"
                      >
                        + Добавить окно дозвона
                      </Button>
                      
                      {errors.callWindows && (
                        <p className="text-sm text-red-600">{errors.callWindows}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Повторы */}
              {activeTab === 'attempts' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Политика повторных попыток</h3>
                    
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Не ответил</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Максимум попыток
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={formData.attemptsPolicy.no_answer.maxAttempts}
                              onChange={(e) => updateFormData('attemptsPolicy', {
                                ...formData.attemptsPolicy,
                                no_answer: {
                                  ...formData.attemptsPolicy.no_answer,
                                  maxAttempts: parseInt(e.target.value) || 0
                                }
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Интервал (минуты)
                            </label>
                            <input
                              type="number"
                              min="5"
                              max="1440"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={formData.attemptsPolicy.no_answer.intervalMinutes}
                              onChange={(e) => updateFormData('attemptsPolicy', {
                                ...formData.attemptsPolicy,
                                no_answer: {
                                  ...formData.attemptsPolicy.no_answer,
                                  intervalMinutes: parseInt(e.target.value) || 5
                                }
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Занято</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Максимум попыток
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={formData.attemptsPolicy.busy.maxAttempts}
                              onChange={(e) => updateFormData('attemptsPolicy', {
                                ...formData.attemptsPolicy,
                                busy: {
                                  ...formData.attemptsPolicy.busy,
                                  maxAttempts: parseInt(e.target.value) || 0
                                }
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Интервал (минуты)
                            </label>
                            <input
                              type="number"
                              min="5"
                              max="1440"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              value={formData.attemptsPolicy.busy.intervalMinutes}
                              onChange={(e) => updateFormData('attemptsPolicy', {
                                ...formData.attemptsPolicy,
                                busy: {
                                  ...formData.attemptsPolicy.busy,
                                  intervalMinutes: parseInt(e.target.value) || 5
                                }
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Автоответчик</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Действие
                            </label>
                            <Select 
                              value={formData.attemptsPolicy.voicemail.action} 
                              onValueChange={(value: 'stop' | 'retry') => updateFormData('attemptsPolicy', {
                                ...formData.attemptsPolicy,
                                voicemail: {
                                  ...formData.attemptsPolicy.voicemail,
                                  action: value
                                }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="stop">Прекратить попытки</SelectItem>
                                <SelectItem value="retry">Повторить позже</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {formData.attemptsPolicy.voicemail.action === 'retry' && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Максимум попыток
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={formData.attemptsPolicy.voicemail.maxAttempts || 1}
                                  onChange={(e) => updateFormData('attemptsPolicy', {
                                    ...formData.attemptsPolicy,
                                    voicemail: {
                                      ...formData.attemptsPolicy.voicemail,
                                      maxAttempts: parseInt(e.target.value) || 0
                                    }
                                  })}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Интервал (минуты)
                                </label>
                                <input
                                  type="number"
                                  min="5"
                                  max="1440"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={formData.attemptsPolicy.voicemail.intervalMinutes || 240}
                                  onChange={(e) => updateFormData('attemptsPolicy', {
                                    ...formData.attemptsPolicy,
                                    voicemail: {
                                      ...formData.attemptsPolicy.voicemail,
                                      intervalMinutes: parseInt(e.target.value) || 5
                                    }
                                  })}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Автоматизация */}
              {activeTab === 'automation' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Настройки автоматизации</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.settings.enableSms}
                          onCheckedChange={(checked) => updateFormData('settings', {
                            ...formData.settings,
                            enableSms: checked
                          })}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Включить отправку SMS
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.settings.autoEscalation}
                          onCheckedChange={(checked) => updateFormData('settings', {
                            ...formData.settings,
                            autoEscalation: checked
                          })}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Автоматическая эскалация задач
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.settings.recordCalls}
                          onCheckedChange={(checked) => updateFormData('settings', {
                            ...formData.settings,
                            recordCalls: checked
                          })}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Записывать звонки
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.settings.enableTranscription}
                          onCheckedChange={(checked) => updateFormData('settings', {
                            ...formData.settings,
                            enableTranscription: checked
                          })}
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Включить транскрипцию звонков
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Автоматические действия</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• При успешном звонке с согласием на SMS → отправка SMS с deeplink</p>
                        <p>• При отказе клиента → создание задачи менеджеру</p>
                        <p>• При &quot;может быть позже&quot; → запланировать повторный звонок</p>
                        <p>• При незавершенной регистрации → задача на дожим</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
