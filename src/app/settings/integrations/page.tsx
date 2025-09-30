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
  Shield,
  Settings
} from 'lucide-react'

export default function IntegrationsPage() {
  const router = useRouter()
  const [showApiKey, setShowApiKey] = useState(false)
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

      <Tabs defaultValue="kafka" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="kafka">Kafka</TabsTrigger>
          <TabsTrigger value="erp">ERP API</TabsTrigger>
          <TabsTrigger value="asterisk">Asterisk</TabsTrigger>
        </TabsList>

        {/* Kafka Tab */}
        <TabsContent value="kafka" className="space-y-6">
          {/* Kafka Connection */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Kafka интеграция</CardTitle>
                  <CardDescription>
                    Асинхронный обмен данными через Apache Kafka
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Kafka Topics */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Топики Kafka</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">tasks-topic</Label>
                        <Badge className="bg-blue-100 text-blue-800">Consumer</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Топик для получения задач на обзвон из вашей ERP системы
                      </p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "erp_lead_id": "UUID_LEAD",
  "phone_number": "+79931234567",
  "campaign_id": "CMP-ABCDEF12345",
  "metadata": {
    "client_name": "Иван",
    "product_interest": "Тариф Pro"
  }
}`}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">results-topic</Label>
                        <Badge className="bg-green-100 text-green-800">Producer</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Топик для отправки результатов звонков в вашу ERP систему
                      </p>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "erp_lead_id": "UUID_LEAD",
  "call_outcome": "SUCCESS",
  "recording_url": "https://storage.hantico.ai/rec/...",
  "transcript": "Полная расшифровка разговора...",
  "call_duration": 180,
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call Outcomes */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-3">Возможные статусы звонков</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">SUCCESS - Успешный звонок</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">REFUSAL - Отказ клиента</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">VOICEMAIL - Автоответчик</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">CALL_LATER - Перезвонить</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">NO_ANSWER - Нет ответа</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">BUSY - Занято</span>
                  </div>
                </div>
              </div>

              {/* Integration Flow */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-3">Процесс интеграции</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">1</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">ERP публикует задачу</p>
                      <p className="text-xs text-gray-600">Задача с номером телефона и campaign_id отправляется в tasks-topic</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">2</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Hantico Dialer обрабатывает задачу</p>
                      <p className="text-xs text-gray-600">Получает настройки кампании и инициирует звонок</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">3</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Проведение звонка</p>
                      <p className="text-xs text-gray-600">AI-агент общается с клиентом по заданному сценарию</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">4</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Публикация результата</p>
                      <p className="text-xs text-gray-600">Результат звонка отправляется в results-topic для обработки ERP</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kafka Configuration Example */}
          <Card>
            <CardHeader>
              <CardTitle>Примеры кода для интеграции</CardTitle>
              <CardDescription>
                Готовые примеры для быстрого старта с Kafka
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="producer" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="producer">Отправка задач (Producer)</TabsTrigger>
                  <TabsTrigger value="consumer">Получение результатов (Consumer)</TabsTrigger>
                </TabsList>
                <TabsContent value="producer" className="mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Python пример (kafka-python)</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const code = `from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers=['kafka.hantico.ai:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Отправка задачи на обзвон
task = {
    "erp_lead_id": "LEAD-12345",
    "phone_number": "+79991234567",
    "campaign_id": "CMP-ABCDEF12345",
    "metadata": {
        "client_name": "Иван Петров",
        "product_interest": "Тариф Pro"
    }
}

producer.send('tasks-topic', value=task)
producer.flush()`
                          navigator.clipboard.writeText(code)
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Копировать
                      </Button>
                    </div>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers=['kafka.hantico.ai:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Отправка задачи на обзвон
task = {
    "erp_lead_id": "LEAD-12345",
    "phone_number": "+79991234567",
    "campaign_id": "CMP-ABCDEF12345",
    "metadata": {
        "client_name": "Иван Петров",
        "product_interest": "Тариф Pro"
    }
}

producer.send('tasks-topic', value=task)
producer.flush()`}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="consumer" className="mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Python пример (kafka-python)</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const code = `from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    'results-topic',
    bootstrap_servers=['kafka.hantico.ai:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    group_id='erp-consumer-group',
    auto_offset_reset='earliest'
)

# Получение результатов звонков
for message in consumer:
    result = message.value
    
    lead_id = result['erp_lead_id']
    outcome = result['call_outcome']
    
    if outcome == 'SUCCESS':
        # Обработка успешного звонка
        print(f"Lead {lead_id}: Успешный контакт")
        # Запуск SMS кампании или другие действия
    elif outcome == 'CALL_LATER':
        # Планирование повторного звонка
        print(f"Lead {lead_id}: Требуется перезвонить")
    else:
        # Обработка других статусов
        print(f"Lead {lead_id}: Статус {outcome}")`
                          navigator.clipboard.writeText(code)
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Копировать
                      </Button>
                    </div>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`from kafka import KafkaConsumer
import json

consumer = KafkaConsumer(
    'results-topic',
    bootstrap_servers=['kafka.hantico.ai:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    group_id='erp-consumer-group',
    auto_offset_reset='earliest'
)

# Получение результатов звонков
for message in consumer:
    result = message.value
    
    lead_id = result['erp_lead_id']
    outcome = result['call_outcome']
    
    if outcome == 'SUCCESS':
        # Обработка успешного звонка
        print(f"Lead {lead_id}: Успешный контакт")
        # Запуск SMS кампании или другие действия
    elif outcome == 'CALL_LATER':
        # Планирование повторного звонка
        print(f"Lead {lead_id}: Требуется перезвонить")
    else:
        # Обработка других статусов
        print(f"Lead {lead_id}: Статус {outcome}")`}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

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
          {/* Asterisk Integration Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Asterisk / Телефония</CardTitle>
                    <CardDescription>
                      Управление SIP/AMI подключениями к серверам Asterisk
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => router.push('/settings/integrations/asterisk')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Настроить подключения
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Возможности интеграции:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Мульти-коннекты:</strong> поддержка нескольких SIP/AMI подключений одновременно</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Автоматическое получение номеров:</strong> подключение к АТС и загрузка списка доступных номеров</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Управление номерами:</strong> выбор конкретных номеров для использования в кампаниях</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>Поддержка протоколов:</strong> SIP и AMI (Asterisk Manager Interface)</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-900">Настройка подключений</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    На странице настройки вы сможете:
                  </p>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Добавить несколько подключений к разным серверам Asterisk</li>
                    <li>• Настроить параметры подключения (Host, Port, Login, Secret)</li>
                    <li>• Получить список доступных номеров с каждого сервера</li>
                    <li>• Выбрать номера для использования в кампаниях обзвона</li>
                  </ul>
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button 
                    onClick={() => router.push('/settings/integrations/asterisk')}
                    className="w-full"
                    size="lg"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Перейти к настройке подключений Asterisk
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
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