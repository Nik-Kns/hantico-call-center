'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus,
  Edit,
  Archive,
  Play,
  Pause,
  Volume2,
  Users,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Copy
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { mockAgents, mockVoices } from '@/lib/mock-data'
import { Agent } from '@/lib/types'

export default function AgentsPage() {
  const router = useRouter()
  const [agents] = useState<Agent[]>(mockAgents)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterBaseType, setFilterBaseType] = useState<string>('all')

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
        return <Badge className="bg-yellow-100 text-yellow-800">Неактивен</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Архив</Badge>
      default:
        return <Badge>Неизвестно</Badge>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего агентов</p>
                <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-6 w-6 text-blue-600" />
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Volume2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Голосов</p>
                <p className="text-2xl font-bold text-gray-900">{mockVoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">В кампаниях</p>
                <p className="text-2xl font-bold text-gray-900">
                  {agents.filter(a => a.campaigns.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Фильтры и поиск:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию или описанию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                  <SelectItem value="archived">Архивированные</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="registration_agent">Регистрация</SelectItem>
                  <SelectItem value="reactivation_agent">Реактивация</SelectItem>
                  <SelectItem value="cold_calling_agent">Холодные звонки</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBaseType} onValueChange={setFilterBaseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Тип базы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="registration">Регистрация</SelectItem>
                  <SelectItem value="no_answer">Недозвон</SelectItem>
                  <SelectItem value="refusals">Отказники</SelectItem>
                  <SelectItem value="reactivation">Отклики/реактивация</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('')
                  setFilterStatus('all')
                  setFilterRole('all')
                  setFilterBaseType('all')
                }}
              >
                Сбросить
              </Button>
            </div>
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
                    Агент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Голос
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип базы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Кампании
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {agent.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          v{agent.version} • {agent.prompts.length} промтов
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Volume2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {getVoiceName(agent.voiceId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline">
                        {getRoleName(agent.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getBaseTypeBadge(agent.baseType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {agent.campaigns.length > 0 ? (
                          <span>{agent.campaigns.length} кампаний</span>
                        ) : (
                          <span className="text-gray-400">Не назначен</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(agent.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAgent(agent.id)}
                          title="Просмотр"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPrompts(agent.id)}
                          title="Промты"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleABTests(agent.id)}
                          title="A/B тесты"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestAgent(agent.id)}
                          title="Тестирование"
                        >
                          <Play className="h-4 w-4" />
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
    </div>
  )
}
