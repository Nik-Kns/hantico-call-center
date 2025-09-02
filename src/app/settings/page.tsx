'use client'

import React, { useState } from 'react'
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Globe, 
  Database,
  Zap,
  Mail,
  Phone,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { rolePermissions, defaultAppSettings } from '@/lib/mock-data'
import { UserRole, RolePermissions } from '@/lib/types'
import { storage } from '@/lib/utils'

interface SettingsTab {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
}

const settingsTabs: SettingsTab[] = [
  { id: 'roles', name: 'Роли и права', icon: Shield },
  { id: 'users', name: 'Пользователи', icon: Users },
  { id: 'notifications', name: 'Уведомления', icon: Bell },
  { id: 'integrations', name: 'Интеграции', icon: Zap },
  { id: 'system', name: 'Система', icon: Settings }
]

const roleLabels: Record<UserRole, string> = {
  admin: 'Администратор',
  marketer: 'Маркетолог', 
  supervisor: 'Супервайзер',
  manager: 'Менеджер'
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('roles')
  const [permissions, setPermissions] = useState<Record<UserRole, RolePermissions>>(rolePermissions)
  const [currentRole] = useState<UserRole>(storage.get('currentRole', 'admin'))

  // Обновление разрешений
  const updatePermission = (
    role: UserRole, 
    resource: string, 
    action: string, 
    value: boolean
  ) => {
    setPermissions(prev => {
      const updated = { ...prev }
      const rolePerms = updated[role]
      const resourcePerms = rolePerms.permissions[resource as keyof typeof rolePerms.permissions] as any
      
      updated[role] = {
        ...rolePerms,
        permissions: {
          ...rolePerms.permissions,
          [resource]: {
            ...resourcePerms,
            [action]: value
          }
        }
      }
      
      return updated
    })
  }

  const getPermissionIcon = (resource: string) => {
    switch (resource) {
      case 'campaigns': return <Phone className="h-4 w-4" />
      case 'leads': return <Users className="h-4 w-4" />
      case 'calls': return <Phone className="h-4 w-4" />
      case 'tasks': return <Settings className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'scripts': return <Edit className="h-4 w-4" />
      case 'analytics': return <Database className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'view': return 'Просмотр'
      case 'create': return 'Создание'
      case 'edit': return 'Редактирование'
      case 'delete': return 'Удаление'
      case 'start': return 'Запуск'
      case 'pause': return 'Пауза'
      case 'listen': return 'Прослушивание'
      case 'transcript': return 'Транскрипт'
      case 'edit_outcome': return 'Изменение исхода'
      case 'assign': return 'Назначение'
      case 'complete': return 'Завершение'
      case 'send': return 'Отправка'
      case 'view_templates': return 'Просмотр шаблонов'
      case 'edit_templates': return 'Редактирование шаблонов'
      case 'export': return 'Экспорт'
      default: return action
    }
  }

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Управление ролями и правами доступа
        </h3>
        <p className="text-gray-600">
          Настройте права доступа для каждой роли в системе
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(permissions).map(([role, roleData]) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>{roleLabels[role as UserRole]}</span>
                {role === currentRole && (
                  <Badge className="bg-blue-100 text-blue-800">Текущая</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(roleData.permissions).map(([resource, actions]) => (
                <div key={resource} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-3">
                    {getPermissionIcon(resource)}
                    <span className="font-medium text-sm capitalize">
                      {resource === 'campaigns' && 'Кампании'}
                      {resource === 'leads' && 'Лиды'}
                      {resource === 'calls' && 'Звонки'}
                      {resource === 'tasks' && 'Задачи'}
                      {resource === 'sms' && 'SMS'}
                      {resource === 'scripts' && 'Скрипты'}
                      {resource === 'analytics' && 'Аналитика'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(actions).map(([action, allowed]) => (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          checked={allowed as boolean}
                          onCheckedChange={(checked) => 
                            updatePermission(role as UserRole, resource, action, checked as boolean)
                          }
                          disabled={role === currentRole && resource === 'system'}
                        />
                        <span className="text-xs text-gray-700">
                          {getActionLabel(action)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Важно:</p>
              <p>
                Изменения прав доступа применяются немедленно. Будьте осторожны 
                при изменении прав текущей роли, чтобы не потерять доступ к системе.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Управление пользователями
          </h3>
          <p className="text-gray-600">
            Добавляйте и управляйте пользователями системы
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500 py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Управление пользователями</p>
            <p className="text-sm">В демо-версии недоступно</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Настройки уведомлений
        </h3>
        <p className="text-gray-600">
          Настройте способы получения уведомлений о важных событиях
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email уведомления</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox defaultChecked />
              <span className="text-sm">Критические ошибки</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox defaultChecked />
              <span className="text-sm">Завершение кампаний</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox />
              <span className="text-sm">Ежедневные отчеты</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox />
              <span className="text-sm">Еженедельные сводки</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Push уведомления</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox defaultChecked />
              <span className="text-sm">Новые задачи</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox defaultChecked />
              <span className="text-sm">Просроченные задачи</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox />
              <span className="text-sm">Изменения статусов</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox />
              <span className="text-sm">Системные обновления</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Интеграции
        </h3>
        <p className="text-gray-600">
          Настройте подключения к внешним сервисам
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Asterisk PBX</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IP адрес сервера
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Порт
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="5038"
                />
              </div>
              <Button size="sm" className="w-full">
                Тестировать подключение
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>SMS Gateway</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API ключ
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="••••••••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отправитель
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="COMPANY"
                />
              </div>
              <Button size="sm" className="w-full">
                Проверить настройки
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>AI Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="sk-••••••••••••••••••••••••••••••••••••••••••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Модель
                </label>
                <Select defaultValue="gpt-4">
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="w-full">
                Проверить подключение
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>CRM Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="https://your-crm.com/webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="••••••••••••••••"
                />
              </div>
              <Button size="sm" className="w-full">
                Тестировать webhook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Системные настройки
        </h3>
        <p className="text-gray-600">
          Общие настройки системы и безопасности
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Общие настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Часовой пояс системы
              </label>
              <Select defaultValue="Europe/Moscow">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Moscow">Europe/Moscow (MSK)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Язык интерфейса
              </label>
              <Select defaultValue="ru">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Максимальная длительность звонка (минуты)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue={10}
                min={1}
                max={60}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Безопасность</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время сессии (часы)
              </label>
              <Select defaultValue="8">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 час</SelectItem>
                  <SelectItem value="4">4 часа</SelectItem>
                  <SelectItem value="8">8 часов</SelectItem>
                  <SelectItem value="24">24 часа</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox defaultChecked />
              <span className="text-sm">Двухфакторная аутентификация</span>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox defaultChecked />
              <span className="text-sm">Логирование действий пользователей</span>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox />
              <span className="text-sm">Автоматическая блокировка после неактивности</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Хранение данных</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Срок хранения записей звонков (дни)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue={90}
                min={1}
                max={365}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Срок хранения логов (дни)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue={30}
                min={1}
                max={365}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox defaultChecked />
              <span className="text-sm">Автоматическая очистка старых данных</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Производительность</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Максимальное количество одновременных звонков
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue={50}
                min={1}
                max={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Интервал обновления статистики (секунды)
              </label>
              <Select defaultValue="5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 секунда</SelectItem>
                  <SelectItem value="5">5 секунд</SelectItem>
                  <SelectItem value="10">10 секунд</SelectItem>
                  <SelectItem value="30">30 секунд</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox defaultChecked />
              <span className="text-sm">Кэширование данных</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roles': return renderRolesTab()
      case 'users': return renderUsersTab()
      case 'notifications': return renderNotificationsTab()
      case 'integrations': return renderIntegrationsTab()
      case 'system': return renderSystemTab()
      default: return renderRolesTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        <p className="text-gray-600">
          Управление системными настройками и конфигурацией
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Боковое меню */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center space-x-3 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Содержимое */}
        <div className="lg:col-span-4">
          <Card>
            <CardContent className="p-6">
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
