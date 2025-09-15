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
                          onClick={() => router.push(`/companies/${campaignId}/ab-tests/${test.id}`)}
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
    </div>
  )
}