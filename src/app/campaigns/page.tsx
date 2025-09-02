'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Square, 
  Edit, 
  Trash2, 
  Copy,
  Eye
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
import { mockCampaigns, mockCampaignMetrics } from '@/lib/mock-data'
import { Campaign, CampaignState } from '@/lib/types'
import { getStatusColor, getStatusText, formatDate, calculatePercentage } from '@/lib/utils'

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignState | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Фильтрация кампаний
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.state === statusFilter
    const matchesCategory = categoryFilter === 'all' || campaign.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Действия с кампаниями
  const handleCampaignAction = (campaignId: string, action: string) => {
    switch (action) {
      case 'start':
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId 
            ? { ...c, state: 'running' as CampaignState, startedAt: new Date() }
            : c
        ))
        break
      case 'pause':
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId 
            ? { ...c, state: 'paused' as CampaignState }
            : c
        ))
        break
      case 'stop':
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId 
            ? { ...c, state: 'stopped' as CampaignState, completedAt: new Date() }
            : c
        ))
        break
      case 'edit':
        router.push(`/campaigns/${campaignId}/edit`)
        break
      case 'view':
        router.push(`/campaigns/${campaignId}`)
        break
      case 'duplicate':
        const original = campaigns.find(c => c.id === campaignId)
        if (original) {
          const duplicate: Campaign = {
            ...original,
            id: `campaign-${Date.now()}`,
            name: `${original.name} (копия)`,
            state: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            startedAt: undefined,
            completedAt: undefined,
            stats: {
              totalLeads: 0,
              processed: 0,
              successful: 0,
              refused: 0,
              pending: 0
            }
          }
          setCampaigns(prev => [...prev, duplicate])
        }
        break
      case 'delete':
        if (confirm('Вы уверены, что хотите удалить эту кампанию?')) {
          setCampaigns(prev => prev.filter(c => c.id !== campaignId))
        }
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Кампании</h1>
          <p className="text-gray-600">
            Управление кампаниями обзвона и их настройками
          </p>
        </div>
        
        <Button onClick={() => router.push('/campaigns/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Создать кампанию
        </Button>
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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Состояние" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все состояния</SelectItem>
                  <SelectItem value="running">Запущенные</SelectItem>
                  <SelectItem value="paused">Приостановленные</SelectItem>
                  <SelectItem value="stopped">Остановленные</SelectItem>
                  <SelectItem value="draft">Черновики</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="acquisition">Привлечение</SelectItem>
                  <SelectItem value="retention">Удержание</SelectItem>
                  <SelectItem value="reactivation">Реактивация</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список кампаний */}
      <div className="space-y-4">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => {
            const metrics = mockCampaignMetrics[campaign.id]
            const successRate = calculatePercentage(campaign.stats.successful, campaign.stats.processed)
            const processingRate = calculatePercentage(campaign.stats.processed, campaign.stats.totalLeads)
            
            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {campaign.name}
                        </h3>
                        <Badge className={getStatusColor(campaign.state)}>
                          {getStatusText(campaign.state)}
                        </Badge>
                        <Badge variant="outline">
                          {campaign.category === 'acquisition' ? 'Привлечение' : 
                           campaign.category === 'retention' ? 'Удержание' : 'Реактивация'}
                        </Badge>
                      </div>
                      
                      {campaign.description && (
                        <p className="text-gray-600 mb-3">{campaign.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Всего лидов:</span>
                          <span className="font-medium ml-1">{campaign.stats.totalLeads}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Обработано:</span>
                          <span className="font-medium ml-1">
                            {campaign.stats.processed} ({processingRate}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Успешно:</span>
                          <span className="font-medium ml-1 text-green-600">
                            {campaign.stats.successful} ({successRate}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">В очереди:</span>
                          <span className="font-medium ml-1">{campaign.stats.pending}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        <div>Создана: {formatDate(campaign.createdAt)}</div>
                        {campaign.startedAt && (
                          <div>Запущена: {formatDate(campaign.startedAt)}</div>
                        )}
                      </div>
                    </div>

                    {/* Прогресс бар */}
                    <div className="w-32 ml-6">
                      <div className="text-xs text-gray-500 mb-1">
                        Прогресс: {processingRate}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(processingRate, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Быстрые действия */}
                      {campaign.state === 'draft' || campaign.state === 'stopped' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCampaignAction(campaign.id, 'start')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                      
                      {campaign.state === 'running' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCampaignAction(campaign.id, 'pause')}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : null}
                      
                      {campaign.state === 'paused' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCampaignAction(campaign.id, 'start')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                      
                      {(campaign.state === 'running' || campaign.state === 'paused') ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCampaignAction(campaign.id, 'stop')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : null}

                      {/* Меню действий */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleCampaignAction(campaign.id, 'view')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Просмотр
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCampaignAction(campaign.id, 'edit')}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCampaignAction(campaign.id, 'duplicate')}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Дублировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleCampaignAction(campaign.id, 'delete')}
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
            )
          })
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
                    ? 'Нет кампаний, соответствующих выбранным фильтрам'
                    : 'Пока нет созданных кампаний'
                  }
                </p>
                <Button onClick={() => router.push('/campaigns/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать первую кампанию
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Статистика */}
      {filteredCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Сводка по кампаниям</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Всего кампаний:</span>
                <div className="font-medium text-lg">{filteredCampaigns.length}</div>
              </div>
              <div>
                <span className="text-gray-500">Запущенных:</span>
                <div className="font-medium text-lg text-green-600">
                  {filteredCampaigns.filter(c => c.state === 'running').length}
                </div>
              </div>
              <div>
                <span className="text-gray-500">На паузе:</span>
                <div className="font-medium text-lg text-yellow-600">
                  {filteredCampaigns.filter(c => c.state === 'paused').length}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Остановленных:</span>
                <div className="font-medium text-lg text-red-600">
                  {filteredCampaigns.filter(c => c.state === 'stopped').length}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Черновиков:</span>
                <div className="font-medium text-lg text-gray-600">
                  {filteredCampaigns.filter(c => c.state === 'draft').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
