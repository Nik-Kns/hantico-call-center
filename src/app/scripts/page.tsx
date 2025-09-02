'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Edit, 
  Copy, 
  Trash2,
  Eye,
  MoreHorizontal,
  MessageCircle,
  GitBranch,
  Settings
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockScripts } from '@/lib/mock-data'
import { Script } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function ScriptsPage() {
  const router = useRouter()
  const [scripts, setScripts] = useState<Script[]>(mockScripts)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [languageFilter, setLanguageFilter] = useState<string>('all')

  // Фильтрация скриптов
  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         script.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && script.isActive) ||
                         (statusFilter === 'inactive' && !script.isActive)
    const matchesLanguage = languageFilter === 'all' || script.language === languageFilter
    
    return matchesSearch && matchesStatus && matchesLanguage
  })

  // Действия со скриптами
  const handleScriptAction = (scriptId: string, action: string) => {
    switch (action) {
      case 'view':
        router.push(`/scripts/${scriptId}`)
        break
      case 'edit':
        router.push(`/scripts/${scriptId}/edit`)
        break
      case 'duplicate':
        const original = scripts.find(s => s.id === scriptId)
        if (original) {
          const duplicate: Script = {
            ...original,
            id: `script-${Date.now()}`,
            name: `${original.name} (копия)`,
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          setScripts(prev => [...prev, duplicate])
        }
        break
      case 'toggle_active':
        setScripts(prev => prev.map(script => 
          script.id === scriptId 
            ? { ...script, isActive: !script.isActive, updatedAt: new Date() }
            : script
        ))
        break
      case 'delete':
        if (confirm('Вы уверены, что хотите удалить этот скрипт?')) {
          setScripts(prev => prev.filter(script => script.id !== scriptId))
        }
        break
    }
  }

  const getScriptStats = () => {
    const total = filteredScripts.length
    const active = filteredScripts.filter(s => s.isActive).length
    const inactive = filteredScripts.filter(s => !s.isActive).length
    
    return { total, active, inactive }
  }

  const stats = getScriptStats()

  const getNodeTypeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-600" />
      case 'question':
        return <MessageCircle className="h-4 w-4 text-green-600" />
      case 'condition':
        return <GitBranch className="h-4 w-4 text-orange-600" />
      case 'action':
        return <Settings className="h-4 w-4 text-purple-600" />
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Скрипты</h1>
          <p className="text-gray-600">
            Управление скриптами для AI-агентов и их ветвлениями
          </p>
        </div>
        
        <Button onClick={() => router.push('/scripts/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Создать скрипт
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего скриптов</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Активных</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
              <div className="text-sm text-gray-600">Неактивных</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию или описанию..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>

              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Язык" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список скриптов */}
      <div className="space-y-4">
        {filteredScripts.length > 0 ? (
          filteredScripts.map((script) => (
            <Card key={script.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {script.name}
                      </h3>
                      <Badge className={script.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {script.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                      <Badge variant="outline">
                        {script.language === 'ru' ? 'Русский' : 'English'}
                      </Badge>
                      <Badge variant="outline">
                        v{script.version}
                      </Badge>
                    </div>
                    
                    {script.description && (
                      <p className="text-gray-600 mb-3">{script.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{script.nodes.length} узлов</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <GitBranch className="h-4 w-4" />
                        <span>
                          {script.nodes.filter(n => n.branches && Object.keys(n.branches).length > 1).length} ветвлений
                        </span>
                      </div>
                      
                      <span>Создан: {formatDate(script.createdAt)}</span>
                      <span>Обновлен: {formatDate(script.updatedAt)}</span>
                    </div>

                    {/* Превью узлов скрипта */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Структура скрипта:</div>
                      <div className="space-y-2">
                        {script.nodes.slice(0, 3).map((node, index) => (
                          <div key={node.id} className="flex items-center space-x-2 text-sm">
                            {getNodeTypeIcon(node.type)}
                            <span className="text-gray-600">
                              {node.type === 'message' && 'Сообщение:'}
                              {node.type === 'question' && 'Вопрос:'}
                              {node.type === 'condition' && 'Условие:'}
                              {node.type === 'action' && 'Действие:'}
                            </span>
                            <span className="truncate max-w-md">
                              {node.content.length > 60 
                                ? `${node.content.substring(0, 60)}...`
                                : node.content
                              }
                            </span>
                            {node.branches && Object.keys(node.branches).length > 1 && (
                              <Badge variant="outline" className="text-xs">
                                {Object.keys(node.branches).length} вариантов
                              </Badge>
                            )}
                          </div>
                        ))}
                        
                        {script.nodes.length > 3 && (
                          <div className="text-xs text-gray-500">
                            ... и еще {script.nodes.length - 3} узлов
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Быстрые действия */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScriptAction(script.id, 'view')}
                      title="Просмотр"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScriptAction(script.id, 'edit')}
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={script.isActive ? "default" : "outline"}
                      onClick={() => handleScriptAction(script.id, 'toggle_active')}
                      title={script.isActive ? "Деактивировать" : "Активировать"}
                    >
                      {script.isActive ? <Play className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    {/* Меню действий */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => handleScriptAction(script.id, 'view')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Просмотр
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleScriptAction(script.id, 'edit')}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleScriptAction(script.id, 'duplicate')}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Дублировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleScriptAction(script.id, 'toggle_active')}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {script.isActive ? 'Деактивировать' : 'Активировать'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleScriptAction(script.id, 'delete')}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  {searchQuery || statusFilter !== 'all' || languageFilter !== 'all' 
                    ? 'Нет скриптов, соответствующих выбранным фильтрам'
                    : 'Пока нет созданных скриптов'
                  }
                </p>
                <Button onClick={() => router.push('/scripts/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать первый скрипт
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Информационная карточка */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">
            💡 О скриптах
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>Скрипты</strong> определяют логику разговора AI-агента с клиентами. 
              Каждый скрипт состоит из узлов разных типов:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Сообщение</strong> — агент произносит текст</li>
              <li><strong>Вопрос</strong> — агент задает вопрос и ждет ответа</li>
              <li><strong>Условие</strong> — ветвление логики на основе ответа</li>
              <li><strong>Действие</strong> — выполнение автоматического действия</li>
            </ul>
            <p>
              Используйте переменные вида <code>{'{name}'}</code>, <code>{'{brand}'}</code> 
              для персонализации сообщений.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
