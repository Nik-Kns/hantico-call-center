'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Plus,
  Save,
  Eye,
  Settings,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Users,
  Trash2,
  Copy
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Типы для редактора воронки
interface FunnelNode {
  id: string
  type: 'start' | 'action' | 'condition' | 'end'
  title: string
  description?: string
  icon: React.ReactNode
  conditions?: FunnelCondition[]
  actions?: FunnelAction[]
  position: { x: number; y: number }
}

interface FunnelCondition {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less'
  value: string
  nextNodeId?: string
}

interface FunnelAction {
  id: string
  type: 'sms' | 'email' | 'bitrix' | 'retry' | 'stop'
  config: { [key: string]: any }
}

interface FunnelTemplate {
  id: string
  name: string
  description: string
  nodes: FunnelNode[]
  isDefault: boolean
}

// Моковые шаблоны воронок
const mockFunnelTemplates: FunnelTemplate[] = [
  {
    id: 'default',
    name: 'Стандартная воронка',
    description: 'Базовый сценарий обзвона с SMS и передачей в Bitrix24',
    isDefault: true,
    nodes: [
      {
        id: 'start',
        type: 'start',
        title: 'Начало звонка',
        description: 'Инициация звонка клиенту',
        icon: <CheckCircle className="h-5 w-5" />,
        position: { x: 100, y: 50 }
      },
      {
        id: 'call-result',
        type: 'condition',
        title: 'Результат звонка',
        description: 'Проверка результата звонка',
        icon: <Settings className="h-5 w-5" />,
        conditions: [
          {
            id: 'success',
            field: 'call_result',
            operator: 'equals',
            value: 'answer_success',
            nextNodeId: 'sms-consent'
          },
          {
            id: 'no-answer',
            field: 'call_result',
            operator: 'equals',
            value: 'no_answer',
            nextNodeId: 'retry'
          },
          {
            id: 'refused',
            field: 'call_result',
            operator: 'equals',
            value: 'answer_refuse',
            nextNodeId: 'bitrix'
          }
        ],
        position: { x: 300, y: 50 }
      },
      {
        id: 'sms-consent',
        type: 'condition',
        title: 'Согласие на SMS',
        description: 'Проверка согласия клиента на получение SMS',
        icon: <MessageSquare className="h-5 w-5" />,
        conditions: [
          {
            id: 'consent-yes',
            field: 'sms_consent',
            operator: 'equals',
            value: 'true',
            nextNodeId: 'send-sms'
          },
          {
            id: 'consent-no',
            field: 'sms_consent',
            operator: 'equals',
            value: 'false',
            nextNodeId: 'bitrix'
          }
        ],
        position: { x: 500, y: 50 }
      },
      {
        id: 'send-sms',
        type: 'action',
        title: 'Отправка SMS',
        description: 'Отправка SMS с ссылкой на регистрацию',
        icon: <MessageSquare className="h-5 w-5" />,
        actions: [
          {
            id: 'sms-action',
            type: 'sms',
            config: {
              template: 'Спасибо за разговор! Ссылка на регистрацию: [LINK]',
              delay: 0
            }
          }
        ],
        position: { x: 700, y: 50 }
      },
      {
        id: 'retry',
        type: 'action',
        title: 'Повторный звонок',
        description: 'Планирование повторного звонка через интервал',
        icon: <Clock className="h-5 w-5" />,
        actions: [
          {
            id: 'retry-action',
            type: 'retry',
            config: {
              attempts: 3,
              interval: 120,
              conditions: ['no_answer', 'busy']
            }
          }
        ],
        position: { x: 300, y: 200 }
      },
      {
        id: 'bitrix',
        type: 'action',
        title: 'Передача в Bitrix24',
        description: 'Создание задачи для менеджера',
        icon: <Users className="h-5 w-5" />,
        actions: [
          {
            id: 'bitrix-action',
            type: 'bitrix',
            config: {
              dealType: 'manual_processing',
              priority: 'normal',
              responsible: 'auto'
            }
          }
        ],
        position: { x: 500, y: 200 }
      },
      {
        id: 'success',
        type: 'end',
        title: 'Успешное завершение',
        description: 'Клиент успешно обработан',
        icon: <CheckCircle className="h-5 w-5" />,
        position: { x: 700, y: 200 }
      }
    ]
  }
]

export default function FunnelEditorPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<FunnelTemplate>(mockFunnelTemplates[0])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedNode, setSelectedNode] = useState<FunnelNode | null>(null)

  const handleSaveTemplate = () => {
    // Имитация сохранения шаблона
    console.log('Сохранение шаблона:', selectedTemplate)
    setIsEditing(false)
  }

  const handleNodeClick = (node: FunnelNode) => {
    setSelectedNode(node)
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'condition':
        return <Settings className="h-5 w-5 text-blue-600" />
      case 'action':
        return <MessageSquare className="h-5 w-5 text-purple-600" />
      case 'end':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Settings className="h-5 w-5 text-gray-600" />
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'condition':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'action':
        return 'bg-purple-100 border-purple-300 text-purple-800'
      case 'end':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
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
              Редактор воронки обзвонов
            </h1>
            <p className="text-gray-600">
              Настройка логики обработки результатов звонков
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Просмотр
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Редактировать
              </>
            )}
          </Button>
          
          {isEditing && (
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Основная область с воронкой */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedTemplate.name}
                  {selectedTemplate.isDefault && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800">По умолчанию</Badge>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={selectedTemplate.id} 
                    onValueChange={(value) => {
                      const template = mockFunnelTemplates.find(t => t.id === value)
                      if (template) setSelectedTemplate(template)
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFunnelTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
            </CardHeader>
            
            <CardContent>
              {/* Упрощенная визуализация воронки */}
              <div className="space-y-6">
                {/* Путь 1: Успешный сценарий */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Путь 1: Звонок → Согласие → SMS → Регистрация → Успешно
                  </h3>
                  <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                    {selectedTemplate.nodes
                      .filter(node => ['start', 'call-result', 'sms-consent', 'send-sms', 'success'].includes(node.id))
                      .map((node, index, array) => (
                        <div key={node.id} className="flex items-center space-x-4">
                          <div 
                            className={`
                              relative p-4 rounded-lg border-2 cursor-pointer min-w-[120px] text-center
                              ${getNodeColor(node.type)}
                              ${selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''}
                              ${isEditing ? 'hover:shadow-lg transition-shadow' : ''}
                            `}
                            onClick={() => handleNodeClick(node)}
                          >
                            <div className="flex items-center justify-center mb-2">
                              {getNodeIcon(node.type)}
                            </div>
                            <div className="text-xs font-medium">{node.title}</div>
                          </div>
                          
                          {index < array.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                {/* Путь 2: Отказ */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Путь 2: Звонок → Отказ → Bitrix24
                  </h3>
                  <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                    {selectedTemplate.nodes
                      .filter(node => ['start', 'call-result', 'bitrix'].includes(node.id))
                      .map((node, index, array) => (
                        <div key={node.id} className="flex items-center space-x-4">
                          <div 
                            className={`
                              relative p-4 rounded-lg border-2 cursor-pointer min-w-[120px] text-center
                              ${getNodeColor(node.type)}
                              ${selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''}
                              ${isEditing ? 'hover:shadow-lg transition-shadow' : ''}
                            `}
                            onClick={() => handleNodeClick(node)}
                          >
                            <div className="flex items-center justify-center mb-2">
                              {getNodeIcon(node.type)}
                            </div>
                            <div className="text-xs font-medium">{node.title}</div>
                          </div>
                          
                          {index < array.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                {/* Путь 3: Не ответил */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Путь 3: Звонок → Не ответил → Повторный звонок
                  </h3>
                  <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                    {selectedTemplate.nodes
                      .filter(node => ['start', 'call-result', 'retry'].includes(node.id))
                      .map((node, index, array) => (
                        <div key={node.id} className="flex items-center space-x-4">
                          <div 
                            className={`
                              relative p-4 rounded-lg border-2 cursor-pointer min-w-[120px] text-center
                              ${getNodeColor(node.type)}
                              ${selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''}
                              ${isEditing ? 'hover:shadow-lg transition-shadow' : ''}
                            `}
                            onClick={() => handleNodeClick(node)}
                          >
                            <div className="flex items-center justify-center mb-2">
                              {getNodeIcon(node.type)}
                            </div>
                            <div className="text-xs font-medium">{node.title}</div>
                          </div>
                          
                          {index < array.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center space-x-4">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить узел
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Дублировать шаблон
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель с настройками */}
        <div className="space-y-6">
          {selectedNode ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getNodeIcon(selectedNode.type)}
                  <span className="ml-2">{selectedNode.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Описание</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedNode.description || 'Нет описания'}
                  </p>
                </div>

                {selectedNode.type === 'condition' && selectedNode.conditions && (
                  <div>
                    <Label>Условия перехода</Label>
                    <div className="space-y-2 mt-2">
                      {selectedNode.conditions.map((condition) => (
                        <div key={condition.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs font-medium text-gray-700">
                            {condition.field} {condition.operator} &quot;{condition.value}&quot;
                          </div>
                          {condition.nextNodeId && (
                            <div className="text-xs text-gray-500 mt-1">
                              → {selectedTemplate.nodes.find(n => n.id === condition.nextNodeId)?.title}
                            </div>
                          )}
                          {isEditing && (
                            <Button size="sm" variant="outline" className="mt-2">
                              <Settings className="h-3 w-3 mr-1" />
                              Настроить
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.type === 'action' && selectedNode.actions && (
                  <div>
                    <Label>Действия</Label>
                    <div className="space-y-2 mt-2">
                      {selectedNode.actions.map((action) => (
                        <div key={action.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs font-medium text-gray-700">
                            Тип: {action.type}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Конфигурация: {JSON.stringify(action.config, null, 2)}
                          </div>
                          {isEditing && (
                            <Button size="sm" variant="outline" className="mt-2">
                              <Settings className="h-3 w-3 mr-1" />
                              Настроить
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Изменить
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Выберите узел для редактирования
                </p>
              </CardContent>
            </Card>
          )}

          {/* Легенда */}
          <Card>
            <CardHeader>
              <CardTitle>Типы узлов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                <span className="text-sm">Начало/Конец</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
                <span className="text-sm">Условие</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300" />
                <span className="text-sm">Действие</span>
              </div>
            </CardContent>
          </Card>

          {/* Статистика применения */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Кампаний использует:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Всего обработано:</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Эффективность:</span>
                <span className="font-medium text-green-600">73.2%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
