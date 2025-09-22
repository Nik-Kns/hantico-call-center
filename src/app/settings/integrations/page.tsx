'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Shield
} from 'lucide-react'

export default function IntegrationsPage() {
  const router = useRouter()
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSipPassword, setShowSipPassword] = useState(false)
  const [apiKey, setApiKey] = useState('hnt_live_example_key_1234567890abcdef')
  const [isCopied, setIsCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  
  // ERP API настройки - эндпоинты только для чтения
  const endpoints = {
    receiveTasks: 'https://api.hantico.ai/v1/tasks/receive',
    sendResults: 'https://api.hantico.ai/v1/results/send'
  }
  
  // Asterisk настройки
  const [asteriskSettings, setAsteriskSettings] = useState({
    server: '158.160.141.1',
    port: '5060',
    username: 'hantico_agent',
    password: '••••••••••••••••••••••••••••',
    sipChannels: '10',
    channelName: 'TNMOTTOK',
    provider: 'standard',
    login: '1550',
    callTransfer: 'standard'
  })

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
        <TabsContent value="asterisk">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Asterisk</CardTitle>
                  <CardDescription>
                    Настройки подключения к вашей телефонной станции
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Channel Name and Provider */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="channel-name">
                    <span className="text-red-500">*</span> Название канала
                  </Label>
                  <Input
                    id="channel-name"
                    value={asteriskSettings.channelName}
                    onChange={(e) => setAsteriskSettings(prev => ({ ...prev, channelName: e.target.value }))}
                    className="mt-2"
                    placeholder="Название канала"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">
                    <span className="text-red-500">*</span> Провайдер
                  </Label>
                  <Select 
                    value={asteriskSettings.provider}
                    onValueChange={(value) => setAsteriskSettings(prev => ({ ...prev, provider: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Выберите провайдера" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Стандартные настройки</SelectItem>
                      <SelectItem value="custom">Пользовательские настройки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Login and Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="login">Логин</Label>
                  <Input
                    id="login"
                    value={asteriskSettings.login}
                    onChange={(e) => setAsteriskSettings(prev => ({ ...prev, login: e.target.value }))}
                    className="mt-2"
                    placeholder="Логин"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showSipPassword ? "text" : "password"}
                      value={asteriskSettings.password}
                      onChange={(e) => setAsteriskSettings(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10"
                      placeholder="Пароль"
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

              {/* Server Address and Port */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="server-address">
                    <span className="text-red-500">*</span> Адрес сервера
                  </Label>
                  <Input
                    id="server-address"
                    value={asteriskSettings.server}
                    onChange={(e) => setAsteriskSettings(prev => ({ ...prev, server: e.target.value }))}
                    className="mt-2"
                    placeholder="IP адрес или домен"
                  />
                </div>
                <div>
                  <Label htmlFor="port">
                    <span className="text-red-500">*</span> Порт
                  </Label>
                  <Input
                    id="port"
                    value={asteriskSettings.port}
                    onChange={(e) => setAsteriskSettings(prev => ({ ...prev, port: e.target.value }))}
                    className="mt-2"
                    placeholder="5060"
                  />
                </div>
              </div>

              {/* Call Transfer */}
              <div>
                <Label htmlFor="call-transfer">Перевод звонка</Label>
                <Select 
                  value={asteriskSettings.callTransfer}
                  onValueChange={(value) => setAsteriskSettings(prev => ({ ...prev, callTransfer: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выберите тип перевода" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Стандартный</SelectItem>
                    <SelectItem value="direct">Прямой</SelectItem>
                    <SelectItem value="supervised">Контролируемый</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SIP Channels */}
              <div>
                <Label htmlFor="sip-channels">Количество SIP-каналов</Label>
                <Input
                  id="sip-channels"
                  type="number"
                  value={asteriskSettings.sipChannels}
                  onChange={(e) => setAsteriskSettings(prev => ({ ...prev, sipChannels: e.target.value }))}
                  className="mt-2"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Максимальное количество одновременных звонков
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Проверить подключение
                </Button>
                <Button>
                  Сохранить настройки
                </Button>
              </div>
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
    </div>
  )
}