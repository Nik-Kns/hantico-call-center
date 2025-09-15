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
  UserCheck,
  Clock,
  Filter,
  Search,
  Calendar,
  History
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

      {/* Negative Events and Error Timeline */}
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Негативные события и ошибки</CardTitle>
                  <CardDescription>
                    Мониторинг ошибок, ретраев и критических событий с таймлайном
                  </CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Последние 24ч
                </Button>
                <Button variant="outline" size="sm">
                  Очистить все
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Критичные</p>
                    <p className="text-2xl font-bold text-red-700">3</p>
                  </div>
                  <XCircle className="h-6 w-6 text-red-600 opacity-60" />
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Предупреждения</p>
                    <p className="text-2xl font-bold text-yellow-700">7</p>
                  </div>
                  <AlertCircle className="h-6 w-6 text-yellow-600 opacity-60" />
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Ретраи</p>
                    <p className="text-2xl font-bold text-orange-700">12</p>
                  </div>
                  <RefreshCw className="h-6 w-6 text-orange-600 opacity-60" />
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Всего за 24ч</p>
                    <p className="text-2xl font-bold text-blue-700">22</p>
                  </div>
                  <Activity className="h-6 w-6 text-blue-600 opacity-60" />
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Фильтры:</span>
              </div>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="critical">Критичные</SelectItem>
                  <SelectItem value="warning">Предупреждения</SelectItem>
                  <SelectItem value="retry">Ретраи</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все системы</SelectItem>
                  <SelectItem value="asterisk">Asterisk</SelectItem>
                  <SelectItem value="erp">ERP API</SelectItem>
                  <SelectItem value="webhook">Webhooks</SelectItem>
                  <SelectItem value="sip">SIP</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по описанию..."
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center">
                <History className="h-4 w-4 mr-2" />
                Таймлайн событий
              </h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Events */}
                <div className="space-y-6">
                  {/* Critical Error */}
                  <div className="relative flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center relative z-10">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1 bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-red-900">Ошибка подключения к Asterisk</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-red-100 text-red-800">Критично</Badge>
                          <span className="text-xs text-red-600">5 мин назад</span>
                        </div>
                      </div>
                      <p className="text-sm text-red-700 mb-3">
                        Не удается установить соединение с pbx.yourcompany.com:5060
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-red-600">
                        <span>Код ошибки: CONNECTION_TIMEOUT</span>
                        <span>Попытка: 3/5</span>
                        <span>Следующая попытка: 15:45</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Warning */}
                  <div className="relative flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center relative z-10">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-yellow-900">Превышен лимит API запросов</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-yellow-100 text-yellow-800">Предупреждение</Badge>
                          <span className="text-xs text-yellow-600">15 мин назад</span>
                        </div>
                      </div>
                      <p className="text-sm text-yellow-700 mb-3">
                        ERP API вернул ошибку 429: Too Many Requests. Текущий RPS: 150/100
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-yellow-600">
                        <span>Endpoint: /api/hantico/results</span>
                        <span>Отклонено запросов: 23</span>
                        <span>Сброс лимита: 16:00</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Retry Event */}
                  <div className="relative flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center relative z-10">
                      <RefreshCw className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1 bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-orange-900">Недостаточно SIP-каналов</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-orange-100 text-orange-800">Ретрай</Badge>
                          <span className="text-xs text-orange-600">1 час назад</span>
                        </div>
                      </div>
                      <p className="text-sm text-orange-700 mb-3">
                        Все 10 каналов заняты. 45 звонков поставлено в очередь
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-orange-600">
                        <span>Занято каналов: 10/10</span>
                        <span>Очередь: 45 звонков</span>
                        <span>Прогноз освобождения: 16:30</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resolved Event */}
                  <div className="relative flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center relative z-10">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-900">Проблема с webhook&apos;ами устранена</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800">Решено</Badge>
                          <span className="text-xs text-green-600">2 часа назад</span>
                        </div>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Восстановлено соединение с crm.company.ru. Обработано 156 отложенных событий
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-green-600">
                        <span>Время простоя: 23 мин</span>
                        <span>Обработано событий: 156</span>
                        <span>Последний response: 200 OK</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}