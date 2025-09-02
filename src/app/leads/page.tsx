'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Phone, 
  MessageSquare,
  UserPlus,
  Ban,
  Calendar,
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
import { mockLeads, mockDataUtils } from '@/lib/mock-data'
import { Lead, LeadStatus } from '@/lib/types'
import { 
  getStatusColor, 
  getStatusText, 
  formatPhoneNumber, 
  formatDate 
} from '@/lib/utils'

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [segmentFilter, setSegmentFilter] = useState<string>('all')

  // Фильтрация лидов
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.phone.includes(searchQuery) ||
                         lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lead.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesSegment = segmentFilter === 'all' || lead.segment === segmentFilter
    
    return matchesSearch && matchesStatus && matchesSegment
  })

  // Действия с лидами
  const handleLeadAction = (leadId: string, action: string) => {
    switch (action) {
      case 'view':
        router.push(`/leads/${leadId}`)
        break
      case 'call':
        // Имитация запуска звонка
        setLeads(prev => prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: 'calling' as LeadStatus, updatedAt: new Date() }
            : lead
        ))
        alert('Звонок запущен!')
        break
      case 'sms':
        // Имитация отправки SMS
        alert('SMS отправлена!')
        break
      case 'task':
        // Имитация создания задачи
        mockDataUtils.createTask({
          leadId,
          title: 'Ручная задача для лида',
          reason: 'manual',
          priority: 'medium',
          status: 'pending',
          assigneeRole: 'manager',
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // завтра
        })
        alert('Задача создана!')
        break
      case 'blacklist':
        if (confirm('Добавить лида в черный список?')) {
          setLeads(prev => prev.map(lead => 
            lead.id === leadId 
              ? { 
                  ...lead, 
                  status: 'blacklisted' as LeadStatus, 
                  blacklist: true,
                  updatedAt: new Date() 
                }
              : lead
          ))
        }
        break
      case 'schedule':
        const hours = prompt('Через сколько часов запланировать звонок?', '2')
        if (hours) {
          const hoursNum = parseInt(hours)
          if (!isNaN(hoursNum)) {
            setLeads(prev => prev.map(lead => 
              lead.id === leadId 
                ? { 
                    ...lead, 
                    status: 'in_queue' as LeadStatus,
                    updatedAt: new Date() 
                  }
                : lead
            ))
            alert(`Звонок запланирован через ${hoursNum} часов`)
          }
        }
        break
    }
  }

  const getLeadStats = () => {
    const total = filteredLeads.length
    const byStatus = filteredLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<LeadStatus, number>)
    
    return { total, byStatus }
  }

  const stats = getLeadStats()

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Лиды</h1>
          <p className="text-gray-600">
            Управление базой контактов и история взаимодействий
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Добавить лида
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.success || 0}</div>
              <div className="text-sm text-gray-600">Успешные</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.byStatus.in_queue || 0}</div>
              <div className="text-sm text-gray-600">В очереди</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.byStatus.refused || 0}</div>
              <div className="text-sm text-gray-600">Отказы</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.byStatus.registered || 0}</div>
              <div className="text-sm text-gray-600">Зарегистрированы</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.byStatus.blacklisted || 0}</div>
              <div className="text-sm text-gray-600">ЧС</div>
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
                  placeholder="Поиск по телефону, имени или тегам..."
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
                  <SelectItem value="new">Новые</SelectItem>
                  <SelectItem value="in_queue">В очереди</SelectItem>
                  <SelectItem value="calling">Звоним</SelectItem>
                  <SelectItem value="called">Обзвонены</SelectItem>
                  <SelectItem value="success">Успешные</SelectItem>
                  <SelectItem value="refused">Отказы</SelectItem>
                  <SelectItem value="registered">Зарегистрированы</SelectItem>
                  <SelectItem value="blacklisted">ЧС</SelectItem>
                </SelectContent>
              </Select>

              <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Сегмент" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список лидов */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Лиды ({filteredLeads.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLeads.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const calls = mockDataUtils.getCallsByLead(lead.id)
                const tasks = mockDataUtils.getTasksByLead(lead.id)
                const sms = mockDataUtils.getSmsByLead(lead.id)
                
                return (
                  <div key={lead.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-gray-900">
                            {formatPhoneNumber(lead.phone)}
                          </span>
                          {lead.name && (
                            <span className="text-gray-600">({lead.name})</span>
                          )}
                          <Badge className={getStatusColor(lead.status)}>
                            {getStatusText(lead.status)}
                          </Badge>
                          {lead.segment && (
                            <Badge variant="outline">{lead.segment}</Badge>
                          )}
                          {lead.consentSms && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              SMS ✓
                            </Badge>
                          )}
                          {lead.blacklist && (
                            <Badge className="bg-black text-white text-xs">
                              ЧС
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>Звонков: {calls.length}</span>
                          <span>Задач: {tasks.length}</span>
                          <span>SMS: {sms.length}</span>
                          {lead.lastCallAt && (
                            <span>Последний звонок: {formatDate(lead.lastCallAt)}</span>
                          )}
                          <span>Создан: {formatDate(lead.createdAt)}</span>
                        </div>
                        
                        {lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {lead.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {/* Быстрые действия */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLeadAction(lead.id, 'view')}
                          title="Просмотр"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {!lead.blacklist && lead.status !== 'calling' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLeadAction(lead.id, 'call')}
                            title="Позвонить"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {lead.consentSms && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLeadAction(lead.id, 'sms')}
                            title="Отправить SMS"
                          >
                            <MessageSquare className="h-4 w-4" />
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
                            <DropdownMenuItem 
                              onClick={() => handleLeadAction(lead.id, 'view')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Карточка лида
                            </DropdownMenuItem>
                            
                            {!lead.blacklist && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleLeadAction(lead.id, 'call')}
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  Позвонить сейчас
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  onClick={() => handleLeadAction(lead.id, 'schedule')}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Запланировать звонок
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {lead.consentSms && (
                              <DropdownMenuItem 
                                onClick={() => handleLeadAction(lead.id, 'sms')}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Отправить SMS
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={() => handleLeadAction(lead.id, 'task')}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Создать задачу
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {!lead.blacklist && (
                              <DropdownMenuItem 
                                onClick={() => handleLeadAction(lead.id, 'blacklist')}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                В черный список
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
              {searchQuery || statusFilter !== 'all' || segmentFilter !== 'all' 
                ? 'Нет лидов, соответствующих выбранным фильтрам'
                : 'Нет лидов в базе'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
