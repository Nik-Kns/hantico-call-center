'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Zap, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Eye,
  Copy,
  MoreHorizontal,
  ArrowRight,
  MessageSquare,
  UserPlus,
  Calendar,
  Phone,
  AlertTriangle,
  CheckCircle
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
import { mockAutomationRules } from '@/lib/mock-data'
import { AutomationRule } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>(mockAutomationRules)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [eventFilter, setEventFilter] = useState<string>('all')

  // Фильтрация правил
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && rule.isActive) ||
                         (statusFilter === 'inactive' && !rule.isActive)
    const matchesEvent = eventFilter === 'all' || rule.trigger.event === eventFilter
    
    return matchesSearch && matchesStatus && matchesEvent
  })

  // Действия с правилами
  const handleRuleAction = (ruleId: string, action: string) => {
    switch (action) {
      case 'toggle_active':
        setRules(prev => prev.map(rule => 
          rule.id === ruleId 
            ? { ...rule, isActive: !rule.isActive }
            : rule
        ))
        break
      case 'edit':
        // В реальном приложении открыли бы редактор правил
        alert('Редактирование правила (в разработке)')
        break
      case 'duplicate':
        const original = rules.find(r => r.id === ruleId)
        if (original) {
          const duplicate: AutomationRule = {
            ...original,
            id: `rule-${Date.now()}`,
            name: `${original.name} (копия)`,
            isActive: false
          }
          setRules(prev => [...prev, duplicate])
        }
        break
      case 'delete':
        if (confirm('Вы уверены, что хотите удалить это правило?')) {
          setRules(prev => prev.filter(rule => rule.id !== ruleId))
        }
        break
    }
  }

  const getRuleStats = () => {
    const total = filteredRules.length
    const active = filteredRules.filter(r => r.isActive).length
    const inactive = filteredRules.filter(r => !r.isActive).length
    
    return { total, active, inactive }
  }

  const stats = getRuleStats()

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'call_completed':
        return <Phone className="h-4 w-4 text-blue-600" />
      case 'task_created':
        return <UserPlus className="h-4 w-4 text-green-600" />
      case 'sms_sent':
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      default:
        return <Zap className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_sms':
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case 'create_task':
        return <UserPlus className="h-4 w-4 text-green-600" />
      case 'update_lead':
        return <Edit className="h-4 w-4 text-blue-600" />
      case 'schedule_call':
        return <Calendar className="h-4 w-4 text-orange-600" />
      default:
        return <Zap className="h-4 w-4 text-gray-600" />
    }
  }

  const getEventLabel = (event: string) => {
    switch (event) {
      case 'call_completed': return 'Звонок завершен'
      case 'task_created': return 'Задача создана'
      case 'sms_sent': return 'SMS отправлена'
      default: return event
    }
  }

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'send_sms': return 'Отправить SMS'
      case 'create_task': return 'Создать задачу'
      case 'update_lead': return 'Обновить лида'
      case 'schedule_call': return 'Запланировать звонок'
      default: return actionType
    }
  }

  const getConditionText = (condition: any) => {
    const { field, operator, value } = condition
    
    const operatorLabels: Record<string, string> = {
      'equals': '=',
      'contains': 'содержит',
      'greater_than': '>',
      'less_than': '<'
    }

    const fieldLabels: Record<string, string> = {
      'outcome': 'исход',
      'consentSms': 'согласие SMS',
      'status': 'статус',
      'priority': 'приоритет'
    }

    return `${fieldLabels[field] || field} ${operatorLabels[operator] || operator} ${value}`
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Автоматизация</h1>
          <p className="text-gray-600">
            Управление автоматическими правилами и триггерами
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать правило
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего правил</div>
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
                  placeholder="Поиск по названию правила..."
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

              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Событие" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все события</SelectItem>
                  <SelectItem value="call_completed">Звонок завершен</SelectItem>
                  <SelectItem value="task_created">Задача создана</SelectItem>
                  <SelectItem value="sms_sent">SMS отправлена</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список правил */}
      <div className="space-y-4">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => (
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {rule.name}
                      </h3>
                      <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {rule.isActive ? 'Активно' : 'Неактивно'}
                      </Badge>
                      <Badge variant="outline">
                        Приоритет {rule.priority}
                      </Badge>
                    </div>
                    
                    {/* Триггер */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Триггер</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        {getEventIcon(rule.trigger.event)}
                        <span className="font-medium">{getEventLabel(rule.trigger.event)}</span>
                        
                        {rule.trigger.conditions.length > 0 && (
                          <>
                            <span className="text-gray-500">при условии:</span>
                            <div className="flex flex-wrap gap-2">
                              {rule.trigger.conditions.map((condition, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {getConditionText(condition)}
                                </Badge>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          Действия ({rule.actions.length})
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {rule.actions.map((action, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            {getActionIcon(action.type)}
                            <span>{getActionLabel(action.type)}</span>
                            
                            {action.config.templateId && (
                              <Badge variant="outline" className="text-xs">
                                Шаблон: {action.config.templateId}
                              </Badge>
                            )}
                            
                            {action.config.delay && (
                              <Badge variant="outline" className="text-xs">
                                Задержка: {action.config.delay}с
                              </Badge>
                            )}
                            
                            {action.config.priority && (
                              <Badge variant="outline" className="text-xs">
                                Приоритет: {action.config.priority}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Быстрые действия */}
                    <Button
                      size="sm"
                      variant={rule.isActive ? "default" : "outline"}
                      onClick={() => handleRuleAction(rule.id, 'toggle_active')}
                      title={rule.isActive ? "Деактивировать" : "Активировать"}
                    >
                      {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRuleAction(rule.id, 'edit')}
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
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
                          onClick={() => handleRuleAction(rule.id, 'edit')}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRuleAction(rule.id, 'duplicate')}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Дублировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRuleAction(rule.id, 'toggle_active')}
                        >
                          {rule.isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                          {rule.isActive ? 'Деактивировать' : 'Активировать'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRuleAction(rule.id, 'delete')}
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
                  {searchQuery || statusFilter !== 'all' || eventFilter !== 'all' 
                    ? 'Нет правил, соответствующих выбранным фильтрам'
                    : 'Пока нет созданных правил автоматизации'
                  }
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать первое правило
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Информационные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-800 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Как работает автоматизация
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-2">
              <p>
                <strong>Триггеры</strong> отслеживают события в системе (завершение звонка, создание задачи и т.д.)
              </p>
              <p>
                <strong>Условия</strong> определяют, когда правило должно сработать (исход звонка, статус лида и т.д.)
              </p>
              <p>
                <strong>Действия</strong> выполняются автоматически при соблюдении всех условий
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-base text-green-800 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Примеры использования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-700 space-y-2">
              <p>• Автоматическая отправка SMS при получении согласия</p>
              <p>• Создание задач менеджеру при отказе клиента</p>
              <p>• Планирование повторных звонков при занятом</p>
              <p>• Обновление статуса лида после регистрации</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Активные правила в реальном времени */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Последние срабатывания правил
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-sm">Отправка SMS при согласии</div>
                  <div className="text-xs text-gray-600">Лид: +7 900 123-45-67 • 2 минуты назад</div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Успешно</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">Создание задачи при отказе</div>
                  <div className="text-xs text-gray-600">Лид: +7 900 765-43-21 • 5 минут назад</div>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Выполнено</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-sm">Планирование повтора при &quot;занято&quot;</div>
                  <div className="text-xs text-gray-600">Лид: +7 900 555-55-55 • 8 минут назад</div>
                </div>
              </div>
              <Badge className="bg-orange-100 text-orange-800">Запланировано</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
