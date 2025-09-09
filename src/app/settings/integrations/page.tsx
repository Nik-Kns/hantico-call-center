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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Plug,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Key,
  Link,
  Phone,
  MessageSquare,
  Database,
  Webhook,
  Shield,
  Activity
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  type: 'crm' | 'telephony' | 'sms' | 'webhook'
  status: 'connected' | 'disconnected' | 'error'
  icon: React.ElementType
  color: string
  config: {
    apiKey?: string
    apiUrl?: string
    webhookUrl?: string
    sipServer?: string
    sipUser?: string
    smsGateway?: string
    senderId?: string
  }
  lastSync?: string
  metrics?: {
    requests24h: number
    errors24h: number
    avgResponseTime: number
  }
}

const mockIntegrations: Integration[] = [
  {
    id: 'bitrix24',
    name: 'Bitrix24',
    type: 'crm',
    status: 'connected',
    icon: Database,
    color: 'text-blue-600',
    config: {
      apiUrl: 'https://company.bitrix24.ru/rest/',
      apiKey: 'k3j4h5...masked',
      webhookUrl: 'https://api.hantico.ai/webhook/bitrix24'
    },
    lastSync: '2 минуты назад',
    metrics: {
      requests24h: 1234,
      errors24h: 2,
      avgResponseTime: 145
    }
  },
  {
    id: 'asterisk',
    name: 'Asterisk PBX',
    type: 'telephony',
    status: 'connected',
    icon: Phone,
    color: 'text-green-600',
    config: {
      sipServer: 'pbx.company.ru:5060',
      sipUser: 'ai_agent_001'
    },
    lastSync: '5 секунд назад',
    metrics: {
      requests24h: 5678,
      errors24h: 0,
      avgResponseTime: 23
    }
  },
  {
    id: 'sms_center',
    name: 'SMS Center',
    type: 'sms',
    status: 'error',
    icon: MessageSquare,
    color: 'text-purple-600',
    config: {
      smsGateway: 'https://smsc.ru/sys/send.php',
      senderId: 'HANTICO'
    },
    lastSync: '1 час назад',
    metrics: {
      requests24h: 890,
      errors24h: 45,
      avgResponseTime: 567
    }
  },
  {
    id: 'webhook_status',
    name: 'Webhook статусов',
    type: 'webhook',
    status: 'disconnected',
    icon: Webhook,
    color: 'text-orange-600',
    config: {
      webhookUrl: ''
    }
  }
]

export default function IntegrationsPage() {
  const router = useRouter()
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        return {
          ...integration,
          status: integration.status === 'connected' ? 'disconnected' : 'connected'
        }
      }
      return integration
    }))
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setTestingConnection(false)
    if (selectedIntegration) {
      setIntegrations(prev => prev.map(integration => {
        if (integration.id === selectedIntegration.id) {
          return { ...integration, status: 'connected' }
        }
        return integration
      }))
    }
    setShowConfigDialog(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Подключено</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Ошибка</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Отключено</Badge>
    }
  }

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
            <h1 className="text-3xl font-bold mb-2">Хаб интеграций</h1>
            <p className="text-gray-600">
              Управление подключениями к внешним системам и сервисам
            </p>
          </div>
          <Button>
            <Plug className="h-4 w-4 mr-2" />
            Добавить интеграцию
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Activity className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">С ошибками</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API запросов/24ч</p>
                <p className="text-2xl font-bold">8.6K</p>
              </div>
              <Webhook className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">99.8%</p>
              </div>
              <Shield className="h-8 w-8 text-emerald-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className={integration.status === 'error' ? 'border-red-200' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center`}>
                    <integration.icon className={`h-6 w-6 ${integration.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {integration.lastSync && `Последняя синхронизация: ${integration.lastSync}`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(integration.status)}
                  {getStatusBadge(integration.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {integration.config && (
                <div className="space-y-2 mb-4">
                  {integration.config.apiUrl && (
                    <div className="flex items-center text-sm">
                      <Link className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">API URL:</span>
                      <span className="ml-2 font-mono text-xs">{integration.config.apiUrl}</span>
                    </div>
                  )}
                  {integration.config.sipServer && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">SIP сервер:</span>
                      <span className="ml-2 font-mono text-xs">{integration.config.sipServer}</span>
                    </div>
                  )}
                  {integration.config.smsGateway && (
                    <div className="flex items-center text-sm">
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">SMS шлюз:</span>
                      <span className="ml-2 font-mono text-xs">{integration.config.smsGateway}</span>
                    </div>
                  )}
                  {integration.config.apiKey && (
                    <div className="flex items-center text-sm">
                      <Key className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">API ключ:</span>
                      <span className="ml-2 font-mono text-xs">{integration.config.apiKey}</span>
                    </div>
                  )}
                </div>
              )}

              {integration.metrics && (
                <div className="grid grid-cols-3 gap-2 mb-4 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Запросов/24ч</p>
                    <p className="text-sm font-semibold">{integration.metrics.requests24h.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Ошибок/24ч</p>
                    <p className="text-sm font-semibold text-red-600">{integration.metrics.errors24h}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Ср. время (мс)</p>
                    <p className="text-sm font-semibold">{integration.metrics.avgResponseTime}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={integration.status === 'connected'}
                    onCheckedChange={() => handleToggleIntegration(integration.id)}
                  />
                  <Label className="text-sm">
                    {integration.status === 'connected' ? 'Активна' : 'Отключена'}
                  </Label>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedIntegration(integration)
                      setShowConfigDialog(true)
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {integration.status === 'error' && (
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Настройка интеграции</DialogTitle>
            <DialogDescription>
              Обновите параметры подключения к {selectedIntegration?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4">
              {selectedIntegration.type === 'crm' && (
                <>
                  <div>
                    <Label htmlFor="api-url">API URL</Label>
                    <Input
                      id="api-url"
                      defaultValue={selectedIntegration.config.apiUrl}
                      placeholder="https://company.bitrix24.ru/rest/"
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-key">API ключ</Label>
                    <Input
                      id="api-key"
                      type="password"
                      defaultValue={selectedIntegration.config.apiKey}
                      placeholder="Введите API ключ"
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL для событий</Label>
                    <Input
                      id="webhook-url"
                      defaultValue={selectedIntegration.config.webhookUrl}
                      placeholder="https://api.hantico.ai/webhook/..."
                    />
                  </div>
                </>
              )}
              
              {selectedIntegration.type === 'telephony' && (
                <>
                  <div>
                    <Label htmlFor="sip-server">SIP сервер</Label>
                    <Input
                      id="sip-server"
                      defaultValue={selectedIntegration.config.sipServer}
                      placeholder="pbx.company.ru:5060"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sip-user">SIP пользователь</Label>
                    <Input
                      id="sip-user"
                      defaultValue={selectedIntegration.config.sipUser}
                      placeholder="ai_agent_001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sip-password">SIP пароль</Label>
                    <Input
                      id="sip-password"
                      type="password"
                      placeholder="Введите пароль"
                    />
                  </div>
                </>
              )}
              
              {selectedIntegration.type === 'sms' && (
                <>
                  <div>
                    <Label htmlFor="sms-gateway">SMS Gateway URL</Label>
                    <Input
                      id="sms-gateway"
                      defaultValue={selectedIntegration.config.smsGateway}
                      placeholder="https://smsc.ru/sys/send.php"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sender-id">Sender ID</Label>
                    <Input
                      id="sender-id"
                      defaultValue={selectedIntegration.config.senderId}
                      placeholder="HANTICO"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sms-login">Логин</Label>
                    <Input
                      id="sms-login"
                      placeholder="Введите логин"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sms-password">Пароль</Label>
                    <Input
                      id="sms-password"
                      type="password"
                      placeholder="Введите пароль"
                    />
                  </div>
                </>
              )}
              
              {selectedIntegration.type === 'webhook' && (
                <div>
                  <Label htmlFor="webhook-endpoint">Webhook Endpoint</Label>
                  <Input
                    id="webhook-endpoint"
                    defaultValue={selectedIntegration.config.webhookUrl}
                    placeholder="https://your-server.com/webhook"
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleTestConnection} disabled={testingConnection}>
              {testingConnection ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Тестирование...
                </>
              ) : (
                'Сохранить и протестировать'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}