'use client'

import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Phone, 
  Users, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  DollarSign,
  Clock
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface KPIMetric {
  id: string
  name: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  target?: number | string
  status?: 'good' | 'warning' | 'critical'
  icon?: React.ComponentType<{ className?: string }>
}

interface KPISummaryProps {
  className?: string
}

const defaultMetrics: KPIMetric[] = [
  {
    id: 'total_calls',
    name: 'Всего звонков',
    value: 245,
    unit: '',
    trend: 'up',
    trendValue: '+12%',
    target: 300,
    status: 'warning',
    icon: Phone
  },
  {
    id: 'answer_rate',
    name: 'Дозвоны',
    value: 68.5,
    unit: '%',
    trend: 'down',
    trendValue: '-3.2%',
    target: 75,
    status: 'warning',
    icon: CheckCircle
  },
  {
    id: 'success_rate',
    name: 'Успешные',
    value: 22.4,
    unit: '%',
    trend: 'up',
    trendValue: '+1.8%',
    target: 25,
    status: 'good',
    icon: Users
  },
  {
    id: 'refusal_rate',
    name: 'Отказы',
    value: 28.1,
    unit: '%',
    trend: 'up',
    trendValue: '+5.3%',
    target: 20,
    status: 'critical',
    icon: XCircle
  },
  {
    id: 'sms_consent_rate',
    name: 'SMS согласия',
    value: 64.2,
    unit: '%',
    trend: 'stable',
    trendValue: '0%',
    target: 70,
    status: 'warning',
    icon: MessageSquare
  },
  {
    id: 'avg_call_duration',
    name: 'Средняя длительность',
    value: '4:32',
    unit: '',
    trend: 'down',
    trendValue: '-0:15',
    target: '5:00',
    status: 'good',
    icon: Clock
  },
  {
    id: 'cost_per_lead',
    name: 'Стоимость лида',
    value: 89.50,
    unit: '₽',
    trend: 'up',
    trendValue: '+12₽',
    target: 75,
    status: 'warning',
    icon: DollarSign
  },
  {
    id: 'registration_rate',
    name: 'Регистрации',
    value: 45.8,
    unit: '%',
    trend: 'up',
    trendValue: '+7.2%',
    target: 50,
    status: 'good',
    icon: CheckCircle
  }
]

export function KPISummary({ className }: KPISummaryProps) {
  const getStatusColor = (status: KPIMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend: KPIMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />
      case 'down':
        return <TrendingDown className="h-4 w-4" />
      case 'stable':
        return <Minus className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTrendColor = (trend: KPIMetric['trend'], status: KPIMetric['status']) => {
    if (trend === 'stable') return 'text-gray-500'
    
    // Для отрицательных метрик (отказы) тренд инвертируется
    const isNegativeMetric = status === 'critical'
    
    if (trend === 'up') {
      return isNegativeMetric ? 'text-red-500' : 'text-green-500'
    }
    
    if (trend === 'down') {
      return isNegativeMetric ? 'text-green-500' : 'text-red-500'
    }
    
    return 'text-gray-500'
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Ключевые показатели
        </h2>
        <p className="text-sm text-gray-600">
          Общая статистика по всем активным кампаниям за сегодня
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {defaultMetrics.map((metric) => {
          const Icon = metric.icon
          
          return (
            <Card key={metric.id} className={cn('border-l-4', getStatusColor(metric.status))}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {Icon && <Icon className="h-4 w-4 text-gray-500" />}
                    <span className="text-sm font-medium text-gray-700">
                      {metric.name}
                    </span>
                  </div>
                  
                  {metric.trend && (
                    <div className={cn(
                      'flex items-center space-x-1 text-xs',
                      getTrendColor(metric.trend, metric.status)
                    )}>
                      {getTrendIcon(metric.trend)}
                      <span>{metric.trendValue}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value}{metric.unit}
                  </div>
                  
                  {metric.target && (
                    <div className="text-xs text-gray-500">
                      Цель: {metric.target}{metric.unit}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Сводка по статусам */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Статус показателей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-green-100 text-green-800">
              Хорошо: {defaultMetrics.filter(m => m.status === 'good').length}
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              Внимание: {defaultMetrics.filter(m => m.status === 'warning').length}
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              Критично: {defaultMetrics.filter(m => m.status === 'critical').length}
            </Badge>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <p>
              📈 <strong>Рекомендации:</strong> Обратите внимание на высокий процент отказов. 
              Рассмотрите возможность корректировки скриптов или времени звонков.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
