'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Link2,
  Plus,
  Copy,
  ExternalLink,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  MousePointer,
  UserCheck,
  Activity
} from 'lucide-react'

interface Aggregator {
  id: string
  name: string
  baseUrl: string
  active: boolean
  campaigns: string[]
  parameters: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    partner_id?: string
    sub_id?: string
  }
  stats?: {
    clicks: number
    registrations: number
    conversions: number
  }
}

interface OnboardingLead {
  id: string
  phone: string
  campaign: string
  aggregator: string
  funnelStatus: 'clicked' | 'started' | 'completed' | 'abandoned'
  timestamp: string
  timeSpent?: string
  step?: string
}

const mockAggregators: Aggregator[] = [
  {
    id: 'agg_1',
    name: 'Partner Network 1',
    baseUrl: 'https://partner1.com/register',
    active: true,
    campaigns: ['Новогодняя кампания', 'VIP сегмент'],
    parameters: {
      utm_source: 'hantico',
      utm_medium: 'ai_call',
      partner_id: 'HNT2024',
      sub_id: '{LEAD_ID}'
    },
    stats: {
      clicks: 1234,
      registrations: 456,
      conversions: 123
    }
  },
  {
    id: 'agg_2',
    name: 'Affiliate Platform X',
    baseUrl: 'https://afplatform.io/land',
    active: true,
    campaigns: ['Реактивация клиентов'],
    parameters: {
      utm_source: 'ai_voice',
      utm_campaign: '{CAMPAIGN_ID}',
      partner_id: 'HANTICO'
    },
    stats: {
      clicks: 567,
      registrations: 234,
      conversions: 89
    }
  },
  {
    id: 'agg_3',
    name: 'Direct Partner',
    baseUrl: 'https://direct-partner.ru/onboard',
    active: false,
    campaigns: [],
    parameters: {
      source: 'hantico_ai'
    }
  }
]

const mockOnboardingData: OnboardingLead[] = [
  {
    id: 'lead_1',
    phone: '+7900***1234',
    campaign: 'Новогодняя кампания',
    aggregator: 'Partner Network 1',
    funnelStatus: 'completed',
    timestamp: '2024-01-09 10:45:00',
    timeSpent: '3м 24с'
  },
  {
    id: 'lead_2',
    phone: '+7900***2345',
    campaign: 'Реактивация клиентов',
    aggregator: 'Affiliate Platform X',
    funnelStatus: 'abandoned',
    timestamp: '2024-01-09 10:30:00',
    timeSpent: '1м 45с',
    step: 'Ввод email'
  },
  {
    id: 'lead_3',
    phone: '+7900***3456',
    campaign: 'VIP сегмент',
    aggregator: 'Partner Network 1',
    funnelStatus: 'started',
    timestamp: '2024-01-09 10:15:00',
    timeSpent: '45с',
    step: 'Подтверждение номера'
  },
  {
    id: 'lead_4',
    phone: '+7900***4567',
    campaign: 'Новогодняя кампания',
    aggregator: 'Partner Network 1',
    funnelStatus: 'clicked',
    timestamp: '2024-01-09 10:00:00'
  }
]

export default function AggregatorsPage() {
  const router = useRouter()
  const [aggregators, setAggregators] = useState<Aggregator[]>(mockAggregators)
  const [onboardingData, setOnboardingData] = useState<OnboardingLead[]>(mockOnboardingData)
  const [activeTab, setActiveTab] = useState('aggregators')

  const handleToggleAggregator = (id: string) => {
    setAggregators(prev => prev.map(agg => {
      if (agg.id === id) {
        return { ...agg, active: !agg.active }
      }
      return agg
    }))
  }

  const generateDeeplink = (aggregator: Aggregator, campaign: string) => {
    let url = aggregator.baseUrl + '?'
    const params = new URLSearchParams()
    
    Object.entries(aggregator.parameters).forEach(([key, value]) => {
      if (value) {
        const processedValue = value
          .replace('{CAMPAIGN_ID}', campaign.toLowerCase().replace(/\s+/g, '_'))
          .replace('{LEAD_ID}', 'XXXXX')
        params.append(key, processedValue)
      }
    })
    
    return url + params.toString()
  }

  const getFunnelStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Завершен</Badge>
      case 'started':
        return <Badge className="bg-blue-100 text-blue-800">В процессе</Badge>
      case 'abandoned':
        return <Badge className="bg-red-100 text-red-800">Отвалился</Badge>
      case 'clicked':
        return <Badge className="bg-gray-100 text-gray-800">Кликнул</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const funnelStats = {
    clicked: onboardingData.filter(l => l.funnelStatus === 'clicked').length,
    started: onboardingData.filter(l => l.funnelStatus === 'started').length,
    completed: onboardingData.filter(l => l.funnelStatus === 'completed').length,
    abandoned: onboardingData.filter(l => l.funnelStatus === 'abandoned').length
  }

  const conversionRate = ((funnelStats.completed / onboardingData.length) * 100).toFixed(1)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/settings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к настройкам
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Каталог агрегаторов и диплинк-роутер</h1>
            <p className="text-gray-600">
              Управление партнерскими ссылками и отслеживание воронки регистрации
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить агрегатор
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="aggregators">Агрегаторы</TabsTrigger>
          <TabsTrigger value="onboarding">Онбординг-трекер</TabsTrigger>
        </TabsList>

        <TabsContent value="aggregators">
          {/* Aggregators Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Активные агрегаторы</p>
                    <p className="text-2xl font-bold">
                      {aggregators.filter(a => a.active).length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Всего кликов</p>
                    <p className="text-2xl font-bold">
                      {aggregators.reduce((sum, a) => sum + (a.stats?.clicks || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <MousePointer className="h-8 w-8 text-blue-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Регистраций</p>
                    <p className="text-2xl font-bold">
                      {aggregators.reduce((sum, a) => sum + (a.stats?.registrations || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-purple-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Конверсий</p>
                    <p className="text-2xl font-bold">
                      {aggregators.reduce((sum, a) => sum + (a.stats?.conversions || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aggregators List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aggregators.map((aggregator) => (
              <Card key={aggregator.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{aggregator.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {aggregator.baseUrl}
                      </CardDescription>
                    </div>
                    <Switch
                      checked={aggregator.active}
                      onCheckedChange={() => handleToggleAggregator(aggregator.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">Параметры UTM</Label>
                      <div className="mt-2 space-y-1">
                        {Object.entries(aggregator.parameters).map(([key, value]) => (
                          <div key={key} className="flex items-center text-sm">
                            <span className="text-gray-600 w-32">{key}:</span>
                            <span className="font-mono text-xs">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {aggregator.campaigns.length > 0 && (
                      <div>
                        <Label className="text-sm">Активные кампании</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {aggregator.campaigns.map((campaign, idx) => (
                            <Badge key={idx} variant="outline">{campaign}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {aggregator.stats && (
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Клики</p>
                          <p className="text-sm font-semibold">{aggregator.stats.clicks}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Регистрации</p>
                          <p className="text-sm font-semibold">{aggregator.stats.registrations}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Конверсии</p>
                          <p className="text-sm font-semibold">{aggregator.stats.conversions}</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <Label className="text-sm">Пример диплинка</Label>
                      <div className="mt-2 flex items-center space-x-2">
                        <Input
                          value={generateDeeplink(aggregator, 'test_campaign')}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Настроить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          {/* Onboarding Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Кликнули</p>
                    <p className="text-2xl font-bold">{funnelStats.clicked}</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-gray-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Начали</p>
                    <p className="text-2xl font-bold text-blue-600">{funnelStats.started}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Завершили</p>
                    <p className="text-2xl font-bold text-green-600">{funnelStats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Отвалились</p>
                    <p className="text-2xl font-bold text-red-600">{funnelStats.abandoned}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Конверсия</p>
                    <p className="text-2xl font-bold text-emerald-600">{conversionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600 opacity-60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funnel Visualization */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Воронка регистрации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Кликнули по ссылке</span>
                    <span className="text-sm font-medium">100%</span>
                  </div>
                  <Progress value={100} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Начали регистрацию</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Завершили регистрацию</span>
                    <span className="text-sm font-medium">{conversionRate}%</span>
                  </div>
                  <Progress value={parseFloat(conversionRate)} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Table */}
          <Card>
            <CardHeader>
              <CardTitle>Детальная статистика по лидам</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Кампания</TableHead>
                    <TableHead>Агрегатор</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Шаг</TableHead>
                    <TableHead>Время на сайте</TableHead>
                    <TableHead>Время события</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {onboardingData.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-mono">{lead.phone}</TableCell>
                      <TableCell>{lead.campaign}</TableCell>
                      <TableCell>{lead.aggregator}</TableCell>
                      <TableCell>{getFunnelStatusBadge(lead.funnelStatus)}</TableCell>
                      <TableCell>{lead.step || '-'}</TableCell>
                      <TableCell>{lead.timeSpent || '-'}</TableCell>
                      <TableCell className="text-sm">{lead.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}