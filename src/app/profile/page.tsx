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

        </div>

        {/* Правая колонка - Настройки */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="security">Безопасность</TabsTrigger>
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
                </CardContent>
              </Card>
              
              {/* Роль и права доступа */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Роль и права</span>
                  </CardTitle>
                  <CardDescription>
                    Информация о вашей роли и доступных правах в системе
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Назначенная роль</Label>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge className="text-sm py-1 px-3">Администратор</Badge>
                      <span className="text-sm text-gray-500">с 01.10.2024</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Ваши права в системе:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Кампании</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Просмотр кампаний</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Создание кампаний</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Редактирование</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Запуск и остановка</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Агенты</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Просмотр агентов</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Создание агентов</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Редактирование промптов</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Аналитика</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Просмотр отчетов</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Экспорт данных</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Система</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Доступ к настройкам</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm text-gray-600">Управление пользователями</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <AlertCircle className="inline h-3 w-3 mr-1" />
                      Роль администратора предоставляет полный доступ ко всем функциям системы
                    </p>
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