'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Plus,
  Edit,
  Save,
  Copy,
  Trash2,
  MessageSquare,
  Play,
  Wand2,
  FileText,
  Settings,
  GitBranch,
  Target,
  AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockAgents, mockPromptTemplates, mockAgentVersions } from '@/lib/mock-data'
import { AgentPrompt, PromptTemplate } from '@/lib/types'

interface PromptEditor {
  id: string
  stage: string
  title: string
  prompt: string
  conditions: { if: string; then: string }[]
  fallback: string
}

const promptStages = [
  { id: 'greeting', name: 'Приветствие', description: 'Первый контакт с клиентом' },
  { id: 'consent_question', name: 'Вопрос о согласии', description: 'Запрос разрешения на продолжение' },
  { id: 'offer_presentation', name: 'Презентация предложения', description: 'Основная презентация продукта' },
  { id: 'objection_handling', name: 'Обработка возражений', description: 'Ответы на возражения клиента' },
  { id: 'closing', name: 'Закрытие сделки', description: 'Финальное предложение' },
  { id: 'rejection_response', name: 'Ответ на отказ', description: 'Вежливое завершение при отказе' },
  { id: 'information_gathering', name: 'Сбор информации', description: 'Получение данных от клиента' }
]

export default function AgentPromptsPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  
  const agent = mockAgents.find(a => a.id === agentId)
  const versions = mockAgentVersions.filter(v => v.agentId === agentId)
  
  const [prompts, setPrompts] = useState<PromptEditor[]>(
    agent?.prompts.map(p => ({
      id: p.id,
      stage: p.stage,
      title: p.title,
      prompt: p.prompt,
      conditions: p.conditions || [],
      fallback: p.fallback || ''
    })) || []
  )
  
  const [selectedStage, setSelectedStage] = useState<string>('greeting')
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

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

  const currentPrompt = prompts.find(p => p.stage === selectedStage)
  const stageInfo = promptStages.find(s => s.id === selectedStage)

  const handleSavePrompt = (promptData: PromptEditor) => {
    setPrompts(prev => {
      const existing = prev.find(p => p.stage === promptData.stage)
      if (existing) {
        return prev.map(p => p.stage === promptData.stage ? promptData : p)
      } else {
        return [...prev, promptData]
      }
    })
    setIsEditing(null)
  }

  const handleDeletePrompt = (stage: string) => {
    setPrompts(prev => prev.filter(p => p.stage !== stage))
  }

  const handleUseTemplate = (template: PromptTemplate) => {
    const newPrompt: PromptEditor = {
      id: `prompt-${Date.now()}`,
      stage: selectedStage,
      title: template.name,
      prompt: template.template,
      conditions: [],
      fallback: template.template
    }
    handleSavePrompt(newPrompt)
    setShowTemplates(false)
  }

  const handleCreateVersion = () => {
    // Создание новой версии агента с текущими промтами
    console.log('Creating new version with prompts:', prompts)
    // Здесь была бы логика создания версии
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
              Редактор промтов
            </h1>
            <p className="text-gray-600">
              {agent.name} • Версия {agent.version}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Шаблоны
          </Button>
          <Button variant="outline" onClick={handleCreateVersion}>
            <GitBranch className="h-4 w-4 mr-2" />
            Создать версию
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Сохранить все
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Этапы разговора */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Этапы разговора</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {promptStages.map((stage) => {
                  const hasPrompt = prompts.some(p => p.stage === stage.id)
                  const isSelected = selectedStage === stage.id
                  
                  return (
                    <div
                      key={stage.id}
                      className={`p-3 cursor-pointer border-l-4 transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-500' 
                          : hasPrompt
                          ? 'bg-green-50 border-green-500 hover:bg-green-100'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedStage(stage.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{stage.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{stage.description}</p>
                        </div>
                        {hasPrompt ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Готов
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Пусто
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Версии агента */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Версии</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {versions.map((version) => (
                <div 
                  key={version.id}
                  className={`p-3 rounded-lg border ${
                    version.status === 'active' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">v{version.version}</p>
                      <p className="text-xs text-gray-600">{version.name}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {version.isBaseline && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          Базовая
                        </Badge>
                      )}
                      <Badge 
                        className={`text-xs ${
                          version.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {version.status === 'active' ? 'Активна' : 'Черновик'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Редактор промта */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    {stageInfo?.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {stageInfo?.description}
                  </p>
                </div>
                
                {currentPrompt && (
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(currentPrompt.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeletePrompt(selectedStage)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {currentPrompt ? (
                <PromptEditorComponent
                  prompt={currentPrompt}
                  isEditing={isEditing === currentPrompt.id}
                  onSave={handleSavePrompt}
                  onCancel={() => setIsEditing(null)}
                />
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Промт для этого этапа не создан
                  </p>
                  <Button onClick={() => {
                    const newPrompt: PromptEditor = {
                      id: `prompt-${Date.now()}`,
                      stage: selectedStage,
                      title: stageInfo?.name || '',
                      prompt: '',
                      conditions: [],
                      fallback: ''
                    }
                    setPrompts(prev => [...prev, newPrompt])
                    setIsEditing(newPrompt.id)
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Создать промт
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Модальное окно с шаблонами */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Шаблоны промтов</CardTitle>
                <Button variant="outline" onClick={() => setShowTemplates(false)}>
                  Закрыть
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockPromptTemplates
                  .filter(t => t.stage === selectedStage || t.category === 'greeting')
                  .map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => handleUseTemplate(template)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.usageCount} использований
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <p className="text-sm bg-gray-100 p-2 rounded line-clamp-3">
                        {template.template}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex space-x-1">
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm">
                          Использовать
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Компонент редактора промта
interface PromptEditorComponentProps {
  prompt: PromptEditor
  isEditing: boolean
  onSave: (prompt: PromptEditor) => void
  onCancel: () => void
}

function PromptEditorComponent({ prompt, isEditing, onSave, onCancel }: PromptEditorComponentProps) {
  const [editData, setEditData] = useState<PromptEditor>(prompt)

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Основной промт</Label>
          <div className="mt-1 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">{prompt.prompt}</p>
          </div>
        </div>
        
        {prompt.conditions.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Условные варианты</Label>
            <div className="mt-1 space-y-2">
              {prompt.conditions.map((condition, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-xs text-blue-600 font-medium">Если: {condition.if}</p>
                  <p className="text-sm mt-1">{condition.then}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {prompt.fallback && (
          <div>
            <Label className="text-sm font-medium">Запасной вариант</Label>
            <div className="mt-1 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm">{prompt.fallback}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Название промта</Label>
        <Input
          id="title"
          value={editData.title}
          onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="prompt">Основной промт</Label>
        <Textarea
          id="prompt"
          value={editData.prompt}
          onChange={(e) => setEditData(prev => ({ ...prev, prompt: e.target.value }))}
          className="mt-1"
          rows={4}
          placeholder="Введите текст промта..."
        />
      </div>

      <div>
        <Label>Условные варианты</Label>
        <div className="mt-2 space-y-3">
          {editData.conditions.map((condition, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Условие</Label>
                  <Input
                    value={condition.if}
                    onChange={(e) => {
                      const newConditions = [...editData.conditions]
                      newConditions[index].if = e.target.value
                      setEditData(prev => ({ ...prev, conditions: newConditions }))
                    }}
                    placeholder="время_дня == утро"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Текст</Label>
                  <Input
                    value={condition.then}
                    onChange={(e) => {
                      const newConditions = [...editData.conditions]
                      newConditions[index].then = e.target.value
                      setEditData(prev => ({ ...prev, conditions: newConditions }))
                    }}
                    placeholder="Доброе утро!..."
                    className="text-sm"
                  />
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => {
                  const newConditions = editData.conditions.filter((_, i) => i !== index)
                  setEditData(prev => ({ ...prev, conditions: newConditions }))
                }}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Удалить
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={() => {
              setEditData(prev => ({
                ...prev,
                conditions: [...prev.conditions, { if: '', then: '' }]
              }))
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить условие
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="fallback">Запасной вариант</Label>
        <Textarea
          id="fallback"
          value={editData.fallback}
          onChange={(e) => setEditData(prev => ({ ...prev, fallback: e.target.value }))}
          className="mt-1"
          rows={2}
          placeholder="Текст на случай, если условия не сработали..."
        />
      </div>

      <div className="flex items-center space-x-3">
        <Button onClick={() => onSave(editData)}>
          <Save className="h-4 w-4 mr-2" />
          Сохранить
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button variant="outline">
          <Play className="h-4 w-4 mr-2" />
          Тест
        </Button>
      </div>
    </div>
  )
}
