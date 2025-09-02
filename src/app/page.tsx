'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Filter, RefreshCw, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CampaignCard } from '@/components/dashboard/campaign-card'
import { KPISummary } from '@/components/dashboard/kpi-summary'
import { 
  mockCampaigns, 
  mockCampaignMetrics, 
  mockQueueStatus,
  mockDataUtils
} from '@/lib/mock-data'
import { Campaign, CampaignState, QueueStatus } from '@/lib/types'
import { storage } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [queueStatus, setQueueStatus] = useState<QueueStatus>(mockQueueStatus)
  const [filterState, setFilterState] = useState<CampaignState | 'all'>('all')
  const [isLoading, setIsLoading] = useState(false)

  // Проверка прав доступа
  const [canControl, setCanControl] = useState(true)
  
  useEffect(() => {
    const currentRole = storage.get('currentRole', 'admin')
    const hasControlRights = ['admin', 'marketer', 'supervisor'].includes(currentRole)
    setCanControl(hasControlRights)
  }, [])

  // Фильтрация кампаний
  const filteredCampaigns = campaigns.filter(campaign => 
    filterState === 'all' || campaign.state === filterState
  )

  // Обновление данных
  const handleRefresh = async () => {
    setIsLoading(true)
    // Имитация загрузки данных
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Обновляем статус очереди
    setQueueStatus({
      ...queueStatus,
      active: Math.floor(Math.random() * 15) + 5,
      waiting: Math.floor(Math.random() * 200) + 100,
      errors: Math.floor(Math.random() * 5)
    })
    
    setIsLoading(false)
  }

  // Управление кампаниями
  const handleCampaignStart = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            state: 'running' as CampaignState,
            startedAt: new Date(),
            updatedAt: new Date()
          }
        : campaign
    ))
    
    // Обновляем статус очереди
    setQueueStatus(prev => ({
      ...prev,
      active: prev.active + 2,
      waiting: prev.waiting + 10
    }))
  }

  const handleCampaignPause = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            state: 'paused' as CampaignState,
            updatedAt: new Date()
          }
        : campaign
    ))
    
    // Обновляем статус очереди
    setQueueStatus(prev => ({
      ...prev,
      active: Math.max(0, prev.active - 2)
    }))
  }

  const handleCampaignStop = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            state: 'stopped' as CampaignState,
            completedAt: new Date(),
            updatedAt: new Date()
          }
        : campaign
    ))
    
    // Обновляем статус очереди
    setQueueStatus(prev => ({
      ...prev,
      active: Math.max(0, prev.active - 2),
      waiting: Math.max(0, prev.waiting - 10)
    }))
  }

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`)
  }

  const handleCreateCampaign = () => {
    router.push('/campaigns/new')
  }

  const handleExportData = () => {
    // Имитация экспорта данных
    const data = campaigns.map(campaign => ({
      name: campaign.name,
      state: campaign.state,
      totalLeads: campaign.stats.totalLeads,
      processed: campaign.stats.processed,
      successful: campaign.stats.successful,
      refused: campaign.stats.refused
    }))
    
    console.log('Экспорт данных:', data)
    // В реальном приложении здесь был бы вызов функции экспорта
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Центр управления кампаниями
          </h1>
          <p className="text-gray-600">
            Обзор всех кампаний обзвона и ключевых показателей
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
          
          {canControl && (
            <Button onClick={handleCreateCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              Создать кампанию
            </Button>
          )}
        </div>
      </div>

      {/* Статус очереди */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные звонки</p>
                <p className="text-2xl font-bold text-green-600">{queueStatus.active}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В очереди</p>
                <p className="text-2xl font-bold text-blue-600">{queueStatus.waiting}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-blue-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ошибки</p>
                <p className="text-2xl font-bold text-red-600">{queueStatus.errors}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-red-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Обработано сегодня</p>
                <p className="text-2xl font-bold text-gray-900">{queueStatus.totalProcessed}</p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-gray-600 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Summary */}
      <KPISummary />

      {/* Фильтры и управление кампаниями */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Кампании ({filteredCampaigns.length})
          </h2>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterState} onValueChange={(value: string) => setFilterState(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все состояния</SelectItem>
                <SelectItem value="running">Запущенные</SelectItem>
                <SelectItem value="paused">Приостановленные</SelectItem>
                <SelectItem value="stopped">Остановленные</SelectItem>
                <SelectItem value="draft">Черновики</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Список кампаний */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              metrics={mockCampaignMetrics[campaign.id] || {
                totalCalls: 0,
                successfulCalls: 0,
                answerRate: 0,
                successRate: 0,
                smsConsentRate: 0,
                refusalRate: 0,
                averageCallDuration: 0,
                costPerLead: 0,
                registrationRate: 0
              }}
              onStart={handleCampaignStart}
              onPause={handleCampaignPause}
              onStop={handleCampaignStop}
              onClick={handleCampaignClick}
              canControl={canControl}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                Нет кампаний, соответствующих выбранному фильтру
              </p>
              {canControl && (
                <Button onClick={handleCreateCampaign}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать первую кампанию
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
