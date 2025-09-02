'use client'

import React, { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  Filter, 
  Phone, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  MoreHorizontal,
  Eye,
  PhoneOff
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
import { Checkbox } from '@/components/ui/checkbox'
import { 
  mockCalls, 
  mockLeads, 
  mockCampaigns, 
  mockQueueStatus 
} from '@/lib/mock-data'
import { Call, Lead, Campaign, CallOutcome, LeadStatus } from '@/lib/types'
import { 
  getStatusColor, 
  getStatusText, 
  formatTime, 
  formatPhoneNumber, 
  formatCallDuration 
} from '@/lib/utils'

interface QueueItem {
  id: string
  leadId: string
  campaignId: string
  phone: string
  name?: string
  status: 'active' | 'waiting' | 'error'
  priority: number
  attempts: number
  scheduledAt?: Date
  startedAt?: Date
  estimatedDuration?: number
  lastOutcome?: CallOutcome
  campaign: Campaign
  lead: Lead
}

// Генерация моковых данных очереди
const generateQueueItems = (): QueueItem[] => {
  const items: QueueItem[] = []
  
  // Активные звонки
  for (let i = 0; i < 8; i++) {
    const lead = mockLeads[i % mockLeads.length]
    const campaign = mockCampaigns[i % mockCampaigns.length]
    
    items.push({
      id: `queue-active-${i}`,
      leadId: lead.id,
      campaignId: campaign.id,
      phone: lead.phone,
      name: lead.name,
      status: 'active',
      priority: campaign.priority,
      attempts: Math.floor(Math.random() * 3) + 1,
      startedAt: new Date(Date.now() - Math.random() * 300000), // 0-5 минут назад
      estimatedDuration: Math.floor(Math.random() * 300) + 60, // 1-6 минут
      campaign,
      lead
    })
  }
  
  // Ожидающие звонки
  for (let i = 0; i < 127; i++) {
    const lead = mockLeads[i % mockLeads.length]
    const campaign = mockCampaigns[i % mockCampaigns.length]
    const outcomes: CallOutcome[] = ['no_answer', 'busy', 'voicemail']
    
    items.push({
      id: `queue-waiting-${i}`,
      leadId: lead.id,
      campaignId: campaign.id,
      phone: lead.phone,
      name: lead.name,
      status: 'waiting',
      priority: campaign.priority,
      attempts: Math.floor(Math.random() * 2) + 1,
      scheduledAt: new Date(Date.now() + Math.random() * 7200000), // 0-2 часа в будущем
      lastOutcome: i > 50 ? outcomes[i % outcomes.length] : undefined,
      campaign,
      lead
    })
  }
  
  // Ошибки
  for (let i = 0; i < 3; i++) {
    const lead = mockLeads[i % mockLeads.length]
    const campaign = mockCampaigns[i % mockCampaigns.length]
    
    items.push({
      id: `queue-error-${i}`,
      leadId: lead.id,
      campaignId: campaign.id,
      phone: lead.phone,
      name: lead.name,
      status: 'error',
      priority: campaign.priority,
      attempts: Math.floor(Math.random() * 3) + 1,
      lastOutcome: 'invalid',
      campaign,
      lead
    })
  }
  
  return items
}

export default function QueuePage() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'waiting' | 'errors'>('active')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [campaignFilter, setCampaignFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Инициализация данных
  useEffect(() => {
    setQueueItems(generateQueueItems())
  }, [])

  // Автообновление каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        setQueueItems(generateQueueItems())
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isLoading])

  // Фильтрация элементов
  const filteredItems = queueItems.filter(item => {
    const matchesTab = item.status === activeTab
    const matchesCampaign = campaignFilter === 'all' || item.campaignId === campaignFilter
    const matchesPriority = priorityFilter === 'all' || item.priority.toString() === priorityFilter
    
    return matchesTab && matchesCampaign && matchesPriority
  })

  // Обновление данных
  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setQueueItems(generateQueueItems())
    setIsLoading(false)
  }

  // Выбор элементов
  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  // Массовые действия
  const handleBulkAction = (action: string) => {
    const selectedCount = selectedItems.size
    
    switch (action) {
      case 'remove':
        if (confirm(`Удалить ${selectedCount} элементов из очереди?`)) {
          setQueueItems(prev => prev.filter(item => !selectedItems.has(item.id)))
          setSelectedItems(new Set())
        }
        break
      case 'priority_high':
        setQueueItems(prev => prev.map(item => 
          selectedItems.has(item.id) ? { ...item, priority: 10 } : item
        ))
        setSelectedItems(new Set())
        break
      case 'priority_low':
        setQueueItems(prev => prev.map(item => 
          selectedItems.has(item.id) ? { ...item, priority: 1 } : item
        ))
        setSelectedItems(new Set())
        break
      case 'reschedule':
        const hours = prompt('Через сколько часов запланировать повтор?', '2')
        if (hours) {
          const hoursNum = parseInt(hours)
          if (!isNaN(hoursNum)) {
            setQueueItems(prev => prev.map(item => 
              selectedItems.has(item.id) 
                ? { 
                    ...item, 
                    scheduledAt: new Date(Date.now() + hoursNum * 3600000),
                    status: 'waiting' as const
                  } 
                : item
            ))
            setSelectedItems(new Set())
          }
        }
        break
    }
  }

  // Действия с элементом
  const handleItemAction = (itemId: string, action: string) => {
    switch (action) {
      case 'view_lead':
        window.open(`/leads/${queueItems.find(i => i.id === itemId)?.leadId}`, '_blank')
        break
      case 'view_campaign':
        window.open(`/campaigns/${queueItems.find(i => i.id === itemId)?.campaignId}`, '_blank')
        break
      case 'remove':
        setQueueItems(prev => prev.filter(item => item.id !== itemId))
        break
      case 'priority_up':
        setQueueItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, priority: Math.min(10, item.priority + 1) } : item
        ))
        break
      case 'priority_down':
        setQueueItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, priority: Math.max(1, item.priority - 1) } : item
        ))
        break
    }
  }

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'active':
        return <Phone className="h-4 w-4 text-green-600 animate-pulse" />
      case 'waiting':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getTabCount = (status: QueueItem['status']) => {
    return queueItems.filter(item => item.status === status).length
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Очередь звонков</h1>
          <p className="text-gray-600">
            Мониторинг активных звонков и управление очередью
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          

        </div>
      </div>

      {/* Статистика очереди */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные звонки</p>
                <p className="text-2xl font-bold text-green-600">{getTabCount('active')}</p>
              </div>
              <Phone className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В очереди</p>
                <p className="text-2xl font-bold text-blue-600">{getTabCount('waiting')}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ошибки</p>
                <p className="text-2xl font-bold text-red-600">{getTabCount('error')}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средняя длительность</p>
                <p className="text-2xl font-bold text-gray-900">3:45</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Табы и фильтры */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Активные ({getTabCount('active')})
          </button>
          <button
            onClick={() => setActiveTab('waiting')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'waiting'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ожидают ({getTabCount('waiting')})
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'errors'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ошибки ({getTabCount('error')})
          </button>
        </div>

        <div className="flex gap-2">
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Кампания" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все кампании</SelectItem>
              {mockCampaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Приоритет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="10">Высокий (10)</SelectItem>
              <SelectItem value="8">Высокий (8-9)</SelectItem>
              <SelectItem value="5">Средний (5-7)</SelectItem>
              <SelectItem value="1">Низкий (1-4)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Массовые действия */}
      {selectedItems.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Выбрано: {selectedItems.size} элементов
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('priority_high')}
                >
                  Высокий приоритет
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('priority_low')}
                >
                  Низкий приоритет
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('reschedule')}
                >
                  Перенести
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('remove')}
                  className="text-red-600 hover:text-red-700"
                >
                  Удалить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Список элементов очереди */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {activeTab === 'active' && 'Активные звонки'}
              {activeTab === 'waiting' && 'Ожидающие звонки'}
              {activeTab === 'errors' && 'Ошибки очереди'}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Выбрать все</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredItems.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                      />
                      
                      {getStatusIcon(item.status)}
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {formatPhoneNumber(item.phone)}
                          </span>
                          {item.name && (
                            <span className="text-gray-600">({item.name})</span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Попытка {item.attempts}
                          </Badge>
                          <Badge 
                            className={`text-xs ${
                              item.priority >= 8 ? 'bg-red-100 text-red-800' :
                              item.priority >= 5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Приоритет {item.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Кампания: {item.campaign.name}</span>
                          
                          {item.status === 'active' && item.startedAt && (
                            <span>
                              Длительность: {formatCallDuration(
                                Math.floor((Date.now() - item.startedAt.getTime()) / 1000)
                              )}
                            </span>
                          )}
                          
                          {item.status === 'waiting' && item.scheduledAt && (
                            <span>
                              Запланирован на: {formatTime(item.scheduledAt)}
                            </span>
                          )}
                          
                          {item.lastOutcome && (
                            <span>
                              Последний исход: {getStatusText(item.lastOutcome)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.status === 'active' && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                          <span className="text-xs font-medium">В разговоре</span>
                        </div>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleItemAction(item.id, 'view_lead')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Карточка лида
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleItemAction(item.id, 'view_campaign')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Кампания
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleItemAction(item.id, 'priority_up')}
                          >
                            Повысить приоритет
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleItemAction(item.id, 'priority_down')}
                          >
                            Понизить приоритет
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleItemAction(item.id, 'remove')}
                            className="text-red-600"
                          >
                            <PhoneOff className="mr-2 h-4 w-4" />
                            Удалить из очереди
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {activeTab === 'active' && 'Нет активных звонков'}
              {activeTab === 'waiting' && 'Нет ожидающих звонков'}
              {activeTab === 'errors' && 'Нет ошибок в очереди'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
