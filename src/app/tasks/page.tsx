'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Eye,
  Edit,
  MoreHorizontal
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
import { mockTasks, mockLeads, mockDataUtils } from '@/lib/mock-data'
import { Task, TaskStatus, TaskPriority } from '@/lib/types'
import { 
  getStatusColor, 
  getStatusText, 
  formatPhoneNumber, 
  formatDate, 
  formatRelativeTime 
} from '@/lib/utils'

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')

  // Фильтрация задач
  const filteredTasks = tasks.filter(task => {
    const lead = mockLeads.find(l => l.id === task.leadId)
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead?.phone.includes(searchQuery) ||
                         lead?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Сортировка задач
  const sortedTasks = filteredTasks.sort((a, b) => {
    // Сначала по статусу (активные первые)
    const statusOrder = { 'pending': 0, 'in_progress': 1, 'completed': 2, 'cancelled': 3 }
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    
    // Затем по приоритету (высокий первый)
    const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    
    // Затем по дедлайну
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  })

  // Действия с задачами
  const handleTaskAction = (taskId: string, action: string) => {
    switch (action) {
      case 'complete':
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: 'completed' as TaskStatus, 
                completedAt: new Date(),
                updatedAt: new Date() 
              }
            : task
        ))
        break
      case 'start':
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: 'in_progress' as TaskStatus,
                updatedAt: new Date() 
              }
            : task
        ))
        break
      case 'cancel':
        if (confirm('Отменить эту задачу?')) {
          setTasks(prev => prev.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  status: 'cancelled' as TaskStatus,
                  updatedAt: new Date() 
                }
              : task
          ))
        }
        break
      case 'view_lead':
        const task = tasks.find(t => t.id === taskId)
        if (task) {
          router.push(`/leads/${task.leadId}`)
        }
        break
      case 'view_call':
        const taskWithCall = tasks.find(t => t.id === taskId)
        if (taskWithCall?.callId) {
          router.push(`/calls/${taskWithCall.callId}`)
        }
        break
    }
  }

  const getTaskStats = () => {
    const total = filteredTasks.length
    const byStatus = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<TaskStatus, number>)
    
    const overdue = filteredTasks.filter(task => 
      task.status !== 'completed' && task.status !== 'cancelled' && 
      new Date(task.dueAt) < new Date()
    ).length
    
    return { total, byStatus, overdue }
  }

  const stats = getTaskStats()

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const isOverdue = (task: Task) => {
    return task.status !== 'completed' && task.status !== 'cancelled' && 
           new Date(task.dueAt) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Задачи</h1>
          <p className="text-gray-600">
            Управление задачами и контроль выполнения
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать задачу
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Всего</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending || 0}</div>
              <div className="text-sm text-gray-600">Ожидают</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.byStatus.in_progress || 0}</div>
              <div className="text-sm text-gray-600">В работе</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.completed || 0}</div>
              <div className="text-sm text-gray-600">Выполнено</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">Просрочено</div>
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
                  placeholder="Поиск по названию, описанию или контакту..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">Ожидают</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="completed">Выполнено</SelectItem>
                  <SelectItem value="cancelled">Отменено</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(value: string) => setPriorityFilter(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="urgent">Срочно</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список задач */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Задачи ({sortedTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sortedTasks.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {sortedTasks.map((task) => {
                const lead = mockLeads.find(l => l.id === task.leadId)
                const overdue = isOverdue(task)
                
                return (
                  <div 
                    key={task.id} 
                    className={`p-4 hover:bg-gray-50 ${overdue ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          {getPriorityIcon(task.priority)}
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                          <Badge className={getStatusColor(task.priority)}>
                            {getStatusText(task.priority)}
                          </Badge>
                          {overdue && (
                            <Badge className="bg-red-100 text-red-800">
                              Просрочено
                            </Badge>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          {lead && (
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>
                                {formatPhoneNumber(lead.phone)}
                                {lead.name && ` (${lead.name})`}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              До: {formatDate(task.dueAt)}
                              {overdue && (
                                <span className="text-red-600 ml-1">
                                  ({formatRelativeTime(task.dueAt)})
                                </span>
                              )}
                            </span>
                          </div>
                          
                          <span>Создана: {formatDate(task.createdAt)}</span>
                          
                          {task.assigneeRole && (
                            <span>Исполнитель: {task.assigneeRole}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {/* Быстрые действия */}
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskAction(task.id, 'start')}
                          >
                            Начать
                          </Button>
                        )}
                        
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleTaskAction(task.id, 'complete')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Завершить
                          </Button>
                        )}

                        {/* Меню действий */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {task.status === 'pending' && (
                              <DropdownMenuItem 
                                onClick={() => handleTaskAction(task.id, 'start')}
                              >
                                Начать работу
                              </DropdownMenuItem>
                            )}
                            
                            {task.status === 'in_progress' && (
                              <DropdownMenuItem 
                                onClick={() => handleTaskAction(task.id, 'complete')}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Завершить
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={() => handleTaskAction(task.id, 'view_lead')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Карточка лида
                            </DropdownMenuItem>
                            
                            {task.callId && (
                              <DropdownMenuItem 
                                onClick={() => handleTaskAction(task.id, 'view_call')}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Связанный звонок
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Редактировать
                            </DropdownMenuItem>
                            
                            {task.status !== 'completed' && task.status !== 'cancelled' && (
                              <DropdownMenuItem 
                                onClick={() => handleTaskAction(task.id, 'cancel')}
                                className="text-red-600"
                              >
                                Отменить
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Нет задач, соответствующих выбранным фильтрам'
                : 'Нет задач'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Просроченные задачи */}
      {stats.overdue > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Внимание: {stats.overdue} просроченных задач
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-700">
              У вас есть просроченные задачи, которые требуют немедленного внимания. 
              Рекомендуется приоритизировать их выполнение.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
              onClick={() => {
                setStatusFilter('all')
                setPriorityFilter('all')
                setSearchQuery('')
              }}
            >
              Показать все просроченные
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
