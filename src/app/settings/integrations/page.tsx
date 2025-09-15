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
  Activity,
  Copy,
  Eye,
  EyeOff,
  Server,
  UserCheck
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

// Mock данные для телефонных номеров
const mockPhoneNumbers = [
  { id: '1', number: '+7 (495) 123-45-67', name: 'Основной московский', status: 'active' },
  { id: '2', number: '+7 (812) 987-65-43', name: 'Основной СПб', status: 'active' },
  { id: '3', number: '+7 (800) 555-35-35', name: 'Бесплатный федеральный', status: 'active' },
  { id: '4', number: '+7 (495) 999-88-77', name: 'Тестовый номер', status: 'test' }
]

export default function IntegrationsPage() {
  const router = useRouter()
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSipPassword, setShowSipPassword] = useState(false)
  const [apiKey, setApiKey] = useState('**********************')
  const [selectedTestNumber, setSelectedTestNumber] = useState('4')
  const [selectedNumbers, setSelectedNumbers] = useState(['1', '2', '3'])
  
  // ERP API настройки
  const [erpSettings, setErpSettings] = useState({
    apiKey: apiKey,
    endpoints: {
      sendNumbers: 'https://api.yourcompany.com/hantico/numbers',
      getResults: 'https://api.yourcompany.com/hantico/results'
    }
  })
  
  // Asterisk настройки
  const [asteriskSettings, setAsteriskSettings] = useState({
    server: 'pbx.yourcompany.com',
    port: '5060',
    username: 'hantico_agent',
    password: 'SecurePass123!',
    sipChannels: '10'
  })

  const handleGenerateApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 38)
    setApiKey(newKey)
    setErpSettings(prev => ({ ...prev, apiKey: newKey }))
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
  }

  const toggleNumberSelection = (numberId: string) => {
    setSelectedNumbers(prev => 
      prev.includes(numberId) 
        ? prev.filter(id => id !== numberId)
        : [...prev, numberId]
    )
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
        <TabsContent value="erp">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>ERP API</CardTitle>
                  <CardDescription>
                    Интеграция с вашей ERP системой для обмена данными
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key Section */}
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
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button onClick={handleGenerateApiKey}>
                      <Key className="h-4 w-4 mr-2" />
                      Сгенерировать новый
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Используйте этот ключ для аутентификации запросов к Hantico API
                  </p>
                </div>

                {/* Endpoints */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Эндпоинты</h3>
                  
                  <div>
                    <Label htmlFor="endpoint-numbers">Передать номера</Label>
                    <Input
                      id="endpoint-numbers"
                      value={erpSettings.endpoints.sendNumbers}
                      onChange={(e) => setErpSettings(prev => ({
                        ...prev,
                        endpoints: { ...prev.endpoints, sendNumbers: e.target.value }
                      }))}
                      className="mt-2 font-mono text-sm"
                      placeholder="https://api.yourcompany.com/hantico/numbers"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      POST эндпоинт для получения списка номеров для обзвона
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="endpoint-results">Забрать результаты</Label>
                    <Input
                      id="endpoint-results"
                      value={erpSettings.endpoints.getResults}
                      onChange={(e) => setErpSettings(prev => ({
                        ...prev,
                        endpoints: { ...prev.endpoints, getResults: e.target.value }
                      }))}
                      className="mt-2 font-mono text-sm"
                      placeholder="https://api.yourcompany.com/hantico/results"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      GET эндпоинт для передачи результатов обзвона обратно в ERP
                    </p>
                  </div>
                </div>

                {/* API Documentation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Пример запроса</h4>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`curl -X POST ${erpSettings.endpoints.sendNumbers}
  -H "Authorization: Bearer ${apiKey}"
  -H "Content-Type: application/json"
  -d '{
    "campaign_id": "123",
    "numbers": ["+7 (999) 123-45-67"],
    "callback_url": "${erpSettings.endpoints.getResults}"
  }'`}
                  </pre>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Тестировать подключение
                  </Button>
                  <Button>
                    Сохранить настройки
                  </Button>
                </div>
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
              {/* Server Settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="asterisk-server">Адрес сервера</Label>
                    <Input
                      id="asterisk-server"
                      value={asteriskSettings.server}
                      onChange={(e) => setAsteriskSettings(prev => ({ ...prev, server: e.target.value }))}
                      className="mt-2"
                      placeholder="pbx.yourcompany.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="asterisk-port">Порт</Label>
                    <Input
                      id="asterisk-port"
                      value={asteriskSettings.port}
                      onChange={(e) => setAsteriskSettings(prev => ({ ...prev, port: e.target.value }))}
                      className="mt-2"
                      placeholder="5060"
                    />
                  </div>
                </div>

                {/* Credentials */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Учетные данные</h3>
                  
                  <div>
                    <Label htmlFor="sip-username">SIP пользователь</Label>
                    <Input
                      id="sip-username"
                      value={asteriskSettings.username}
                      onChange={(e) => setAsteriskSettings(prev => ({ ...prev, username: e.target.value }))}
                      className="mt-2"
                      placeholder="hantico_agent"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sip-password">SIP пароль</Label>
                    <div className="relative mt-2">
                      <Input
                        id="sip-password"
                        type={showSipPassword ? "text" : "password"}
                        value={asteriskSettings.password}
                        onChange={(e) => setAsteriskSettings(prev => ({ ...prev, password: e.target.value }))}
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
                </div>

                {/* Phone Numbers */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Доступные номера</h3>
                  
                  <div className="space-y-2">
                    {mockPhoneNumbers.map((phone) => (
                      <div
                        key={phone.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedNumbers.includes(phone.id)}
                            onChange={() => toggleNumberSelection(phone.id)}
                            disabled={phone.status === 'test'}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <div>
                            <p className="font-medium text-sm">{phone.number}</p>
                            <p className="text-xs text-gray-500">{phone.name}</p>
                          </div>
                        </div>
                        {phone.status === 'test' && (
                          <Badge className="bg-yellow-100 text-yellow-800">Тестовый</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Number */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium">Тестовый номер по умолчанию</h3>
                  
                  <Select value={selectedTestNumber} onValueChange={setSelectedTestNumber}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPhoneNumbers
                        .filter(phone => phone.status === 'test')
                        .map((phone) => (
                          <SelectItem key={phone.id} value={phone.id}>
                            {phone.number} - {phone.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Этот номер будет использоваться для тестовых звонков при настройке агентов
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Проверить подключение
                  </Button>
                  <Button>
                    Сохранить настройки
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notifications Block */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>
                  Последние ошибки и критические события
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Очистить все
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Ошибка подключения к Asterisk
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Не удается установить соединение с сервером pbx.yourcompany.com:5060
                </p>
                <p className="text-xs text-red-600 mt-2">5 минут назад</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Превышен лимит API запросов
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  ERP API вернул ошибку 429: Too Many Requests
                </p>
                <p className="text-xs text-yellow-600 mt-2">15 минут назад</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900">
                  Недостаточно SIP-каналов
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Все 10 каналов заняты, новые звонки поставлены в очередь
                </p>
                <p className="text-xs text-orange-600 mt-2">1 час назад</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}