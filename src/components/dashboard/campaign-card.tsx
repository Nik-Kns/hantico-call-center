'use client'

import React from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Users,
  Phone,
  CheckCircle,
  XCircle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Campaign, CampaignMetrics } from '@/lib/types'
import { getStatusColor, getStatusText, calculatePercentage } from '@/lib/utils'

interface CampaignCardProps {
  campaign: Campaign
  metrics: CampaignMetrics
  onStart?: (campaignId: string) => void
  onPause?: (campaignId: string) => void
  onStop?: (campaignId: string) => void
  canControl?: boolean
}

export function CampaignCard({
  campaign,
  metrics,
  onStart,
  onPause,
  onStop,
  canControl = true
}: CampaignCardProps) {
  const successRate = calculatePercentage(campaign.stats.successful, campaign.stats.processed)
  const refusalRate = calculatePercentage(campaign.stats.refused, campaign.stats.processed)
  const processingRate = calculatePercentage(campaign.stats.processed, campaign.stats.totalLeads)
  
  // Определение алертов
  const alerts = []
  if (successRate < 20 && campaign.stats.processed > 10) {
    alerts.push('Низкая конверсия')
  }
  if (refusalRate > 40 && campaign.stats.processed > 10) {
    alerts.push('Высокий % отказов')
  }
  if (campaign.state === 'running' && campaign.stats.pending === 0) {
    alerts.push('Нет лидов в очереди')
  }

  const handleAction = (action: 'start' | 'pause' | 'stop', e: React.MouseEvent) => {
    e.stopPropagation()
    
    switch (action) {
      case 'start':
        onStart?.(campaign.id)
        break
      case 'pause':
        onPause?.(campaign.id)
        break
      case 'stop':
        onStop?.(campaign.id)
        break
    }
  }

  return (
    <Card 
      className="hover:shadow-lg transition-shadow"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{campaign.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(campaign.state)}>
                {getStatusText(campaign.state)}
              </Badge>
              <Badge variant="outline">{campaign.category}</Badge>
            </div>
          </div>
          
          {/* Контролы */}
          {canControl && (
            <div className="flex space-x-1">
              {campaign.state === 'draft' || campaign.state === 'stopped' ? (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-green-600 hover:text-green-700"
                  onClick={(e) => handleAction('start', e)}
                  title="Запустить"
                >
                  <Play className="h-4 w-4" />
                </Button>
              ) : null}
              
              {campaign.state === 'running' ? (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-yellow-600 hover:text-yellow-700"
                  onClick={(e) => handleAction('pause', e)}
                  title="Пауза"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              ) : null}
              
              {campaign.state === 'paused' ? (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-green-600 hover:text-green-700"
                  onClick={(e) => handleAction('start', e)}
                  title="Возобновить"
                >
                  <Play className="h-4 w-4" />
                </Button>
              ) : null}
              
              {(campaign.state === 'running' || campaign.state === 'paused') ? (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                  onClick={(e) => handleAction('stop', e)}
                  title="Остановить"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          )}
        </div>

        {/* Алерты */}
        {alerts.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {alerts.map((alert, index) => (
              <Badge 
                key={index} 
                variant="destructive" 
                className="text-xs flex items-center"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {alert}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Основные метрики */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                Всего лидов
              </div>
              <span className="font-medium">{campaign.stats.totalLeads}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-1" />
                Обработано
              </div>
              <span className="font-medium">
                {campaign.stats.processed} ({processingRate}%)
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                Успешно
              </div>
              <span className="font-medium text-green-600">
                {campaign.stats.successful} ({successRate}%)
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <XCircle className="h-4 w-4 mr-1 text-red-500" />
                Отказы
              </div>
              <span className="font-medium text-red-600">
                {campaign.stats.refused} ({refusalRate}%)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Дозвоны</span>
              <span className="font-medium">{metrics.answerRate.toFixed(1)}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SMS согласия</span>
              <span className="font-medium">{metrics.smsConsentRate.toFixed(1)}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Регистрации</span>
              <div className="flex items-center">
                <span className="font-medium">{metrics.registrationRate.toFixed(1)}%</span>
                {metrics.registrationRate > 50 ? (
                  <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 ml-1 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">В очереди</span>
              <span className="font-medium">{campaign.stats.pending}</span>
            </div>
          </div>
        </div>

        {/* Прогресс бар */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Прогресс кампании</span>
            <span>{processingRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(processingRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="pt-2 border-t text-xs text-gray-500 space-y-1">
          <div>Приоритет: {campaign.priority}/10</div>
          <div>Параллельность: {campaign.concurrency} звонков</div>
          {campaign.startedAt && (
            <div>Запущена: {new Date(campaign.startedAt).toLocaleString('ru-RU')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
