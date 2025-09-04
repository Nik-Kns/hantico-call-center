'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Filter, 
  RefreshCw,
  BarChart3,
  Monitor,
  Users,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockCampaigns } from '@/lib/mock-data'
import { Campaign, CampaignState } from '@/lib/types'
import { getStatusColor, getStatusText, calculatePercentage } from '@/lib/utils'

interface ObzvonCampaign {
  id: string
  name: string
  agent: string
  database: string
  script: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  totalNumbers: number
  calledNumbers: number
  successfulConnections: number
  smsAgreements: number
  transfers: number
  retries: number
  startTime?: Date
  endTime?: Date
  progress: number
}

const mockObzvonCampaigns: ObzvonCampaign[] = [
  {
    id: 'obz-1',
    name: 'Акция "Новый год 2025"',
    agent: 'Анна (голос 1)',
    database: 'VIP клиенты (1,250 номеров)',
    script: 'Новогодние поздравления + предложение',
    status: 'active',
    totalNumbers: 1250,
    calledNumbers: 847,
    successfulConnections: 623,
    smsAgreements: 445,
    transfers: 89,
    retries: 156,
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 часа назад
    progress: 68
  },
  {
    id: 'obz-2',
    name: 'Реактивация неактивных',
    agent: 'Михаил (голос 2)',
    database: 'Неактивные 90 дней (2,100 номеров)',
    script: 'Возвращение с бонусом',
    status: 'paused',
    totalNumbers: 2100,
    calledNumbers: 456,
    successfulConnections: 298,
    smsAgreements: 156,
    transfers: 34,
    retries: 89,
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 часов назад
    progress: 22
  },
  {
    id: 'obz-3',
    name: 'Холодная база январь',
    agent: 'Елена (голос 3)',
    database: 'Новые лиды (850 номеров)',
    script: 'Знакомство с продуктом',
    status: 'draft',
    totalNumbers: 850,
    calledNumbers: 0,
    successfulConnections: 0,
    smsAgreements: 0,
    transfers: 0,
    retries: 0,
    progress: 0
  }
]

export default function ObzvoniPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<ObzvonCampaign[]>(mockObzvonCampaigns)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Статистика в реальном времени
  const totalActive = campaigns.filter(c => c.status === 'active').length
  const totalCalls = campaigns.reduce((sum, c) => sum + c.calledNumbers, 0)
  const totalSuccess = campaigns.reduce((sum, c) => sum + c.successfulConnections, 0)
  const totalSmsAgreements = campaigns.reduce((sum, c) => sum + c.smsAgreements, 0)

  const handleRefresh = async () => {
    setIsLoading(true)
    // Имитация обновления данных
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleCampaignAction = (campaignId: string, action: 'start' | 'pause' | 'stop') => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        switch (action) {
          case 'start':
            return { ...campaign, status: 'active' as const }
          case 'pause':
            return { ...campaign, status: 'paused' as const }
          case 'stop':
            return { ...campaign, status: 'completed' as const }
          default:
            return campaign
        }
      }
      return campaign
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активна</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Пауза</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Завершена</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Черновик</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => 
    filterStatus === 'all' || campaign.status === filterStatus
  )

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Обзвоны
          </h1>
          <p className="text-gray-600">
            Управление кампаниями автоматических обзвонов
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          
          <Button onClick={() => router.push('/obzvoni/monitor')}>
            <Monitor className="h-4 w-4 mr-2" />
            Мониторинг
          </Button>
          
          <Button onClick={() => router.push('/obzvoni/analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Аналитика
          </Button>
          
          <Button onClick={() => router.push('/obzvoni/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Создать кампанию
          </Button>
        </div>
      </div>

      {/* Статистика в реальном времени */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активные кампании</p>
                <p className="text-2xl font-bold text-gray-900">{totalActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего звонков</p>
                <p className="text-2xl font-bold text-gray-900">{totalCalls.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Успешные соединения</p>
                <p className="text-2xl font-bold text-gray-900">{totalSuccess.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Согласия на SMS</p>
                <p className="text-2xl font-bold text-gray-900">{totalSmsAgreements.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Фильтры:</span>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="paused">На паузе</SelectItem>
            <SelectItem value="completed">Завершённые</SelectItem>
            <SelectItem value="draft">Черновики</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Список кампаний */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Агент: {campaign.agent}</span>
                    <span>•</span>
                    <span>База: {campaign.database}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(campaign.status)}
                  <div className="flex space-x-1">
                    {campaign.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleCampaignAction(campaign.id, 'start')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCampaignAction(campaign.id, 'pause')}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCampaignAction(campaign.id, 'stop')}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {campaign.status === 'paused' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleCampaignAction(campaign.id, 'start')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCampaignAction(campaign.id, 'stop')}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Прогресс */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Прогресс кампании</span>
                    <span>{campaign.progress}%</span>
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                </div>

                {/* Метрики */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Всего номеров</p>
                    <p className="font-semibold">{campaign.totalNumbers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Обзвонено</p>
                    <p className="font-semibold">{campaign.calledNumbers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Дозвоны</p>
                    <p className="font-semibold text-green-600">{campaign.successfulConnections.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">SMS согласия</p>
                    <p className="font-semibold text-blue-600">{campaign.smsAgreements.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Передано</p>
                    <p className="font-semibold text-purple-600">{campaign.transfers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Дожимы</p>
                    <p className="font-semibold text-orange-600">{campaign.retries.toLocaleString()}</p>
                  </div>
                </div>

                {/* Время */}
                {campaign.startTime && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Запущена: {campaign.startTime.toLocaleString('ru-RU')}
                      {campaign.status === 'active' && (
                        <span className="ml-2 text-green-600">• В работе</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                Нет кампаний, соответствующих выбранному фильтру
              </p>
              <Button onClick={() => router.push('/obzvoni/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Создать первую кампанию
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
