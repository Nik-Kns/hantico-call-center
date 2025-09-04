'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Plus,
  Play,
  Pause,
  Square,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  GitBranch
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockAgents, mockABTests, mockAgentVersions } from '@/lib/mock-data'
import { ABTest } from '@/lib/types'

export default function AgentABTestsPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  
  const agent = mockAgents.find(a => a.id === agentId)
  const abTests = mockABTests.filter(t => t.agentId === agentId)
  const versions = mockAgentVersions.filter(v => v.agentId === agentId)
  
  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Агент не найден</p>
        <Button className="mt-4" onClick={() => router.back()}>
          Назад к списку агентов
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800">Активен</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Завершён</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Пауза</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Черновик</Badge>
      default:
        return <Badge>Неизвестно</Badge>
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'conversion_rate':
        return <Target className="h-4 w-4" />
      case 'success_rate':
        return <CheckCircle className="h-4 w-4" />
      case 'avg_call_duration':
        return <Clock className="h-4 w-4" />
      case 'sms_consent_rate':
        return <Users className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const getMetricName = (metric: string) => {
    const names: Record<string, string> = {
      'conversion_rate': 'Конверсия',
      'success_rate': 'Успешность',
      'avg_call_duration': 'Длительность звонка',
      'sms_consent_rate': 'Согласие на SMS'
    }
    return names[metric] || metric
  }

  const handleCreateABTest = () => {
    router.push(`/agents/${agentId}/ab-tests/new`)
  }

  const handleViewABTest = (testId: string) => {
    router.push(`/agents/${agentId}/ab-tests/${testId}`)
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              A/B тестирование
            </h1>
            <p className="text-gray-600">
              {agent.name} • Оптимизация агента
            </p>
          </div>
        </div>
        
        <Button onClick={handleCreateABTest}>
          <Plus className="h-4 w-4 mr-2" />
          Создать A/B тест
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GitBranch className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего тестов</p>
                <p className="text-2xl font-bold text-gray-900">{abTests.length}</p>
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
                  {abTests.filter(t => t.status === 'running').length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Завершённые</p>
                <p className="text-2xl font-bold text-gray-900">
                  {abTests.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Версий</p>
                <p className="text-2xl font-bold text-gray-900">{versions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Список A/B тестов */}
      <div className="space-y-6">
        {abTests.length > 0 ? (
          abTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(test.status)}
                    <Button size="sm" variant="outline" onClick={() => handleViewABTest(test.id)}>
                      Подробнее
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="variants">Варианты</TabsTrigger>
                    <TabsTrigger value="results">Результаты</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          {getMetricIcon(test.settings.primaryMetric)}
                          <span className="text-sm font-medium">Основная метрика</span>
                        </div>
                        <p className="text-lg font-bold">
                          {getMetricName(test.settings.primaryMetric)}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Длительность</span>
                        </div>
                        <p className="text-lg font-bold">{test.settings.duration} дней</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm font-medium">Звонков</span>
                        </div>
                        <p className="text-lg font-bold">{test.metrics.totalCalls.toLocaleString()}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="variants" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {test.variants.map((variant) => {
                        const metrics = test.metrics.variantMetrics[variant.id]
                        const significance = test.metrics.statisticalSignificance[variant.id]
                        
                        return (
                          <Card key={variant.id} className={`${variant.isControl ? 'ring-2 ring-blue-200' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">{variant.name}</h4>
                                <div className="flex items-center space-x-2">
                                  {variant.isControl && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                      Контроль
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {variant.trafficAllocation}%
                                  </Badge>
                                </div>
                              </div>
                              
                              {metrics && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Звонков:</span>
                                    <span className="font-medium">{metrics.calls}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Конверсия:</span>
                                    <span className="font-medium">{metrics.conversionRate}%</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>SMS согласие:</span>
                                    <span className="font-medium">{metrics.smsConsentRate}%</span>
                                  </div>
                                  
                                  {significance && (
                                    <div className={`p-2 rounded text-xs ${
                                      significance.isSignificant 
                                        ? 'bg-green-50 text-green-800' 
                                        : 'bg-gray-50 text-gray-600'
                                    }`}>
                                      {significance.isSignificant ? (
                                        <div className="flex items-center space-x-1">
                                          <CheckCircle className="h-3 w-3" />
                                          <span>Статистически значим</span>
                                          <span className="font-medium">
                                            {significance.uplift > 0 ? '+' : ''}{significance.uplift}%
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center space-x-1">
                                          <AlertTriangle className="h-3 w-3" />
                                          <span>Недостаточно данных</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="results" className="space-y-4">
                    {test.metrics.winner ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium text-green-900">Найден победитель!</h4>
                        </div>
                        <p className="text-sm text-green-800">
                          Вариант {test.variants.find(v => v.id === test.metrics.winner)?.name} 
                          показал лучшие результаты с улучшением на{' '}
                          <span className="font-medium">
                            {test.metrics.statisticalSignificance[test.metrics.winner]?.uplift}%
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-5 w-5 text-yellow-600" />
                          <h4 className="font-medium text-yellow-900">Тест продолжается</h4>
                        </div>
                        <p className="text-sm text-yellow-800">
                          Необходимо больше данных для определения статистически значимого результата
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Прогресс теста</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Размер выборки</span>
                                <span>{test.metrics.totalCalls} / {test.settings.minSampleSize}</span>
                              </div>
                              <Progress 
                                value={Math.min(100, (test.metrics.totalCalls / test.settings.minSampleSize) * 100)} 
                                className="h-2"
                              />
                            </div>
                            
                            {test.startedAt && (
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Время выполнения</span>
                                  <span>
                                    {Math.ceil((Date.now() - test.startedAt.getTime()) / (1000 * 60 * 60 * 24))} / {test.settings.duration} дней
                                  </span>
                                </div>
                                <Progress 
                                  value={Math.min(100, ((Date.now() - test.startedAt.getTime()) / (1000 * 60 * 60 * 24 * test.settings.duration)) * 100)} 
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Настройки теста</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Уровень доверия:</span>
                              <span>{test.settings.confidenceLevel}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Автостоп:</span>
                              <span>{test.settings.autoStop ? 'Включён' : 'Отключён'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Плавный запуск:</span>
                              <span>{test.settings.trafficRampUp.enabled ? 'Включён' : 'Отключён'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Нет A/B тестов
                </h3>
                <p className="text-gray-500 mb-6">
                  Создайте первый A/B тест для оптимизации агента
                </p>
                <Button onClick={handleCreateABTest}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать A/B тест
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
