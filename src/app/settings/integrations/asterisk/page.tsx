'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Server,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  TestTube,
  Save,
  MoreVertical,
  Copy,
  PhoneCall,
  PhoneOff
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from '@/components/ui/separator'
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

export default function AsteriskIntegrationPage() {
  const router = useRouter()
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
  const [isTestingConnection, setIsTestingConnection] = useState(false)
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

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    // Имитация тестирования подключения
    setTimeout(() => {
      setIsTestingConnection(false)
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/settings/integrations')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к интеграциям
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Asterisk / Телефония</h1>
            <p className="text-gray-600">
              Управление SIP и AMI подключениями к серверам Asterisk
            </p>
          </div>
        </div>
      </div>

      {/* Список подключений или пустое состояние */}
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
      ) : (
        <>
          <div className="flex justify-end mb-6">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить подключение
            </Button>
          </div>

          <div className="grid gap-4">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{connection.name}</CardTitle>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge variant="outline">{connection.type}</Badge>
                          <span className="text-sm text-gray-500">
                            {connection.host}:{connection.port}
                          </span>
                          {getStatusBadge(connection.status)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingConnection(connection)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        {connection.status === 'disconnected' && (
                          <DropdownMenuItem onClick={() => handleReconnect(connection.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Переподключить
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Дублировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteConnection(connection.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Информация о подключении */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Логин:</span>
                        <p className="font-medium">{connection.login}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Последняя синхронизация:</span>
                        <p className="font-medium">
                          {connection.lastSync || 'Не выполнялась'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Создано:</span>
                        <p className="font-medium">{connection.createdAt}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Доступные номера */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">Доступные номера</h4>
                        {connection.selectedNumbers.length > 0 && (
                          <Badge variant="secondary">
                            Выбрано: {connection.selectedNumbers.length} из {connection.numbers.length}
                          </Badge>
                        )}
                      </div>
                      
                      {connection.numbers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {connection.numbers.map((number, index) => {
                            const isSelected = connection.selectedNumbers.includes(number)
                            return (
                              <Badge 
                                key={index} 
                                variant={isSelected ? "default" : "outline"}
                                className="cursor-pointer"
                              >
                                {isSelected && <PhoneCall className="h-3 w-3 mr-1" />}
                                {number}
                              </Badge>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Номера не загружены. Переподключитесь для получения списка.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Диалог добавления подключения */}
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
                onClick={handleTestConnection}
                disabled={!newConnection.host || !newConnection.login || !newConnection.secret || isTestingConnection}
              >
                {isTestingConnection ? (
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