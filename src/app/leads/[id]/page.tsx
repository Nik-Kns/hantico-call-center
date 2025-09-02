'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Ban, 
  Edit, 
  Save,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Tag,
  Globe,
  MapPin
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  mockLeads, 
  mockDataUtils, 
  mockSmsTemplates,
  mockTasks
} from '@/lib/mock-data'
import { Lead, Call, Task, Sms } from '@/lib/types'
import { 
  getStatusColor, 
  getStatusText, 
  formatPhoneNumber, 
  formatDate, 
  formatCallDuration 
} from '@/lib/utils'

interface LeadDetailPageProps {
  params: Promise<{
    id: string
  }>
}

function LeadDetailPageClient({ id }: { id: string }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [lead, setLead] = useState<Lead | null>(
    mockLeads.find(l => l.id === id) || null
  )
  const [editedLead, setEditedLead] = useState<Lead | null>(lead)

  if (!lead) {
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
            <h1 className="text-2xl font-bold text-gray-900">Лид не найден</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
                              <p>Лид с ID {id} не найден</p>
              <Button 
                onClick={() => router.push('/leads')} 
                className="mt-4"
              >
                Вернуться к списку лидов
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Получение связанных данных
  const calls = mockDataUtils.getCallsByLead(lead.id)
  const tasks = mockDataUtils.getTasksByLead(lead.id)
  const sms = mockDataUtils.getSmsByLead(lead.id)

  // Сохранение изменений
  const handleSave = () => {
    if (editedLead) {
      setLead(editedLead)
      // В реальном приложении здесь был бы API вызов
      console.log('Сохранение лида:', editedLead)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedLead(lead)
    setIsEditing(false)
  }

  // Действия с лидом
  const handleAction = (action: string) => {
    switch (action) {
      case 'call':
        alert('Звонок запущен!')
        break
      case 'sms':
        const template = mockSmsTemplates[0]
        const variables = {
          name: lead.name || 'Клиент',
          link: 'https://example.com/register',
          brand: 'AIGAMING.BOT'
        }
        const newSms = mockDataUtils.sendSms(lead.id, template.id, variables)
        if (newSms) {
          alert('SMS отправлена!')
        }
        break
      case 'task':
        mockDataUtils.createTask({
          leadId: lead.id,
          title: 'Ручная задача для лида',
          reason: 'manual',
          priority: 'medium',
          status: 'pending',
          assigneeRole: 'manager',
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })
        alert('Задача создана!')
        break
      case 'blacklist':
        if (confirm('Добавить лида в черный список?')) {
          setLead(prev => prev ? {
            ...prev,
            status: 'blacklisted',
            blacklist: true,
            updatedAt: new Date()
          } : null)
        }
        break
      case 'schedule':
        const hours = prompt('Через сколько часов запланировать звонок?', '2')
        if (hours) {
          const hoursNum = parseInt(hours)
          if (!isNaN(hoursNum)) {
            setLead(prev => prev ? {
              ...prev,
              status: 'in_queue',
              updatedAt: new Date()
            } : null)
            alert(`Звонок запланирован через ${hoursNum} часов`)
          }
        }
        break
    }
  }

  const getCallIcon = (outcome: string) => {
    switch (outcome) {
      case 'answer_success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'answer_refuse':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'no_answer':
        return <Phone className="h-4 w-4 text-yellow-600" />
      case 'busy':
        return <Phone className="h-4 w-4 text-orange-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

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
              {formatPhoneNumber(lead.phone)}
            </h1>
            <p className="text-gray-600">
              {lead.name ? `${lead.name} • ` : ''}Карточка лида
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
              
              {!lead.blacklist && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => handleAction('call')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Позвонить
                  </Button>
                  
                  {lead.consentSms && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleAction('sms')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      SMS
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Информация о лиде */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Информация о лиде</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing && editedLead ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedLead.phone}
                      onChange={(e) => setEditedLead({
                        ...editedLead,
                        phone: e.target.value
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedLead.name || ''}
                      onChange={(e) => setEditedLead({
                        ...editedLead,
                        name: e.target.value || undefined
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сегмент
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedLead.segment || ''}
                      onChange={(e) => setEditedLead({
                        ...editedLead,
                        segment: e.target.value || undefined
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Язык
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedLead.language || ''}
                      onChange={(e) => setEditedLead({
                        ...editedLead,
                        language: e.target.value || undefined
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={editedLead.consentSms}
                      onCheckedChange={(checked) => setEditedLead({
                        ...editedLead,
                        consentSms: checked as boolean
                      })}
                    />
                    <label className="text-sm text-gray-700">
                      Согласие на SMS
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={editedLead.blacklist}
                      onCheckedChange={(checked) => setEditedLead({
                        ...editedLead,
                        blacklist: checked as boolean,
                        status: checked ? 'blacklisted' : 'new'
                      })}
                    />
                    <label className="text-sm text-gray-700">
                      Черный список
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatPhoneNumber(lead.phone)}</span>
                  </div>
                  
                  {lead.name && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{lead.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(lead.status)}>
                      {getStatusText(lead.status)}
                    </Badge>
                    {lead.segment && (
                      <Badge variant="outline">{lead.segment}</Badge>
                    )}
                  </div>
                  
                  {lead.language && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>{lead.language}</span>
                    </div>
                  )}
                  
                  {lead.timezone && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{lead.timezone}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {lead.consentSms && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        SMS согласие ✓
                      </Badge>
                    )}
                    {lead.blacklist && (
                      <Badge className="bg-black text-white text-xs">
                        Черный список
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* История звонков */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">История звонков ({calls.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {calls.length > 0 ? (
                <div className="space-y-4">
                  {calls.map((call) => (
                    <div key={call.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCallIcon(call.outcome)}
                          <span className="font-medium">
                            {getStatusText(call.outcome)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Попытка {call.attemptNumber}
                          </Badge>
                          {call.consentSms && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              SMS согласие
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(call.startedAt)}
                        </div>
                      </div>
                      
                      {call.duration && (
                        <div className="text-sm text-gray-600 mb-2">
                          Длительность: {formatCallDuration(call.duration)}
                        </div>
                      )}
                      
                      {call.summary && (
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>Итог:</strong> {call.summary}
                        </div>
                      )}
                      
                      {call.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {call.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/calls/${call.id}`)}
                        >
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Пока нет звонков</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* История SMS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">История SMS ({sms.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sms.length > 0 ? (
                <div className="space-y-4">
                  {sms.map((message) => (
                    <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(message.status)}>
                          {getStatusText(message.status)}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          {message.sentAt ? formatDate(message.sentAt) : 'Не отправлено'}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-2">
                        {message.text}
                      </div>
                      
                      {message.deliveredAt && (
                        <div className="text-xs text-gray-500">
                          Доставлено: {formatDate(message.deliveredAt)}
                        </div>
                      )}
                      
                      {message.error && (
                        <div className="text-xs text-red-600">
                          Ошибка: {message.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Пока нет SMS</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!lead.blacklist && (
                <>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleAction('call')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Позвонить сейчас
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleAction('schedule')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Запланировать звонок
                  </Button>
                  
                  {lead.consentSms && (
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => handleAction('sms')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Отправить SMS
                    </Button>
                  )}
                </>
              )}
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleAction('task')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Создать задачу
              </Button>
              
              {!lead.blacklist && (
                <Button 
                  className="w-full justify-start text-red-600 hover:text-red-700" 
                  variant="outline"
                  onClick={() => handleAction('blacklist')}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  В черный список
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Метаданные */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Метаданные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">ID:</span>
                <span className="ml-2 font-mono">{lead.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Создан:</span>
                <span className="ml-2">{formatDate(lead.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-600">Обновлен:</span>
                <span className="ml-2">{formatDate(lead.updatedAt)}</span>
              </div>
              {lead.lastCallAt && (
                <div>
                  <span className="text-gray-600">Последний звонок:</span>
                  <span className="ml-2">{formatDate(lead.lastCallAt)}</span>
                </div>
              )}
              {lead.registrationDate && (
                <div>
                  <span className="text-gray-600">Регистрация:</span>
                  <span className="ml-2">{formatDate(lead.registrationDate)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Теги */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Теги</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Нет тегов</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Активные задачи */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Активные задачи ({tasks.filter(t => t.status !== 'completed').length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.filter(t => t.status !== 'completed').length > 0 ? (
                <div className="space-y-2">
                  {tasks
                    .filter(t => t.status !== 'completed')
                    .map((task) => (
                      <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                          <Badge className={getStatusColor(task.priority)}>
                            {getStatusText(task.priority)}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          До: {formatDate(task.dueAt)}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Нет активных задач</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params
  return <LeadDetailPageClient id={id} />
}
