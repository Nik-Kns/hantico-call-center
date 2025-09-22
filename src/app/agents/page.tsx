'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus,
  Archive,
  Play,
  Users,
  Search,
  Filter,
  Copy,
  Building2,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Phone,
  FileText,
  Volume2,
  Lock,
  XCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { mockAgents, mockVoices } from '@/lib/mock-data'
import { Agent, UserRole } from '@/lib/types'
import { storage } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Мок данных кампаний для агентов
const mockCampaigns = [
  { id: 'cmp-1', name: 'Новогодняя акция 2025', status: 'active' },
  { id: 'cmp-2', name: 'Привлечение новых клиентов', status: 'active' },
  { id: 'cmp-3', name: 'Реактивация базы', status: 'paused' },
  { id: 'cmp-4', name: 'Опрос удовлетворенности', status: 'completed' },
]

interface AgentWithCampaigns extends Agent {
  campaignsCount?: number
  campaignsDetails?: Array<{ id: string; name: string; status: string }>
}

export default function AgentsPage() {
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<UserRole>('admin')
  const [agents] = useState<AgentWithCampaigns[]>(mockAgents.map(agent => ({
    ...agent,
    // Добавляем случайное количество кампаний для каждого агента
    campaignsCount: Math.floor(Math.random() * 5),
    campaignsDetails: mockCampaigns.slice(0, Math.floor(Math.random() * 4))
  })))
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterBaseType, setFilterBaseType] = useState<string>('all')
  const [selectedAgentCampaigns, setSelectedAgentCampaigns] = useState<any>(null)
  const [showCampaignsDialog, setShowCampaignsDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{show: boolean, agent: any, action?: 'delete' | 'archive'}>({
    show: false,
    agent: null,
    action: 'delete'
  })

  // Загрузка текущей роли при монтировании
  useEffect(() => {
    const savedRole = storage.get<UserRole>('currentRole', 'admin')
    setCurrentRole(savedRole)
    
    // Подписка на изменения роли
    const interval = setInterval(() => {
      const newRole = storage.get<UserRole>('currentRole', 'admin')
      if (newRole !== currentRole) {
        setCurrentRole(newRole)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [currentRole])

  // Фильтрация агентов
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || agent.status === filterStatus
    const matchesRole = filterRole === 'all' || agent.role === filterRole
    const matchesBaseType = filterBaseType === 'all' || agent.baseType === filterBaseType
    
    return matchesSearch && matchesStatus && matchesRole && matchesBaseType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активен</Badge>
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Черновик</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Архив</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const handleShowCampaigns = (agent: any) => {
    setSelectedAgentCampaigns(agent)
    setShowCampaignsDialog(true)
  }

  const handleCopyAgent = (agent: any) => {
    // Логика копирования агента
    console.log('Копирование агента:', agent.name)
    // Можно добавить тост уведомление
  }

  const handleArchiveAgent = (agent: any) => {
    // Проверка роли
    if (currentRole === 'marketer') {
      setDeleteDialog({ 
        show: true, 
        agent,
        action: 'archive'
      })
      return
    }
    
    // Проверяем, есть ли активные кампании
    const activeCampaigns = agent.campaignsDetails?.filter((c: any) => c.status === 'active')
    if (activeCampaigns && activeCampaigns.length > 0) {
      setDeleteDialog({ 
        show: true, 
        agent,
        action: 'archive'
      })
    } else {
      console.log(agent.status === 'archived' ? 'Активировать' : 'Архивировать', agent.name)
    }
  }

  const handleDeleteAgent = (agent: any) => {
    // Проверка роли
    if (currentRole === 'marketer') {
      setDeleteDialog({ 
        show: true, 
        agent,
        action: 'delete'
      })
      return
    }
    
    // Проверяем, есть ли активные кампании
    const activeCampaigns = agent.campaignsDetails?.filter((c: any) => c.status === 'active')
    if (activeCampaigns && activeCampaigns.length > 0) {
      setDeleteDialog({ 
        show: true, 
        agent,
        action: 'delete'
      })
    } else {
      if (confirm(`Удалить агента "${agent.name}"?`)) {
        console.log('Удаление агента:', agent.name)
      }
    }
  }

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      'registration_agent': 'Регистрация',
      'reactivation_agent': 'Реактивация',
      'cold_calling_agent': 'Холодные звонки',
      'support_agent': 'Поддержка',
      'sales_agent': 'Продажи'
    }
    return roleMap[role] || role
  }

  const getBaseTypeBadge = (baseType: string) => {
    switch (baseType) {
      case 'registration':
        return <Badge className="bg-blue-100 text-blue-800">Регистрация</Badge>
      case 'no_answer':
        return <Badge className="bg-yellow-100 text-yellow-800">Недозвон</Badge>
      case 'refusals':
        return <Badge className="bg-red-100 text-red-800">Отказники</Badge>
      case 'reactivation':
        return <Badge className="bg-purple-100 text-purple-800">Отклики/реактивация</Badge>
      default:
        return <Badge>{baseType}</Badge>
    }
  }

  const getVoiceName = (voiceId: string) => {
    const voice = mockVoices.find(v => v.id === voiceId)
    return voice?.name || 'Неизвестно'
  }

  const handleCreateAgent = () => {
    router.push('/agents/new')
  }

  const handleEditAgent = (agentId: string) => {
    router.push(`/agents/${agentId}/edit`)
  }

  const handleTestAgent = (agentId: string) => {
    router.push(`/agents/${agentId}/test`)
  }

  const handleViewAgent = (agentId: string) => {
    router.push(`/agents/${agentId}`)
  }

  const handleEditPrompts = (agentId: string) => {
    router.push(`/agents/${agentId}/prompts`)
  }

  const handleABTests = (agentId: string) => {
    router.push(`/agents/${agentId}/ab-tests`)
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Агенты</h1>
          <p className="text-gray-600">
            Управление AI-агентами для автоматических обзвонов
          </p>
        </div>
        
        <Button onClick={handleCreateAgent}>
          <Plus className="h-4 w-4 mr-2" />
          Создать агента
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего</p>
                <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активные</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Черновики</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Archive className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Архив</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.status === 'archived').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры в линию */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {/* Поиск по названию */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            {/* Роль агента */}
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Роль агента" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="registration_agent">Регистрация</SelectItem>
                <SelectItem value="reactivation_agent">Реактивация</SelectItem>
                <SelectItem value="cold_calling_agent">Холодные звонки</SelectItem>
                <SelectItem value="support_agent">Поддержка</SelectItem>
                <SelectItem value="sales_agent">Продажи</SelectItem>
              </SelectContent>
            </Select>

            {/* Статус */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="inactive">Черновики</SelectItem>
                <SelectItem value="archived">Архив</SelectItem>
              </SelectContent>
            </Select>

            {/* Кнопка сброса */}
            {(searchQuery || filterRole !== 'all' || filterStatus !== 'all') && (
              <Button 
                variant="ghost"
                size="sm" 
                onClick={() => {
                  setSearchQuery('')
                  setFilterStatus('all')
                  setFilterRole('all')
                  setFilterBaseType('all')
                }}
                className="h-9"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Список агентов */}
      <Card>
        <CardHeader>
          <CardTitle>Агенты ({filteredAgents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Подзаголовок
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Где используется
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Быстрые действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAgents.map((agent: any) => (
                  <tr 
                    key={agent.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewAgent(agent.id)}
                  >
                    {/* Название */}
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="text-sm font-medium text-gray-900">
                        {agent.name}
                      </div>
                    </td>
                    
                    {/* Подзаголовок (роль) */}
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="text-sm text-gray-600">
                        {getRoleName(agent.role)}
                      </div>
                    </td>
                    
                    {/* Описание (короткое) */}
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {agent.description}
                      </div>
                    </td>
                    
                    {/* Где используется (ID компаний) */}
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {agent.campaignsDetails && agent.campaignsDetails.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {agent.campaignsDetails.slice(0, 3).map((campaign: any) => (
                            <Badge 
                              key={campaign.id} 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-gray-50"
                              onClick={() => router.push(`/companies/${campaign.id}`)}
                            >
                              {campaign.id}
                            </Badge>
                          ))}
                          {agent.campaignsDetails.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-blue-50"
                              onClick={() => handleShowCampaigns(agent)}
                            >
                              +{agent.campaignsDetails.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    
                    {/* Статус */}
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {getStatusBadge(agent.status)}
                    </td>
                    
                    {/* Быстрые действия */}
                    <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center space-x-1">
                        {/* Протестировать - с подменю */}
                        <div className="relative group">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Протестировать"
                            className="hover:bg-blue-50"
                          >
                            <Phone className="h-4 w-4 text-blue-600" />
                          </Button>
                          <div className="absolute top-8 left-0 hidden group-hover:block z-10">
                            <div className="bg-white border rounded-lg shadow-lg p-1 min-w-[160px]">
                              <button
                                onClick={() => handleTestAgent(agent.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center space-x-2"
                              >
                                <Volume2 className="h-4 w-4" />
                                <span>Прослушать голос</span>
                              </button>
                              <button
                                onClick={() => handleTestAgent(agent.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center space-x-2"
                              >
                                <Phone className="h-4 w-4" />
                                <span>Звонок в браузер</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Скопировать */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyAgent(agent)}
                          title="Скопировать"
                          className="hover:bg-green-50"
                        >
                          <Copy className="h-4 w-4 text-green-600" />
                        </Button>
                        
                        {/* Удалить */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAgent(agent)}
                          title="Удалить"
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery || filterStatus !== 'all' || filterRole !== 'all' 
                  ? 'Агенты не найдены по заданным фильтрам'
                  : 'Пока нет созданных агентов'
                }
              </p>
              {(!searchQuery && filterStatus === 'all' && filterRole === 'all') && (
                <Button className="mt-4" onClick={handleCreateAgent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать первого агента
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог удаления с проверкой привязок и роли */}
      <Dialog open={deleteDialog.show} onOpenChange={(open) => setDeleteDialog({ show: open, agent: null, action: 'delete' })}>
        <DialogContent className="max-w-md">
          {currentRole === 'marketer' ? (
            /* Для маркетолога - показываем ограничение роли */
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-red-500" />
                  <span>Действие недоступно</span>
                </DialogTitle>
                <DialogDescription>
                  Ваша роль не позволяет {deleteDialog.action === 'delete' ? 'удалять' : 'архивировать'} агентов
                </DialogDescription>
              </DialogHeader>
              
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm">
                  <div className="space-y-2">
                    <p className="font-medium text-red-800">
                      Роль «Маркетолог» имеет ограниченные права:
                    </p>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      <li>Запуск и управление кампаниями</li>
                      <li>Просмотр агентов и их настроек</li>
                      <li className="font-medium">Создание/редактирование/удаление агентов недоступно</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
              
              {deleteDialog.agent?.campaignsDetails && deleteDialog.agent.campaignsDetails.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-600 font-medium">
                    Агент используется в кампаниях:
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {deleteDialog.agent.campaignsDetails.map((campaign: any) => (
                      <div 
                        key={campaign.id}
                        className="flex items-center justify-between p-2 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">{campaign.name}</p>
                            <p className="text-xs text-gray-500">ID: {campaign.id}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          campaign.status === 'active' ? 'text-green-700 border-green-300' :
                          campaign.status === 'paused' ? 'text-yellow-700 border-yellow-300' :
                          'text-gray-700 border-gray-300'
                        }>
                          {campaign.status === 'active' ? 'Активна' :
                           campaign.status === 'paused' ? 'На паузе' : 'Завершена'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialog({ show: false, agent: null, action: 'delete' })}
                >
                  Закрыть
                </Button>
              </DialogFooter>
            </>
          ) : (
            /* Для других ролей - показываем привязки к кампаниям */
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Невозможно {deleteDialog.action === 'delete' ? 'удалить' : 'архивировать'} агента</span>
                </DialogTitle>
                <DialogDescription>
                  Агент &ldquo;{deleteDialog.agent?.name}&rdquo; используется в активных кампаниях
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-600">
                  Для {deleteDialog.action === 'delete' ? 'удаления' : 'архивирования'} агента необходимо сначала отвязать его от следующих активных кампаний:
                </p>
                
                {deleteDialog.agent?.campaignsDetails?.filter((c: any) => c.status === 'active').map((campaign: any) => (
                  <div 
                    key={campaign.id}
                    className="flex items-center justify-between p-2 border rounded-lg bg-yellow-50 border-yellow-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <p className="text-xs text-gray-500">ID: {campaign.id}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Активна</Badge>
                  </div>
                ))}
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialog({ show: false, agent: null, action: 'delete' })}
                >
                  Понятно
                </Button>
                <Button
                  onClick={() => {
                    handleShowCampaigns(deleteDialog.agent)
                    setDeleteDialog({ show: false, agent: null, action: 'delete' })
                  }}
                >
                  Посмотреть кампании
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог со списком кампаний */}
      <Dialog open={showCampaignsDialog} onOpenChange={setShowCampaignsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Кампании с агентом &ldquo;{selectedAgentCampaigns?.name}&rdquo;</DialogTitle>
            <DialogDescription>
              Список кампаний, в которых используется данный агент
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedAgentCampaigns?.campaigns?.map((campaign: any) => (
              <div 
                key={campaign.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/companies/${campaign.id}`)}
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{campaign.name}</p>
                    <p className="text-xs text-gray-500">ID: {campaign.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {campaign.status === 'active' && (
                    <Badge className="bg-green-100 text-green-800">Активна</Badge>
                  )}
                  {campaign.status === 'paused' && (
                    <Badge className="bg-yellow-100 text-yellow-800">На паузе</Badge>
                  )}
                  {campaign.status === 'completed' && (
                    <Badge className="bg-gray-100 text-gray-800">Завершена</Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
            
            {(!selectedAgentCampaigns?.campaigns || selectedAgentCampaigns.campaigns.length === 0) && (
              <p className="text-center text-gray-500 py-4">
                Агент пока не используется в кампаниях
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
