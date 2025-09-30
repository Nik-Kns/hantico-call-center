'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  User,
  Mail,
  Phone as PhoneIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  UserCheck
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'executor'
  status: 'active' | 'inactive'
  createdAt: string
  lastActive: string
}

export default function UsersPage() {
  const router = useRouter()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Моковые данные пользователей
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      name: 'Иван Петров',
      email: 'ivan@company.ru',
      phone: '+7 (999) 123-45-67',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-15',
      lastActive: '2024-12-20 14:30'
    },
    {
      id: '2',
      name: 'Мария Сидорова',
      email: 'maria@company.ru',
      phone: '+7 (999) 987-65-43',
      role: 'executor',
      status: 'active',
      createdAt: '2024-02-20',
      lastActive: '2024-12-20 10:15'
    },
    {
      id: '3',
      name: 'Алексей Козлов',
      email: 'alexey@company.ru',
      phone: '+7 (999) 555-44-33',
      role: 'executor',
      status: 'inactive',
      createdAt: '2024-03-10',
      lastActive: '2024-12-15 18:20'
    },
  ])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'executor' as 'admin' | 'executor',
    password: ''
  })

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'executor',
      password: ''
    })
    setShowAddDialog(true)
  }

  const handleEditUser = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: ''
    })
    setShowAddDialog(true)
  }

  const handleSaveUser = () => {
    if (editingUser) {
      // Редактирование существующего пользователя
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, password: undefined }
          : u
      ))
    } else {
      // Добавление нового пользователя
      const newUser: UserData = {
        id: String(users.length + 1),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        lastActive: 'Никогда'
      }
      setUsers(prev => [...prev, newUser])
    }
    setShowAddDialog(false)
  }

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => 
      u.id === id 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ))
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const roleLabels = {
    admin: 'Администратор',
    executor: 'Исполнитель'
  }

  const roleDescriptions = {
    admin: 'Полный доступ ко всем функциям системы',
    executor: 'Доступ ко всем функциям, кроме настроек'
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
            <h1 className="text-3xl font-bold mb-2">Управление пользователями</h1>
            <p className="text-gray-600">
              Настройка доступа и ролей пользователей системы
            </p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить пользователя
          </Button>
        </div>
      </div>

      {/* Статистика ролей */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <UserCheck className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {users.filter(u => u.status === 'active').length} активных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Администраторы</CardTitle>
              <Shield className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
            <p className="text-xs text-gray-600 mt-1">Полный доступ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Исполнители</CardTitle>
              <User className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'executor').length}</div>
            <p className="text-xs text-gray-600 mt-1">Ограниченный доступ</p>
          </CardContent>
        </Card>
      </div>

      {/* Описание ролей */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Роли и права доступа</CardTitle>
          <CardDescription>
            Описание прав доступа для каждой роли
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Администратор</h4>
                <p className="text-sm text-gray-600 mb-2">Полный доступ ко всем функциям системы</p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Управление кампаниями и агентами
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Доступ к настройкам системы
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Управление пользователями
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Просмотр полной аналитики
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Исполнитель</h4>
                <p className="text-sm text-gray-600 mb-2">Работа с кампаниями без доступа к настройкам</p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Создание и управление кампаниями
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Работа с агентами
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Просмотр статистики кампаний
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <XCircle className="h-3 w-3 text-red-600 mr-2" />
                    Настройки системы недоступны
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список пользователей */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Список пользователей</CardTitle>
            <Input
              placeholder="Поиск по имени или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Последняя активность</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        Добавлен {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        {roleLabels[user.role]}
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">
                        <User className="h-3 w-3 mr-1" />
                        {roleLabels[user.role]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.status === 'active' ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Активен
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Неактивен
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.lastActive}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                          {user.status === 'active' ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Деактивировать
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Активировать
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Диалог добавления/редактирования пользователя */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Редактирование пользователя' : 'Новый пользователь'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Измените данные пользователя' 
                : 'Заполните данные для создания нового пользователя'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Имя пользователя</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Иван Иванов"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@company.ru"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Роль</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: 'admin' | 'executor') => 
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executor">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Исполнитель
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Администратор
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                {roleDescriptions[formData.role]}
              </p>
            </div>
            
            {!editingUser && (
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Минимум 8 символов
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? 'Сохранить изменения' : 'Добавить пользователя'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}