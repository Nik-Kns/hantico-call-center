'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Mail,
  Phone,
  Shield,
  Settings,
  Key,
  Building,
  Camera,
  Save,
  ArrowLeft,
  CheckCircle,
  Smartphone,
  Monitor,
  LogOut,
  AlertCircle
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  
  const [profile, setProfile] = useState({
    firstName: 'Иван',
    lastName: 'Иванов',
    email: 'user@example.com',
    phone: '+7 (999) 123-45-67',
    position: 'Администратор системы',
    department: 'IT отдел'
  })

  const handleSave = () => {
    setIsEditing(false)
    // Здесь будет логика сохранения
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/companies')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Профиль пользователя</h1>
            <p className="text-gray-600">
              Управление личными данными и настройками аккаунта
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Основная информация */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src="/avatars/01.png" alt="Аватар" />
                  <AvatarFallback>
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Изменить фото
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">Имя</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!isEditing}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!isEditing}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    value={profile.position}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Отдел</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="department"
                      value={profile.department}
                      disabled
                      className="pl-9 bg-gray-50"
                    />
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Роль и права доступа */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Роль и права</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Текущая роль</Label>
                <div className="mt-2">
                  <Badge className="text-sm py-1 px-3">Администратор</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Права доступа:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Полный доступ ко всем функциям</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Создание и редактирование агентов</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Запуск и управление кампаниями</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Доступ к настройкам системы</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - Настройки */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="security">Безопасность</TabsTrigger>
              <TabsTrigger value="sessions">Сессии</TabsTrigger>
            </TabsList>

            {/* Безопасность */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Безопасность аккаунта</CardTitle>
                  <CardDescription>
                    Управление паролем и двухфакторной аутентификацией
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Смена пароля</Label>
                      <p className="text-sm text-gray-500 mb-3">
                        Последнее изменение: 15 дней назад
                      </p>
                      <Button variant="outline">
                        <Key className="h-4 w-4 mr-2" />
                        Изменить пароль
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label>Двухфакторная аутентификация</Label>
                      <p className="text-sm text-gray-500 mb-3">
                        Добавьте дополнительный уровень безопасности к вашему аккаунту
                      </p>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Включена
                        </Badge>
                        <Button variant="outline" size="sm">
                          Настроить
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label>Резервные коды</Label>
                      <p className="text-sm text-gray-500 mb-3">
                        Коды для восстановления доступа при потере устройства 2FA
                      </p>
                      <Button variant="outline" size="sm">
                        Сгенерировать новые коды
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Активные сессии */}
            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Активные сессии</CardTitle>
                  <CardDescription>
                    Управление устройствами, с которых выполнен вход в аккаунт
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {/* Текущая сессия */}
                    <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Monitor className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <div className="font-medium">Chrome на MacOS</div>
                            <div className="text-sm text-gray-600">192.168.1.100 • Москва, Россия</div>
                            <div className="text-sm text-green-600 mt-1">Текущая сессия</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Активна
                        </Badge>
                      </div>
                    </div>

                    {/* Другие сессии */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Smartphone className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium">Safari на iPhone</div>
                            <div className="text-sm text-gray-600">192.168.1.101 • Москва, Россия</div>
                            <div className="text-sm text-gray-500 mt-1">Последняя активность: 2 часа назад</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <LogOut className="h-4 w-4 mr-2" />
                          Завершить
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Monitor className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium">Firefox на Windows</div>
                            <div className="text-sm text-gray-600">192.168.1.102 • Санкт-Петербург, Россия</div>
                            <div className="text-sm text-gray-500 mt-1">Последняя активность: 3 дня назад</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <LogOut className="h-4 w-4 mr-2" />
                          Завершить
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900">Завершить все сессии</p>
                        <p className="text-sm text-red-700">Вы будете разлогинены на всех устройствах</p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm">
                      Завершить все
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}