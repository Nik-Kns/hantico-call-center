'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Edit,
  Copy,
  Play,
  Pause,
  Archive,
  Settings,
  Volume2,
  MessageSquare,
  Phone,
  Clock,
  TrendingUp,
  Calendar,
  Users,
  BarChart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  FileText,
  FlaskConical
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { mockAgents, mockVoices } from '@/lib/mock-data'
import { BaseType } from '@/lib/types'

interface CampaignHistory {
  id: string
  name: string
  baseType: BaseType
  startDate: Date
  endDate?: Date
  status: 'active' | 'completed' | 'paused'
  totalCalls: number
  successfulCalls: number
  conversionRate: number
  avgCallDuration: number
}

const mockCampaignHistory: CampaignHistory[] = [
  {
    id: 'camp-1',
    name: 'Новогодняя акция 2025',
    baseType: 'registration',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-15'),
    status: 'completed',
    totalCalls: 5432,
    successfulCalls: 2105,
    conversionRate: 38.7,
    avgCallDuration: 180
  },
  {
    id: 'camp-2',
    name: 'Реактивация клиентов Q4',
    baseType: 'reactivation',
    startDate: new Date('2024-12-01'),
    status: 'active',
    totalCalls: 3210,
    successfulCalls: 987,
    conversionRate: 30.7,
    avgCallDuration: 145
  },
  {
    id: 'camp-3',
    name: 'Работа с недозвонами',
    baseType: 'no_answer',
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-12-30'),
    status: 'completed',
    totalCalls: 8765,
    successfulCalls: 3506,
    conversionRate: 40.0,
    avgCallDuration: 210
  }
]

export default function AgentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  
  const agent = mockAgents.find(a => a.id === agentId) || mockAgents[0]
  const voice = mockVoices.find(v => v.id === agent.voiceId)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [agentPrompt, setAgentPrompt] = useState(agent.prompts[0]?.prompt || '')
  
  const totalCalls = mockCampaignHistory.reduce((sum, c) => sum + c.totalCalls, 0)
  const totalSuccess = mockCampaignHistory.reduce((sum, c) => sum + c.successfulCalls, 0)
  const avgConversion = totalCalls > 0 ? (totalSuccess / totalCalls * 100).toFixed(1) : '0'
  const activeCampaigns = mockCampaignHistory.filter(c => c.status === 'active').length
  
  const getBaseTypeBadge = (baseType: BaseType) => {
    switch (baseType) {
      case 'registration':
        return <Badge className="bg-blue-100 text-blue-800">Регистрация</Badge>
      case 'no_answer':
        return <Badge className="bg-orange-100 text-orange-800">Недозвон</Badge>
      case 'refusals':
        return <Badge className="bg-red-100 text-red-800">Отказники</Badge>
      case 'reactivation':
        return <Badge className="bg-purple-100 text-purple-800">Реактивация</Badge>
      default:
        return <Badge>{baseType}</Badge>
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
              {getBaseTypeBadge(agent.baseType)}
              <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {agent.status === 'active' ? 'Активен' : 'Неактивен'}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">{agent.description}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => router.push(`/agents/${agentId}/test`)}>
            <Phone className="h-4 w-4 mr-2" />
            Тестировать
          </Button>
          <Button variant="outline" onClick={() => router.push(`/agents/${agentId}/prompts`)}>
            <Edit className="h-4 w-4 mr-2" />
            Редактировать промты
          </Button>
          <Button variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            Архивировать
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего кампаний</p>
                <p className="text-2xl font-bold text-gray-900">{mockCampaignHistory.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="h-6 w-6 text-purple-600" />
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Успешных</p>
                <p className="text-2xl font-bold text-gray-900">{totalSuccess.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Конверсия</p>
                <p className="text-2xl font-bold text-gray-900">{avgConversion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Табы */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="history">История кампаний</TabsTrigger>
          <TabsTrigger value="prompts">Промты и инструкции</TabsTrigger>
          <TabsTrigger value="ab-tests">A/B тесты</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        {/* Обзор */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация об агенте</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">ID агента</Label>
                  <p className="font-mono font-medium">{agent.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Версия</Label>
                  <p className="font-medium">v{agent.version}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Голос</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Volume2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{voice?.name || 'Не назначен'}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Роль</Label>
                  <p className="font-medium">
                    {agent.role === 'registration_agent' ? 'Агент регистрации' :
                     agent.role === 'reactivation_agent' ? 'Агент реактивации' :
                     agent.role === 'cold_calling_agent' ? 'Холодные звонки' : agent.role}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Количество промтов</Label>
                  <p className="font-medium">{agent.prompts.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Производительность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Средняя конверсия</span>
                    <span className="font-medium">{avgConversion}%</span>
                  </div>
                  <Progress value={parseFloat(avgConversion)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Средняя длительность</span>
                    <span className="font-medium">3:25</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Успешность дозвона</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Лучший результат</span>
                    <span className="font-medium text-green-600">45.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Худший результат</span>
                    <span className="font-medium text-red-600">28.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* История кампаний */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История использования в кампаниях</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Кампания
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Тип базы
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Период
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Звонков
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Конверсия
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ср. длительность
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockCampaignHistory.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {campaign.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getBaseTypeBadge(campaign.baseType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {campaign.startDate.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {campaign.endDate ? `до ${campaign.endDate.toLocaleDateString()}` : 'В процессе'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {campaign.status === 'active' ? 'Активна' :
                             campaign.status === 'completed' ? 'Завершена' : 'Пауза'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {campaign.totalCalls.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {campaign.successfulCalls.toLocaleString()} успешных
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {campaign.conversionRate}%
                            </span>
                            {campaign.conversionRate > 35 ? (
                              <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(campaign.avgCallDuration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/companies/${campaign.id}`)}
                          >
                            Открыть
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Промты и инструкции */}
        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Системный промт агента</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Импорт
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Сохранить
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agent-prompt">Основная инструкция</Label>
                <Textarea
                  id="agent-prompt"
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  disabled={!isEditing}
                  className="mt-2 min-h-[400px] font-mono text-sm"
                  placeholder="Введите инструкции для агента..."
                />
              </div>
              
              {agent.prompts.length > 1 && (
                <>
                  <Separator />
                  <div>
                    <Label>Дополнительные промты</Label>
                    <div className="space-y-2 mt-2">
                      {agent.prompts.slice(1).map((prompt, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">Промт {index + 2}</span>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {prompt.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  Изменения в промтах применятся только к новым кампаниям
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B тесты */}
        <TabsContent value="ab-tests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>A/B тесты с участием агента</CardTitle>
                <Button>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Создать тест
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Тест приветствия v2</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Сравнение стандартного и персонализированного приветствия
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Активен</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Кампаний:</span>
                      <p className="font-medium">3</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Звонков:</span>
                      <p className="font-medium">1,234</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Победитель:</span>
                      <p className="font-medium text-green-600">Вариант B (+12%)</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Тест голосов</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Мужской vs женский голос для целевой аудитории
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Завершен</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Кампаний:</span>
                      <p className="font-medium">2</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Звонков:</span>
                      <p className="font-medium">892</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Победитель:</span>
                      <p className="font-medium text-green-600">Вариант A (+8%)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Настройки */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Настройки агента</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Автоматическое обучение</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Агент будет автоматически улучшаться на основе результатов
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Запись разговоров</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Сохранять аудиозаписи для анализа качества
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Транскрибация</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Автоматически преобразовывать речь в текст
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Включено
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Уведомления об ошибках</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Получать оповещения о проблемах с агентом
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Настроить
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end space-x-3">
                <Button variant="outline">Отмена</Button>
                <Button>Сохранить изменения</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}