'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plug,
  Webhook,
  Settings,
  Activity,
  Shield,
  CheckSquare,
  Database,
  Bell,
  Users
} from 'lucide-react'

const settingsSections = [
  {
    title: 'Управление пользователями',
    description: 'Настройка доступа и ролей пользователей системы',
    icon: Users,
    href: '/settings/users',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Хаб интеграций',
    description: 'Подключение к ERP/CRM системам, телефонии и SMS-провайдерам',
    icon: Plug,
    href: '/settings/integrations',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Центр вебхуков и событий',
    description: 'Мониторинг исходящих статусов звонков и событий системы',
    icon: Webhook,
    href: '/settings/webhooks',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Логи ошибок',
    description: 'Негативные события интеграций (хранение 30 дней с автоочисткой)',
    icon: Bell,
    href: '/settings/errors',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
]

const quickStats = [
  { label: 'Активные интеграции', value: '5', icon: Activity, color: 'text-green-600' },
  { label: 'События за сегодня', value: '1,234', icon: Webhook, color: 'text-blue-600' },
  { label: 'Передано ID в ERP', value: '892', icon: Shield, color: 'text-red-600' },
  { label: 'Задач в очереди', value: '23', icon: CheckSquare, color: 'text-orange-600' }
]

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="h-8 w-8 text-gray-700" />
          <h1 className="text-3xl font-bold">Настройки и интеграции</h1>
        </div>
        <p className="text-gray-600">
          Управление подключениями, согласиями и настройками системы
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => router.push(section.href)}
          >
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-3`}>
                <section.icon className={`h-6 w-6 ${section.color}`} />
              </div>
              <CardTitle className="group-hover:text-blue-600 transition-colors">
                {section.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {section.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* System Health */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-600" />
              <CardTitle>Состояние системы</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">Все системы работают</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">API Gateway</span>
              <span className="text-sm font-medium text-green-600">Активен</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Webhook Processor</span>
              <span className="text-sm font-medium text-green-600">Активен</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">SMS Gateway</span>
              <span className="text-sm font-medium text-green-600">Активен</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}