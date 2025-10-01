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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Settings,
  Plus,
  Trash2,
  Edit2,
  Server,
  TestTube,
  Save,
  MoreVertical,
  PhoneCall,
  PhoneOff
} from 'lucide-react'
import { toast } from 'sonner'

interface AsteriskConnection {
  id: string
  name: string
  type: 'SIP' | 'AMI'
  host: string
  port: string
  login: string
  secret: string
  status: 'connected' | 'disconnected' | 'error' | 'connecting'
  numbers: string[]
  selectedNumbers: string[]
  lastSync?: string
  createdAt: string
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
  
  // Asterisk connections state
  const [connections, setConnections] = useState<AsteriskConnection[]>([
    {
      id: '1',
      name: 'Основной Asterisk',
      type: 'AMI',
      host: '192.168.1.100',
      port: '5038',
      login: 'admin',
      secret: '********',
      status: 'connected',
      numbers: ['+7 (495) 123-45-67', '+7 (495) 123-45-68', '+7 (495) 123-45-69'],
      selectedNumbers: ['+7 (495) 123-45-67', '+7 (495) 123-45-68'],
      lastSync: '2024-10-30 10:15:00',
      createdAt: '2024-01-15 09:00:00'
    },
    {
      id: '2',
      name: 'Резервный сервер',
      type: 'SIP',
      host: '192.168.1.101',
      port: '5060',
      login: 'sip_user',
      secret: '********',
      status: 'disconnected',
      numbers: [],
      selectedNumbers: [],
      createdAt: '2024-02-20 14:30:00'
    }
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isTestingConnectionAsterisk, setIsTestingConnectionAsterisk] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [editingConnection, setEditingConnection] = useState<AsteriskConnection | null>(null)
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([])
  const [selectedNumbersTemp, setSelectedNumbersTemp] = useState<string[]>([])
  
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'AMI' as 'SIP' | 'AMI',
    host: '',
    port: '',
    login: '',
    secret: ''
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

  // Asterisk functions
  const handleTestConnectionAsterisk = async () => {
    setIsTestingConnectionAsterisk(true)
    // Имитация тестирования подключения
    setTimeout(() => {
      setIsTestingConnectionAsterisk(false)
      // Имитация получения списка номеров
      const mockNumbers = [
        '+7 (495) 555-01-01',
        '+7 (495) 555-01-02',
        '+7 (495) 555-01-03',
        '+7 (495) 555-01-04',
        '+7 (495) 555-01-05',
        '+7 (499) 777-88-99',
        '+7 (499) 777-88-00',
        '101',
        '102',
        '103'
      ]
      setAvailableNumbers(mockNumbers)
      toast.success('Подключение установлено успешно')
    }, 2000)
  }

  const handleAddConnection = () => {
    const connection: AsteriskConnection = {
      id: Date.now().toString(),
      ...newConnection,
      status: 'connecting',
      numbers: availableNumbers,
      selectedNumbers: selectedNumbersTemp,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    
    setConnections([...connections, connection])
    
    // Имитация подключения
    setTimeout(() => {
      setConnections(prev => prev.map(c => 
        c.id === connection.id 
          ? { ...c, status: 'connected', lastSync: new Date().toISOString().slice(0, 19).replace('T', ' ') }
          : c
      ))
    }, 1500)
    
    setIsAddDialogOpen(false)
    setNewConnection({
      name: '',
      type: 'AMI',
      host: '',
      port: '',
      login: '',
      secret: ''
    })
    setAvailableNumbers([])
    setSelectedNumbersTemp([])
    toast.success('Подключение добавлено')
  }

  const handleEditConnection = () => {
    if (!editingConnection) return
    
    setConnections(connections.map(c => 
      c.id === editingConnection.id ? editingConnection : c
    ))
    setIsEditDialogOpen(false)
    setEditingConnection(null)
    toast.success('Подключение обновлено')
  }

  const handleDeleteConnection = (id: string) => {
    setConnections(connections.filter(c => c.id !== id))
    toast.success('Подключение удалено')
  }

  const handleReconnect = (id: string) => {
    setConnections(connections.map(c => 
      c.id === id ? { ...c, status: 'connecting' } : c
    ))
    
    setTimeout(() => {
      setConnections(prev => prev.map(c => 
        c.id === id 
          ? { ...c, status: 'connected', lastSync: new Date().toISOString().slice(0, 19).replace('T', ' ') }
          : c
      ))
      toast.success('Подключение восстановлено')
    }, 1500)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Подключено
          </Badge>
        )
      case 'disconnected':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Отключено
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Ошибка
          </Badge>
        )
      case 'connecting':
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Подключение...
          </Badge>
        )
      default:
        return null
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Asterisk / Телефония</h2>
              <p className="text-gray-600">Управление SIP и AMI подключениями к серверам Asterisk</p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить подключение
            </Button>
          </div>

          {/* Статистика по номерам */}
          {connections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Активные подключения</p>
                      <p className="text-2xl font-bold mt-1">
                        {connections.filter(c => c.status === 'connected').length}
                      </p>
                    </div>
                    <Server className="h-8 w-8 text-green-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Всего номеров</p>
                      <p className="text-2xl font-bold mt-1">
                        {connections.reduce((acc, c) => acc + c.numbers.length, 0)}
                      </p>
                    </div>
                    <Phone className="h-8 w-8 text-blue-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Выбрано для обзвона</p>
                      <p className="text-2xl font-bold mt-1">
                        {connections.reduce((acc, c) => acc + c.selectedNumbers.length, 0)}
                      </p>
                    </div>
                    <PhoneCall className="h-8 w-8 text-purple-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Не выбрано</p>
                      <p className="text-2xl font-bold mt-1">
                        {connections.reduce((acc, c) => acc + (c.numbers.length - c.selectedNumbers.length), 0)}
                      </p>
                    </div>
                    <PhoneOff className="h-8 w-8 text-gray-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}


          {/* Список всех подключенных номеров */}
          {connections.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет подключений</h3>
                <p className="text-gray-600 mb-6">
                  Добавьте подключение к серверу Asterisk для начала работы
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить подключение
                </Button>
              </div>
            </Card>
          ) : connections.some(c => c.numbers.length > 0) ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Подключенные номера</CardTitle>
                    <CardDescription>
                      Все доступные номера из активных подключений
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-sm">
                      Всего номеров: {connections.reduce((acc, c) => acc + c.numbers.length, 0)}
                    </Badge>
                    <Badge className="text-sm bg-green-100 text-green-700">
                      Выбрано для обзвона: {connections.reduce((acc, c) => acc + c.selectedNumbers.length, 0)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connections.filter(c => c.numbers.length > 0).map((connection) => (
                    <div key={connection.id} className="space-y-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {connection.name}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {connection.type} • {connection.host}:{connection.port}
                        </span>
                        {connection.status === 'connected' && (
                          <Badge className="text-xs bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Активно
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {connection.numbers.map((number, index) => {
                          const isSelected = connection.selectedNumbers.includes(number)
                          return (
                            <div
                              key={index}
                              className={`
                                flex items-center space-x-2 p-2 rounded-lg border cursor-pointer
                                transition-all hover:shadow-sm
                                ${isSelected 
                                  ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                                }
                              `}
                              onClick={() => {
                                const updatedConnection = {...connection}
                                if (isSelected) {
                                  updatedConnection.selectedNumbers = updatedConnection.selectedNumbers.filter(n => n !== number)
                                } else {
                                  updatedConnection.selectedNumbers = [...updatedConnection.selectedNumbers, number]
                                }
                                setConnections(connections.map(c => 
                                  c.id === connection.id ? updatedConnection : c
                                ))
                                toast.success(isSelected 
                                  ? `Номер ${number} убран из обзвона` 
                                  : `Номер ${number} добавлен в обзвон`
                                )
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                className="pointer-events-none"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm font-medium">{number}</span>
                                </div>
                                {isSelected && (
                                  <span className="text-xs text-blue-600">Для обзвона</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Кнопки управления */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Нажмите на номер, чтобы добавить или убрать его из списка для обзвона
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConnections(connections.map(c => ({
                          ...c,
                          selectedNumbers: []
                        })))
                        toast.success('Все номера убраны из обзвона')
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Снять выделение
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConnections(connections.map(c => ({
                          ...c,
                          selectedNumbers: [...c.numbers]
                        })))
                        toast.success('Все номера добавлены в обзвон')
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Выбрать все
                    </Button>
                    <Button
                      size="sm"
                      disabled={!connections.some(c => c.selectedNumbers.length > 0)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить выбор
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
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

      {/* Диалог добавления подключения Asterisk */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Добавить подключение Asterisk</DialogTitle>
            <DialogDescription>
              Настройте параметры подключения к серверу Asterisk через SIP или AMI
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Название подключения</Label>
                <Input
                  id="name"
                  placeholder="Например: Основной сервер"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="type">Тип подключения</Label>
                <Select 
                  value={newConnection.type} 
                  onValueChange={(value: 'SIP' | 'AMI') => 
                    setNewConnection({...newConnection, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AMI">AMI (Asterisk Manager Interface)</SelectItem>
                    <SelectItem value="SIP">SIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="host">Host / IP адрес</Label>
                <Input
                  id="host"
                  placeholder="192.168.1.100"
                  value={newConnection.host}
                  onChange={(e) => setNewConnection({...newConnection, host: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder={newConnection.type === 'AMI' ? '5038' : '5060'}
                  value={newConnection.port}
                  onChange={(e) => setNewConnection({...newConnection, port: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="login">Login / Username</Label>
                <Input
                  id="login"
                  placeholder="admin"
                  value={newConnection.login}
                  onChange={(e) => setNewConnection({...newConnection, login: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="secret">Secret / Password</Label>
                <div className="relative">
                  <Input
                    id="secret"
                    type={showSecret ? "text" : "password"}
                    placeholder="••••••••"
                    value={newConnection.secret}
                    onChange={(e) => setNewConnection({...newConnection, secret: e.target.value})}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Кнопка тестирования */}
            <div className="flex justify-center py-2">
              <Button 
                type="button"
                variant="outline"
                onClick={handleTestConnectionAsterisk}
                disabled={!newConnection.host || !newConnection.login || !newConnection.secret || isTestingConnectionAsterisk}
              >
                {isTestingConnectionAsterisk ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Подключение...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    Подключиться
                  </>
                )}
              </Button>
            </div>

            {/* Список доступных номеров */}
            {availableNumbers.length > 0 && (
              <div className="space-y-2">
                <Label>Доступные номера (выберите для использования в кампаниях)</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {availableNumbers.map((number, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`number-${index}`}
                        checked={selectedNumbersTemp.includes(number)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNumbersTemp([...selectedNumbersTemp, number])
                          } else {
                            setSelectedNumbersTemp(selectedNumbersTemp.filter(n => n !== number))
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`number-${index}`}
                        className="font-normal cursor-pointer flex items-center space-x-2"
                      >
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{number}</span>
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Выбрано номеров: {selectedNumbersTemp.length} из {availableNumbers.length}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleAddConnection}
              disabled={!newConnection.name || !newConnection.host || availableNumbers.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить подключение
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования подключения */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать подключение</DialogTitle>
            <DialogDescription>
              Измените параметры подключения к серверу Asterisk
            </DialogDescription>
          </DialogHeader>
          
          {editingConnection && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Название подключения</Label>
                  <Input
                    id="edit-name"
                    value={editingConnection.name}
                    onChange={(e) => setEditingConnection({...editingConnection, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Тип подключения</Label>
                  <Select 
                    value={editingConnection.type} 
                    onValueChange={(value: 'SIP' | 'AMI') => 
                      setEditingConnection({...editingConnection, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AMI">AMI (Asterisk Manager Interface)</SelectItem>
                      <SelectItem value="SIP">SIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-host">Host / IP адрес</Label>
                  <Input
                    id="edit-host"
                    value={editingConnection.host}
                    onChange={(e) => setEditingConnection({...editingConnection, host: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-port">Port</Label>
                  <Input
                    id="edit-port"
                    value={editingConnection.port}
                    onChange={(e) => setEditingConnection({...editingConnection, port: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-login">Login / Username</Label>
                  <Input
                    id="edit-login"
                    value={editingConnection.login}
                    onChange={(e) => setEditingConnection({...editingConnection, login: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-secret">Secret / Password</Label>
                  <div className="relative">
                    <Input
                      id="edit-secret"
                      type={showSecret ? "text" : "password"}
                      value={editingConnection.secret}
                      onChange={(e) => setEditingConnection({...editingConnection, secret: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Список номеров для редактирования */}
              {editingConnection.numbers.length > 0 && (
                <div className="space-y-2">
                  <Label>Доступные номера</Label>
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                    {editingConnection.numbers.map((number, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-number-${index}`}
                          checked={editingConnection.selectedNumbers.includes(number)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditingConnection({
                                ...editingConnection,
                                selectedNumbers: [...editingConnection.selectedNumbers, number]
                              })
                            } else {
                              setEditingConnection({
                                ...editingConnection,
                                selectedNumbers: editingConnection.selectedNumbers.filter(n => n !== number)
                              })
                            }
                          }}
                        />
                        <Label 
                          htmlFor={`edit-number-${index}`}
                          className="font-normal cursor-pointer flex items-center space-x-2"
                        >
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{number}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Выбрано номеров: {editingConnection.selectedNumbers.length} из {editingConnection.numbers.length}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditConnection}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}