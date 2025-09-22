'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Key,
  Phone,
  Database,
  Activity,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  Shield,
  Plus,
  Edit,
  Trash2,
  Settings
} from 'lucide-react'

interface SipChannel {
  id: string
  name: string
  sipUri: string
  login: string
  password: string
  transport: 'UDP' | 'TCP' | 'TLS' | 'WS' | 'WSS'
  registration: boolean
  callerId: string
  status: 'registered' | 'unregistered' | 'error'
  updatedAt: string
  additionalParams?: string
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState('hnt_live_example_key_1234567890abcdef')
  const [isCopied, setIsCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  
  // SIP каналы
  const [sipChannels, setSipChannels] = useState<SipChannel[]>([])
  const [showSipDialog, setShowSipDialog] = useState(false)
  const [editingSipChannel, setEditingSipChannel] = useState<SipChannel | null>(null)
  const [showSipPassword, setShowSipPassword] = useState(false)
  const [defaultTestNumber, setDefaultTestNumber] = useState('+7 (999) 123-45-67')
  
  // Форма для SIP канала
  const [sipForm, setSipForm] = useState<Partial<SipChannel>>({
    name: '',
    sipUri: '',
    login: '',
    password: '',
    transport: 'UDP',
    registration: true,
    callerId: '',
    additionalParams: ''
  })
  
  // ERP API настройки - эндпоинты только для чтения
  const endpoints = {
    receiveTasks: 'https://api.hantico.ai/v1/tasks/receive',
    sendResults: 'https://api.hantico.ai/v1/results/send'
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleCopyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint)
  }

  const handleRegenerateApiKey = () => {
    setIsRegenerating(true)
    // Симуляция генерации нового ключа
    setTimeout(() => {
      const newKey = 'hnt_live_' + Math.random().toString(36).substring(2, 38)
      setApiKey(newKey)
      setIsRegenerating(false)
      setShowRegenerateDialog(false)
    }, 1500)
  }

  const handleTestConnection = () => {
    setIsTestingConnection(true)
    setTestResult(null)
    
    // Симуляция тестового запроса
    setTimeout(() => {
      const success = Math.random() > 0.3
      setTestResult(success ? 'success' : 'error')
      setIsTestingConnection(false)
      
      // Очистка результата через 5 секунд
      setTimeout(() => {
        setTestResult(null)
      }, 5000)
    }, 2000)
  }

  const copyExampleCode = (type: 'receive' | 'send') => {
    const examples = {
      receive: `curl -X POST ${endpoints.receiveTasks}
  -H "Authorization: Bearer ${apiKey}"
  -H "Content-Type: application/json"
  -d '{
    "campaign_id": "CMP-123456",
    "tasks": [
      {
        "id": "TASK-001",
        "phone": "+7 (999) 123-45-67",
        "data": {
          "name": "Иван Иванов",
          "custom_field": "value"
        }
      }
    ]
  }'`,
      send: `curl -X GET ${endpoints.sendResults}
  -H "Authorization: Bearer ${apiKey}"
  -H "Content-Type: application/json"`
    }
    
    navigator.clipboard.writeText(examples[type])
  }

  const handleAddSipChannel = () => {
    setEditingSipChannel(null)
    setSipForm({
      name: '',
      sipUri: '',
      login: '',
      password: '',
      transport: 'UDP',
      registration: true,
      callerId: '',
      additionalParams: ''
    })
    setShowSipDialog(true)
  }

  const handleEditSipChannel = (channel: SipChannel) => {
    setEditingSipChannel(channel)
    setSipForm({
      ...channel
    })
    setShowSipDialog(true)
  }

  const handleSaveSipChannel = () => {
    if (editingSipChannel) {
      // Редактирование существующего канала
      setSipChannels(prev => prev.map(ch => 
        ch.id === editingSipChannel.id 
          ? { 
              ...ch, 
              ...sipForm,
              updatedAt: new Date().toISOString()
            } 
          : ch
      ))
    } else {
      // Добавление нового канала
      const newChannel: SipChannel = {
        id: Math.random().toString(36).substring(7),
        name: sipForm.name || '',
        sipUri: sipForm.sipUri || '',
        login: sipForm.login || '',
        password: sipForm.password || '',
        transport: sipForm.transport || 'UDP',
        registration: sipForm.registration || false,
        callerId: sipForm.callerId || '',
        status: Math.random() > 0.3 ? 'registered' : 'unregistered',
        updatedAt: new Date().toISOString(),
        additionalParams: sipForm.additionalParams
      }
      setSipChannels(prev => [...prev, newChannel])
    }
    
    setShowSipDialog(false)
    setSipForm({})
  }

  const handleDeleteSipChannel = (id: string) => {
    setSipChannels(prev => prev.filter(ch => ch.id !== id))
  }

  const maskUri = (uri: string) => {
    if (!uri) return ''
    const parts = uri.split('@')
    if (parts.length === 2) {
      return parts[0].substring(0, 3) + '***@' + parts[1]
    }
    return uri.substring(0, 5) + '***'
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
            <h1 className="text-3xl font-bold mb-2">Интеграции</h1>
            <p className="text-gray-600">
              Настройка подключений к ERP и телефонии
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="erp" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="erp">ERP API</TabsTrigger>
          <TabsTrigger value="asterisk">Asterisk</TabsTrigger>
        </TabsList>

        {/* ERP API Tab */}
        <TabsContent value="erp" className="space-y-6">
          {/* API Key Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Управление API</CardTitle>
                  <CardDescription>
                    Ключ доступа для интеграции с вашей ERP системой
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Ключ</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="relative flex-1">
                      <Input
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        readOnly
                        className="pr-20 font-mono text-sm"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="h-7 w-7 p-0"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyApiKey}
                          className="h-7 w-7 p-0"
                        >
                          {isCopied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setShowRegenerateDialog(true)}
                      variant="outline"
                      disabled={isRegenerating}
                    >
                      {isRegenerating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      Регенерировать
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Используйте этот ключ в заголовке Authorization для всех API запросов
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Референс эндпоинтов</CardTitle>
              <CardDescription>
                Точки доступа для обмена данными между ERP и Hantico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Receive Tasks Endpoint */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Приём задач</Label>
                    <Badge className="bg-green-100 text-green-800">POST</Badge>
                  </div>
                  <div className="relative">
                    <Input
                      value={endpoints.receiveTasks}
                      readOnly
                      className="font-mono text-sm pr-10"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyEndpoint(endpoints.receiveTasks)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Эндпоинт для отправки задач на обзвон из вашей ERP
                  </p>
                </div>

                {/* Example for Receive */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Пример запроса</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyExampleCode('receive')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Копировать
                    </Button>
                  </div>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`curl -X POST ${endpoints.receiveTasks}
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"
  -d '{
    "campaign_id": "CMP-123456",
    "tasks": [...]
  }'`}
                  </pre>
                </div>
              </div>

              <div className="border-t pt-6">
                {/* Send Results Endpoint */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Выдача результатов</Label>
                      <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                    </div>
                    <div className="relative">
                      <Input
                        value={endpoints.sendResults}
                        readOnly
                        className="font-mono text-sm pr-10"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyEndpoint(endpoints.sendResults)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Эндпоинт для получения результатов обзвона в вашу ERP
                    </p>
                  </div>

                  {/* Example for Send */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Пример запроса</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyExampleCode('send')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Копировать
                      </Button>
                    </div>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`curl -X GET ${endpoints.sendResults}
  -H "Authorization: Bearer YOUR_API_KEY"
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Test Connection */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Проверка подключения</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Отправить тестовый запрос для проверки соединения
                    </p>
                  </div>
                  <Button 
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Проверка...
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 mr-2" />
                        Проверить подключение
                      </>
                    )}
                  </Button>
                </div>
                
                {testResult && (
                  <div className={`mt-4 p-3 rounded-lg border ${
                    testResult === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {testResult === 'success' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-700">
                            Подключение успешно установлено
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-sm text-red-700">
                            Ошибка подключения. Проверьте настройки и попробуйте снова
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asterisk Tab */}
        <TabsContent value="asterisk" className="space-y-6">
          {/* Default Test Number */}
          <Card>
            <CardHeader>
              <CardTitle>Тестовый номер по умолчанию</CardTitle>
              <CardDescription>
                Номер телефона для тестовых звонков из разделов Агенты и Компании
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Input
                  value={defaultTestNumber}
                  onChange={(e) => setDefaultTestNumber(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="max-w-xs"
                />
                <Button variant="outline">
                  Сохранить
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Этот номер будет использоваться по умолчанию при тестировании агентов
              </p>
            </CardContent>
          </Card>

          {/* SIP Channels */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>SIP-каналы</CardTitle>
                    <CardDescription>
                      Настройка подключений к телефонным станциям
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={handleAddSipChannel}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить SIP-канал
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sipChannels.length === 0 ? (
                <div className="text-center py-12">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">SIP-каналы не настроены</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Добавьте первый канал для начала работы с телефонией
                  </p>
                  <Button onClick={handleAddSipChannel}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить SIP-канал
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Номер (CallerID)</TableHead>
                      <TableHead>URI/хост</TableHead>
                      <TableHead>Статус регистрации</TableHead>
                      <TableHead>Обновлён</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sipChannels.map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell className="font-medium">{channel.name}</TableCell>
                        <TableCell>{channel.callerId || '—'}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {maskUri(channel.sipUri)}
                        </TableCell>
                        <TableCell>
                          {channel.status === 'registered' ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Зарегистрирован
                            </Badge>
                          ) : channel.status === 'error' ? (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Ошибка
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Не зарегистрирован
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(channel.updatedAt).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditSipChannel(channel)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSipChannel(channel.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Regenerate Key Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              Регенерация API ключа
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3 mt-4">
                <p>
                  Вы уверены, что хотите сгенерировать новый API ключ?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Внимание:</strong> Текущий ключ будет немедленно инвалидирован. 
                    Все существующие интеграции перестанут работать до обновления ключа в вашей ERP системе.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Убедитесь, что вы готовы обновить ключ во всех интеграциях</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRegenerateApiKey}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Сгенерировать новый ключ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SIP Channel Dialog */}
      <Dialog open={showSipDialog} onOpenChange={setShowSipDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSipChannel ? 'Редактирование SIP-канала' : 'Новый SIP-канал'}
            </DialogTitle>
            <DialogDescription>
              Настройте параметры подключения к вашей телефонной станции
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sip-name">
                  <span className="text-red-500">*</span> Название канала
                </Label>
                <Input
                  id="sip-name"
                  value={sipForm.name || ''}
                  onChange={(e) => setSipForm({ ...sipForm, name: e.target.value })}
                  placeholder="Основной канал"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="sip-uri">
                  <span className="text-red-500">*</span> SIP URI/хост
                </Label>
                <Input
                  id="sip-uri"
                  value={sipForm.sipUri || ''}
                  onChange={(e) => setSipForm({ ...sipForm, sipUri: e.target.value })}
                  placeholder="sip:user@domain.com или 192.168.1.1"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sip-login">
                  <span className="text-red-500">*</span> Логин
                </Label>
                <Input
                  id="sip-login"
                  value={sipForm.login || ''}
                  onChange={(e) => setSipForm({ ...sipForm, login: e.target.value })}
                  placeholder="user123"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="sip-password">
                  <span className="text-red-500">*</span> Пароль
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="sip-password"
                    type={showSipPassword ? "text" : "password"}
                    value={sipForm.password || ''}
                    onChange={(e) => setSipForm({ ...sipForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSipPassword(!showSipPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                    {showSipPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sip-transport">Transport</Label>
                <Select 
                  value={sipForm.transport}
                  onValueChange={(value: any) => setSipForm({ ...sipForm, transport: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UDP">UDP</SelectItem>
                    <SelectItem value="TCP">TCP</SelectItem>
                    <SelectItem value="TLS">TLS</SelectItem>
                    <SelectItem value="WS">WS</SelectItem>
                    <SelectItem value="WSS">WSS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sip-callerid">Outbound CallerID</Label>
                <Input
                  id="sip-callerid"
                  value={sipForm.callerId || ''}
                  onChange={(e) => setSipForm({ ...sipForm, callerId: e.target.value })}
                  placeholder="+7 (495) 123-45-67"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Номер, отображаемый при исходящих звонках
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sip-registration"
                checked={sipForm.registration}
                onCheckedChange={(checked) => setSipForm({ ...sipForm, registration: checked })}
              />
              <Label htmlFor="sip-registration">
                Регистрация на сервере
              </Label>
            </div>

            <div>
              <Label htmlFor="sip-additional">
                Дополнительные параметры (опционально)
              </Label>
              <Input
                id="sip-additional"
                value={sipForm.additionalParams || ''}
                onChange={(e) => setSipForm({ ...sipForm, additionalParams: e.target.value })}
                placeholder="key=value;key2=value2"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Дополнительные SIP-параметры в формате key=value через точку с запятой
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSipDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleSaveSipChannel}
              disabled={!sipForm.name || !sipForm.sipUri || !sipForm.login || !sipForm.password}
            >
              {editingSipChannel ? 'Сохранить изменения' : 'Добавить канал'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}