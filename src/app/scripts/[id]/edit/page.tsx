'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  Play, 
  Plus,
  MessageCircle,
  GitBranch,
  Settings,
  Trash2,
  Edit,
  Eye,
  Copy,
  Move
} from 'lucide-react'

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
import { mockScripts } from '@/lib/mock-data'
import { Script, ScriptNode } from '@/lib/types'
import { generateId } from '@/lib/utils'

interface ScriptEditPageProps {
  params: Promise<{
    id: string
  }>
}

function ScriptEditPageClient({ id }: { id: string }) {
  const router = useRouter()
  const [script, setScript] = useState<Script | null>(
    mockScripts.find(s => s.id === id) || null
  )
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  if (!script) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Скрипт не найден</h1>
          </div>
        </div>
      </div>
    )
  }

  // Добавление нового узла
  const addNode = (type: ScriptNode['type']) => {
    const newNode: ScriptNode = {
      id: generateId('node'),
      type,
      content: type === 'message' ? 'Новое сообщение' :
               type === 'question' ? 'Новый вопрос?' :
               type === 'condition' ? 'Проверка условия' :
               'Новое действие',
      branches: type === 'question' ? { yes: '', no: '' } : 
               type === 'condition' ? { true: '', false: '' } : undefined,
      actions: type === 'action' ? [{ type: 'set_tag', value: 'new-tag' }] : undefined
    }

    setScript(prev => prev ? {
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date()
    } : null)

    setSelectedNode(newNode.id)
  }

  // Удаление узла
  const deleteNode = (nodeId: string) => {
    if (script.startNodeId === nodeId) {
      alert('Нельзя удалить стартовый узел')
      return
    }

    if (confirm('Удалить этот узел?')) {
      setScript(prev => prev ? {
        ...prev,
        nodes: prev.nodes.filter(n => n.id !== nodeId),
        updatedAt: new Date()
      } : null)

      if (selectedNode === nodeId) {
        setSelectedNode(null)
      }
    }
  }

  // Обновление узла
  const updateNode = (nodeId: string, updates: Partial<ScriptNode>) => {
    setScript(prev => prev ? {
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      ),
      updatedAt: new Date()
    } : null)
  }

  // Сохранение скрипта
  const handleSave = () => {
    console.log('Сохранение скрипта:', script)
    alert('Скрипт сохранен!')
  }

  // Тестирование скрипта
  const handleTest = () => {
    setIsPreviewMode(true)
  }

  const getNodeIcon = (type: ScriptNode['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-600" />
      case 'question':
        return <MessageCircle className="h-5 w-5 text-green-600" />
      case 'condition':
        return <GitBranch className="h-5 w-5 text-orange-600" />
      case 'action':
        return <Settings className="h-5 w-5 text-purple-600" />
    }
  }

  const getNodeColor = (type: ScriptNode['type']) => {
    switch (type) {
      case 'message':
        return 'border-blue-200 bg-blue-50'
      case 'question':
        return 'border-green-200 bg-green-50'
      case 'condition':
        return 'border-orange-200 bg-orange-50'
      case 'action':
        return 'border-purple-200 bg-purple-50'
    }
  }

  const selectedNodeData = selectedNode ? script.nodes.find(n => n.id === selectedNode) : null

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
            <h1 className="text-2xl font-bold text-gray-900">
              Редактор скрипта: {script.name}
            </h1>
            <p className="text-gray-600">
              Версия {script.version} • {script.nodes.length} узлов
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Редактор' : 'Превью'}
          </Button>
          
          <Button variant="outline" onClick={handleTest}>
            <Play className="h-4 w-4 mr-2" />
            Тестировать
          </Button>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Панель инструментов */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Добавить узел</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => addNode('message')}
              >
                <MessageCircle className="h-4 w-4 mr-2 text-blue-600" />
                Сообщение
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => addNode('question')}
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                Вопрос
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => addNode('condition')}
              >
                <GitBranch className="h-4 w-4 mr-2 text-orange-600" />
                Условие
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => addNode('action')}
              >
                <Settings className="h-4 w-4 mr-2 text-purple-600" />
                Действие
              </Button>
            </CardContent>
          </Card>

          {/* Настройки скрипта */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Настройки скрипта</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={script.name}
                  onChange={(e) => setScript(prev => prev ? {
                    ...prev,
                    name: e.target.value,
                    updatedAt: new Date()
                  } : null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={script.description || ''}
                  onChange={(e) => setScript(prev => prev ? {
                    ...prev,
                    description: e.target.value,
                    updatedAt: new Date()
                  } : null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Язык
                </label>
                <Select 
                  value={script.language} 
                  onValueChange={(value) => setScript(prev => prev ? {
                    ...prev,
                    language: value,
                    updatedAt: new Date()
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Стартовый узел
                </label>
                <Select 
                  value={script.startNodeId} 
                  onValueChange={(value) => setScript(prev => prev ? {
                    ...prev,
                    startNodeId: value,
                    updatedAt: new Date()
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {script.nodes.map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.content.substring(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Область редактирования */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Визуальный редактор ({script.nodes.length} узлов)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPreviewMode ? (
                // Режим превью
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      Режим превью
                    </div>
                    <div className="text-sm text-blue-700">
                      Здесь будет интерактивный превью скрипта с возможностью 
                      пройти по всем ветвлениям диалога.
                    </div>
                  </div>
                </div>
              ) : (
                // Режим редактирования
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {script.nodes.map((node, index) => (
                    <div
                      key={node.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedNode === node.id 
                          ? 'ring-2 ring-blue-500 ' + getNodeColor(node.type)
                          : getNodeColor(node.type)
                      } ${script.startNodeId === node.id ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 mb-2">
                          {getNodeIcon(node.type)}
                          <span className="font-medium text-sm">
                            {node.type === 'message' && 'Сообщение'}
                            {node.type === 'question' && 'Вопрос'}
                            {node.type === 'condition' && 'Условие'}
                            {node.type === 'action' && 'Действие'}
                          </span>
                          {script.startNodeId === node.id && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Старт
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNode(node.id)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-2">
                        {node.content}
                      </div>
                      
                      {node.branches && (
                        <div className="space-y-1">
                          {Object.entries(node.branches).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2 text-xs">
                              <Badge variant="outline">{key}</Badge>
                              <span className="text-gray-500">→</span>
                              <span className="text-gray-600">
                                {value || 'Не связано'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {node.variables && node.variables.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {node.variables.map((variable, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {'{' + variable + '}'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {script.nodes.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Нет узлов в скрипте</p>
                      <p className="text-sm">Добавьте первый узел из панели слева</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Панель свойств */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedNodeData ? 'Свойства узла' : 'Выберите узел'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNodeData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тип узла
                    </label>
                    <div className="flex items-center space-x-2">
                      {getNodeIcon(selectedNodeData.type)}
                      <span className="text-sm font-medium">
                        {selectedNodeData.type === 'message' && 'Сообщение'}
                        {selectedNodeData.type === 'question' && 'Вопрос'}
                        {selectedNodeData.type === 'condition' && 'Условие'}
                        {selectedNodeData.type === 'action' && 'Действие'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Содержимое
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={selectedNodeData.content}
                      onChange={(e) => updateNode(selectedNode!, { content: e.target.value })}
                      placeholder="Введите текст..."
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Используйте переменные: {'{name}'}, {'{brand}'}, {'{agent_name}'}
                    </div>
                  </div>

                  {selectedNodeData.branches && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ветвления
                      </label>
                      <div className="space-y-2">
                        {Object.entries(selectedNodeData.branches).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-xs text-gray-600 mb-1">
                              {key === 'yes' && 'Да'}
                              {key === 'no' && 'Нет'}
                              {key === 'maybe' && 'Возможно'}
                              {key === 'true' && 'Истина'}
                              {key === 'false' && 'Ложь'}
                              {!['yes', 'no', 'maybe', 'true', 'false'].includes(key) && key}
                            </label>
                            <Select 
                              value={value || ''} 
                              onValueChange={(newValue) => {
                                const newBranches = { ...selectedNodeData.branches, [key]: newValue }
                                updateNode(selectedNode!, { branches: newBranches })
                              }}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Выберите узел" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Не связано</SelectItem>
                                {script.nodes
                                  .filter(n => n.id !== selectedNode)
                                  .map((node) => (
                                    <SelectItem key={node.id} value={node.id}>
                                      {node.content.substring(0, 30)}...
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedNodeData.type === 'action' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Действия
                      </label>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-600">
                          Настройка автоматических действий (в разработке)
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScript(prev => prev ? {
                        ...prev,
                        startNodeId: selectedNode!,
                        updatedAt: new Date()
                      } : null)}
                      disabled={script.startNodeId === selectedNode}
                      className="w-full"
                    >
                      Сделать стартовым
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Edit className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">
                    Выберите узел для редактирования его свойств
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Переменные */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Доступные переменные</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{'{name}'}</code>
                  <span className="text-gray-600 text-xs">Имя клиента</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{'{brand}'}</code>
                  <span className="text-gray-600 text-xs">Название бренда</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{'{agent_name}'}</code>
                  <span className="text-gray-600 text-xs">Имя агента</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{'{phone}'}</code>
                  <span className="text-gray-600 text-xs">Телефон клиента</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function ScriptEditPage({ params }: ScriptEditPageProps) {
  const { id } = await params
  return <ScriptEditPageClient id={id} />
}
