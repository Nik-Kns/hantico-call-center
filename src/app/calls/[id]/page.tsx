'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  MessageSquare, 
  Calendar, 
  Save,
  Edit,
  Tag,
  User,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { mockCalls, mockLeads, mockCampaigns, mockDataUtils } from '@/lib/mock-data'
import { Call, CallOutcome, Lead, Campaign } from '@/lib/types'
import { 
  getStatusColor, 
  getStatusText, 
  formatPhoneNumber, 
  formatDate, 
  formatCallDuration 
} from '@/lib/utils'

interface CallDetailPageProps {
  params: Promise<{
    id: string
  }>
}

function CallDetailPageClient({ id }: { id: string }) {
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [call, setCall] = useState<Call | null>(
    mockCalls.find(c => c.id === id) || null
  )
  const [lead, setLead] = useState<Lead | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  
  const [editedOutcome, setEditedOutcome] = useState<CallOutcome>()
  const [editedConsent, setEditedConsent] = useState<boolean>()
  const [editedNotes, setEditedNotes] = useState<string>('')
  const [editedTags, setEditedTags] = useState<string[]>([])

  // Загрузка связанных данных
  useEffect(() => {
    if (call) {
      const foundLead = mockLeads.find(l => l.id === call.leadId)
      const foundCampaign = mockCampaigns.find(c => c.id === call.campaignId)
      
      setLead(foundLead || null)
      setCampaign(foundCampaign || null)
      
      // Инициализация редактируемых полей
      setEditedOutcome(call.outcome)
      setEditedConsent(call.consentSms)
      setEditedNotes(call.agentNotes || '')
      setEditedTags([...call.tags])
    }
  }, [call])

  // Обработчики аудиоплеера
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  // Сохранение изменений
  const handleSave = () => {
    if (!call) return

    const updatedCall: Call = {
      ...call,
      outcome: editedOutcome || call.outcome,
      consentSms: editedConsent !== undefined ? editedConsent : call.consentSms,
      agentNotes: editedNotes,
      tags: [...editedTags]
    }

    setCall(updatedCall)
    setIsEditing(false)

    // Применение автоматических правил
    if (editedOutcome === 'answer_success' && editedConsent) {
      // Автоматическая отправка SMS
      alert('SMS будет отправлена автоматически')
    } else if (editedOutcome === 'answer_refuse') {
      // Создание задачи менеджеру
      alert('Задача для менеджера создана автоматически')
    }

    console.log('Сохранение звонка:', updatedCall)
  }

  const handleCancel = () => {
    if (call) {
      setEditedOutcome(call.outcome)
      setEditedConsent(call.consentSms)
      setEditedNotes(call.agentNotes || '')
      setEditedTags([...call.tags])
    }
    setIsEditing(false)
  }

  // Быстрые действия
  const handleQuickAction = (action: string) => {
    if (!call || !lead) return

    switch (action) {
      case 'send_sms':
        alert('SMS отправлена!')
        break
      case 'schedule_callback':
        const hours = prompt('Через сколько часов запланировать повторный звонок?', '24')
        if (hours) {
          const hoursNum = parseInt(hours)
          if (!isNaN(hoursNum)) {
            alert(`Повторный звонок запланирован через ${hoursNum} часов`)
          }
        }
        break
      case 'create_task':
        mockDataUtils.createTask({
          leadId: lead.id,
          callId: call.id,
          title: 'Задача по результатам звонка',
          reason: 'call_followup',
          priority: 'medium',
          status: 'pending',
          assigneeRole: 'manager',
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        })
        alert('Задача создана!')
        break
      case 'blacklist':
        if (confirm('Добавить лида в черный список?')) {
          mockDataUtils.updateLeadStatus(lead.id, 'blacklisted')
          alert('Лид добавлен в черный список')
        }
        break
    }
  }

  if (!call) {
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
            <h1 className="text-2xl font-bold text-gray-900">Звонок не найден</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p>Звонок с ID {id} не найден</p>
              <Button 
                onClick={() => router.push('/queue')} 
                className="mt-4"
              >
                Вернуться к очереди
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getOutcomeIcon = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'answer_success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'answer_refuse':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'no_answer':
        return <Phone className="h-5 w-5 text-yellow-600" />
      case 'busy':
        return <Phone className="h-5 w-5 text-orange-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
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
              Звонок {lead ? formatPhoneNumber(lead.phone) : 'без номера'}
            </h1>
            <p className="text-gray-600">
              {formatDate(call.startedAt)} • {campaign?.name || 'Неизвестная кампания'}
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
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          )}
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Скачать запись
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Информация о звонке */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                {getOutcomeIcon(call.outcome)}
                <span>Информация о звонке</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Исход звонка</label>
                  {isEditing ? (
                    <Select 
                      value={editedOutcome} 
                      onValueChange={(value: string) => setEditedOutcome(value as CallOutcome)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="answer_success">Успешно</SelectItem>
                        <SelectItem value="answer_refuse">Отказ</SelectItem>
                        <SelectItem value="no_answer">Не ответил</SelectItem>
                        <SelectItem value="busy">Занято</SelectItem>
                        <SelectItem value="voicemail">Автоответчик</SelectItem>
                        <SelectItem value="invalid">Недоступен</SelectItem>
                        <SelectItem value="blacklist">ЧС</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={getStatusColor(call.outcome)}>
                        {getStatusText(call.outcome)}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-gray-600">Длительность</label>
                  <div className="mt-1 font-medium">
                    {call.duration ? formatCallDuration(call.duration) : 'Не завершен'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Начало звонка</label>
                  <div className="mt-1">{formatDate(call.startedAt)}</div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600">Попытка №</label>
                  <div className="mt-1">
                    <Badge variant="outline">{call.attemptNumber}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {isEditing ? (
                    <Checkbox
                      checked={editedConsent}
                      onCheckedChange={(checked) => setEditedConsent(checked as boolean)}
                    />
                  ) : (
                    <Checkbox checked={call.consentSms} disabled />
                  )}
                  <label className="text-sm text-gray-700">
                    Получено согласие на SMS
                  </label>
                </div>
                {call.consentSms && !isEditing && (
                  <div className="text-xs text-green-600">
                    ✓ Согласие получено - SMS может быть отправлена автоматически
                  </div>
                )}
              </div>

              {/* Заметки агента */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Заметки агента
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Дополнительные заметки по звонку..."
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {call.agentNotes || 'Нет заметок'}
                  </div>
                )}
              </div>

              {/* Теги */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Теги</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Добавить тег и нажать Enter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim()
                          if (value && !editedTags.includes(value)) {
                            setEditedTags([...editedTags, value])
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {editedTags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="cursor-pointer"
                          onClick={() => {
                            setEditedTags(editedTags.filter((_, i) => i !== index))
                          }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {call.tags.length > 0 ? (
                      call.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Нет тегов</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Аудиоплеер */}
          {call.audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Volume2 className="h-5 w-5" />
                  <span>Запись звонка</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Демо аудио элемент (в реальном приложении был бы реальный файл) */}
                  <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                  >
                    <source src="/demo-call.mp3" type="audio/mpeg" />
                    Ваш браузер не поддерживает аудио элемент.
                  </audio>

                  {/* Контролы плеера */}
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        {formatCallDuration(Math.floor(currentTime))} / {formatCallDuration(Math.floor(duration))}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Демо сообщение */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="text-sm text-yellow-800">
                      <strong>Демо режим:</strong> В реальном приложении здесь будет аудиоплеер с записью звонка.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Транскрипт */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Транскрипт разговора</CardTitle>
            </CardHeader>
            <CardContent>
              {call.transcript && call.transcript.length > 0 ? (
                <div className="space-y-4">
                  {call.transcript.map((segment, index) => (
                    <div
                      key={index}
                      className="flex space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleSeek(segment.timestamp)}
                    >
                      <div className="flex-shrink-0 text-xs text-gray-500 w-16">
                        {formatCallDuration(segment.timestamp)}
                      </div>
                      <div className="flex-shrink-0 w-16">
                        <Badge 
                          variant={segment.speaker === 'agent' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {segment.speaker === 'agent' ? 'Агент' : 'Клиент'}
                        </Badge>
                      </div>
                      <div className="flex-1 text-sm text-gray-900">
                        {segment.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Транскрипт недоступен</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Автоматическое резюме */}
          {call.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Резюме</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-900">
                    {call.summary}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {call.outcome === 'answer_success' && call.consentSms && (
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction('send_sms')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Отправить SMS
                </Button>
              )}
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('schedule_callback')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Назначить повтор
              </Button>
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('create_task')}
              >
                <User className="h-4 w-4 mr-2" />
                Задача менеджеру
              </Button>
              
              {call.outcome === 'answer_refuse' && (
                <Button 
                  className="w-full justify-start text-red-600 hover:text-red-700" 
                  variant="outline"
                  onClick={() => handleQuickAction('blacklist')}
                >
                  Блэклист
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Информация о лиде */}
          {lead && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Информация о лиде</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                
                <div>
                  <Badge className={getStatusColor(lead.status)}>
                    {getStatusText(lead.status)}
                  </Badge>
                  {lead.segment && (
                    <Badge variant="outline" className="ml-2">
                      {lead.segment}
                    </Badge>
                  )}
                </div>
                
                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    className="w-full"
                  >
                    Открыть карточку лида
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Информация о кампании */}
          {campaign && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Кампания</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">{campaign.name}</div>
                  {campaign.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {campaign.description}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(campaign.state)}>
                    {getStatusText(campaign.state)}
                  </Badge>
                  <Badge variant="outline">
                    Приоритет {campaign.priority}
                  </Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    className="w-full"
                  >
                    Открыть кампанию
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Метаданные */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Метаданные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID звонка:</span>
                <span className="font-mono text-xs">{call.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Начало:</span>
                <span>{formatDate(call.startedAt)}</span>
              </div>
              
              {call.endedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Окончание:</span>
                  <span>{formatDate(call.endedAt)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Попытка:</span>
                <span>{call.attemptNumber}</span>
              </div>
              
              {call.nextAttemptAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Следующая:</span>
                  <span>{formatDate(call.nextAttemptAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function CallDetailPage({ params }: CallDetailPageProps) {
  const { id } = await params
  return <CallDetailPageClient id={id} />
}
