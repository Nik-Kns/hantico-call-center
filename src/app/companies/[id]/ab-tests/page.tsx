'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Plus,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  GitBranch,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Copy
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { mockCampaigns, mockAgents } from '@/lib/mock-data'

// Интерфейс для A/B теста
interface ABTest {
  id: string
  name: string
  status: string
  startDate: Date
  endDate?: Date
  variants: Array<{
    id: string
    name: string
    agent: string
    agentId: string
    split: number
    calls: number
    conversions: number
    conversionRate: number
    avgCallDuration: number
  }>
  winner: string | null
  confidence: number
}

// Mock данные A/B тестов
const mockABTests = [
  {
    id: 'ab-1',
    name: 'Тест приветствия',
    status: 'active',
    startDate: new Date('2025-09-10'),
    variants: [
      {
        id: 'var-a',
        name: 'Вариант A',
        agent: 'Анна',
        agentId: 'agent-1',
        split: 50,
        calls: 1250,
        conversions: 156,
        conversionRate: 12.5,
        avgCallDuration: 180
      },
      {
        id: 'var-b',
        name: 'Вариант B',
        agent: 'Михаил',
        agentId: 'agent-2',
        split: 50,
        calls: 1248,
        conversions: 187,
        conversionRate: 15.0,
        avgCallDuration: 165
      }
    ],
    winner: null,
    confidence: 89
  },
  {
    id: 'ab-2',
    name: 'Тест тона общения',
    status: 'paused',
    startDate: new Date('2025-09-05'),
    variants: [
      {
        id: 'var-a',
        name: 'Вариант A',
        agent: 'Елена',
        agentId: 'agent-3',
        split: 60,
        calls: 800,
        conversions: 120,
        conversionRate: 15.0,
        avgCallDuration: 200
      },
      {
        id: 'var-b',
        name: 'Вариант B',
        agent: 'Анна',
        agentId: 'agent-1',
        split: 40,
        calls: 533,
        conversions: 85,
        conversionRate: 16.0,
        avgCallDuration: 190
      }
    ],
    winner: 'var-b',
    confidence: 95
  },
  {
    id: 'ab-3',
    name: 'Тест скорости речи',
    status: 'completed',
    startDate: new Date('2025-08-20'),
    endDate: new Date('2025-09-01'),
    variants: [
      {
        id: 'var-a',
        name: 'Вариант A',
        agent: 'Михаил',
        agentId: 'agent-2',
        split: 50,
        calls: 2000,
        conversions: 280,
        conversionRate: 14.0,
        avgCallDuration: 175
      },
      {
        id: 'var-b',
        name: 'Вариант B',
        agent: 'Елена',
        agentId: 'agent-3',
        split: 50,
        calls: 1998,
        conversions: 320,
        conversionRate: 16.0,
        avgCallDuration: 185
      }
    ],
    winner: 'var-b',
    confidence: 98
  }
]

export default function CampaignABTestsPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  
  const campaign = mockCampaigns.find(c => c.id === campaignId)
  const [abTests] = useState(mockABTests)
  const [editTestDialog, setEditTestDialog] = useState<{show: boolean, test: any | null}>({
    show: false,
    test: null
  })
  const [splitValues, setSplitValues] = useState<[number, number]>([50, 50])
  const [selectedAgentA, setSelectedAgentA] = useState('')
  const [selectedAgentB, setSelectedAgentB] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTestDetails, setSelectedTestDetails] = useState<ABTest | null>(null)
  
  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Кампания не найдена</p>
        <Button className="mt-4" onClick={() => router.back()}>
          Назад к списку кампаний
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Активен</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">На паузе</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Завершён</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handlePauseTest = (test: any) => {
    setEditTestDialog({ show: true, test })
    // Устанавливаем текущие значения сплита
    setSplitValues([test.variants[0].split, test.variants[1].split])
    setSelectedAgentA(test.variants[0].agentId)
    setSelectedAgentB(test.variants[1].agentId)
  }

  const handleSaveChanges = () => {
    console.log('Сохранение изменений:', {
      split: splitValues,
      agentA: selectedAgentA,
      agentB: selectedAgentB
    })
    setEditTestDialog({ show: false, test: null })
  }

  const handleCreateABTest = () => {
    router.push(`/companies/${campaignId}/ab-tests/new`)
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
              {campaign.name}
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
                  {abTests.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Pause className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">На паузе</p>
                <p className="text-2xl font-bold text-gray-900">
                  {abTests.filter(t => t.status === 'paused').length}
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
      </div>

      {/* Таблица A/B тестов */}
      <Card>
        <CardHeader>
          <CardTitle>Текущие A/B тесты</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Варианты</TableHead>
                <TableHead>Звонков</TableHead>
                <TableHead>Конверсия</TableHead>
                <TableHead>Победитель</TableHead>
                <TableHead>Уверенность</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {abTests.map((test) => {
                const totalCalls = test.variants.reduce((acc, v) => acc + v.calls, 0)
                const avgConversion = test.variants.reduce((acc, v) => acc + v.conversionRate, 0) / test.variants.length
                const winner = test.winner ? test.variants.find(v => v.id === test.winner) : null
                
                return (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-xs text-gray-500">
                          Начат: {test.startDate.toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell>{getStatusBadge(test.status)}</TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {test.variants.map((variant) => (
                          <div key={variant.id} className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {variant.split}%
                            </Badge>
                            <span className="text-sm">{variant.agent}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium">{totalCalls.toLocaleString()}</p>
                        <div className="text-xs text-gray-500 space-y-1 mt-1">
                          {test.variants.map((variant) => (
                            <div key={variant.id}>
                              {variant.name}: {variant.calls}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium">{avgConversion.toFixed(1)}%</p>
                        <div className="text-xs text-gray-500 space-y-1 mt-1">
                          {test.variants.map((variant) => (
                            <div key={variant.id} className={
                              winner && winner.id === variant.id ? 'text-green-600 font-medium' : ''
                            }>
                              {variant.name}: {variant.conversionRate}%
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {winner ? (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            {winner.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {test.confidence ? (
                        <div>
                          <Progress value={test.confidence} className="h-2 w-20" />
                          <p className="text-xs text-gray-500 mt-1">{test.confidence}%</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {test.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseTest(test)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {test.status === 'paused' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePauseTest(test)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTestDetails(test)
                            setShowDetailsModal(true)
                          }}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        {test.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {abTests.length === 0 && (
            <div className="text-center py-12">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Нет активных A/B тестов
              </p>
              <Button onClick={handleCreateABTest}>
                <Plus className="h-4 w-4 mr-2" />
                Создать первый тест
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог редактирования теста на паузе */}
      <Dialog open={editTestDialog.show} onOpenChange={(open) => setEditTestDialog({ show: open, test: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Настройки A/B теста</DialogTitle>
            <DialogDescription>
              Измените параметры теста. Новые настройки будут применены при возобновлении.
            </DialogDescription>
          </DialogHeader>
          
          {editTestDialog.test && (
            <div className="space-y-6">
              {/* Настройка сплита */}
              <div className="space-y-4">
                <Label>Распределение трафика</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Вариант A</span>
                    <span className="text-sm font-medium">{splitValues[0]}%</span>
                  </div>
                  <Slider
                    value={[splitValues[0]]}
                    onValueChange={(value) => setSplitValues([value[0], 100 - value[0]])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Вариант B</span>
                    <span className="text-sm font-medium">{splitValues[1]}%</span>
                  </div>
                </div>
              </div>

              {/* Выбор агентов */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Агент для варианта A</Label>
                  <Select value={selectedAgentA} onValueChange={setSelectedAgentA}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите агента" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAgents.filter(a => a.status === 'active').map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium">Текущая статистика:</p>
                    <p>Звонков: {editTestDialog.test.variants[0].calls}</p>
                    <p>Конверсия: {editTestDialog.test.variants[0].conversionRate}%</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Агент для варианта B</Label>
                  <Select value={selectedAgentB} onValueChange={setSelectedAgentB}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите агента" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAgents.filter(a => a.status === 'active' && a.id !== selectedAgentA).map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium">Текущая статистика:</p>
                    <p>Звонков: {editTestDialog.test.variants[1].calls}</p>
                    <p>Конверсия: {editTestDialog.test.variants[1].conversionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Дополнительные настройки */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Автоматическая остановка</Label>
                    <p className="text-xs text-gray-500">Остановить тест при достижении статистической значимости</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Сброс статистики</Label>
                    <p className="text-xs text-gray-500">Начать сбор данных заново</p>
                  </div>
                  <Switch />
                </div>
              </div>

              {/* Предупреждение */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Важно!</p>
                    <p>Изменения будут применены только после возобновления теста. Текущая статистика сохранится, если не включен сброс.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTestDialog({ show: false, test: null })}>
              Отмена
            </Button>
            <Button onClick={handleSaveChanges}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог детальной статистики A/B теста */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Детальная статистика A/B теста</span>
            </DialogTitle>
            <DialogDescription>
              {selectedTestDetails?.name} • Кампания: {campaign?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTestDetails && (
            <div className="space-y-6">
              {/* Основные метрики */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Статус теста</p>
                    {getStatusBadge(selectedTestDetails.status)}
                    <p className="text-xs text-gray-500 mt-2">
                      Начат {selectedTestDetails.startDate.toLocaleDateString('ru-RU')}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Уверенность</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedTestDetails.confidence}%
                    </p>
                    <Progress value={selectedTestDetails.confidence} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Победитель</p>
                    {selectedTestDetails.winner ? (
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          Вариант {selectedTestDetails.winner}
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-500">Не определён</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Сравнение вариантов */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Сравнение вариантов</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTestDetails.variants.map((variant, index) => (
                    <Card key={index} className={selectedTestDetails.winner === variant.id ? 'border-green-500' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            Вариант {variant.id}
                            {selectedTestDetails.winner === variant.id && (
                              <Badge className="ml-2 bg-green-100 text-green-800">Победитель</Badge>
                            )}
                          </CardTitle>
                          <Badge variant="outline">{variant.split}% трафика</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Агент</p>
                          <p className="font-medium">{variant.agent}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Звонков</p>
                            <p className="text-xl font-bold">{variant.calls.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Конверсий</p>
                            <p className="text-xl font-bold text-green-600">{variant.conversions.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Конверсия</span>
                            <span className="text-lg font-bold">{variant.conversionRate}%</span>
                          </div>
                          <Progress value={variant.conversionRate} className="h-2" />
                        </div>

                        {/* Детальная статистика */}
                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Средняя длительность</span>
                            <span>{Math.round(variant.avgCallDuration || 120)}с</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Отказы</span>
                            <span className="text-red-600">{Math.round(variant.calls * 0.15)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Недозвоны</span>
                            <span className="text-gray-600">{Math.round(variant.calls * 0.1)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* График динамики */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Динамика конверсии</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">График динамики конверсии</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Вариант A: стабильный рост • Вариант B: высокая волатильность
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Статистическая значимость */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Статистическая значимость</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">P-value</span>
                      <span className="font-mono text-sm">0.023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Размер выборки</span>
                      <span className="font-mono text-sm">
                        {selectedTestDetails.variants.reduce((sum, v) => sum + v.calls, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Минимальный детектируемый эффект</span>
                      <span className="font-mono text-sm">2.5%</span>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        {selectedTestDetails.confidence >= 95 
                          ? '✓ Результаты статистически значимы. Можно принимать решение.'
                          : '⚠️ Требуется больше данных для статистической значимости.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Рекомендации */}
              {selectedTestDetails.winner && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Рекомендация
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-900">
                      Рекомендуется применить настройки варианта {selectedTestDetails.winner} 
                      ({selectedTestDetails.variants.find(v => v.id === selectedTestDetails.winner)?.agent}) 
                      ко всей кампании. Это может увеличить конверсию на {' '}
                      {Math.round(
                        (selectedTestDetails.variants.find(v => v.id === selectedTestDetails.winner)?.conversionRate || 0) -
                        (selectedTestDetails.variants.find(v => v.id !== selectedTestDetails.winner)?.conversionRate || 0)
                      )}%.
                    </p>
                    <Button className="mt-3" size="sm">
                      Применить победителя
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Закрыть
            </Button>
            {selectedTestDetails?.status === 'active' && (
              <Button variant="destructive">
                Остановить тест
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}