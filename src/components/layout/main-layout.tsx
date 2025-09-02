'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Phone, 
  Users, 
  BarChart3, 
  Settings, 
  FileText, 
  CheckSquare as Tasks, 
  Bell,
  User,
  LogOut,
  Shield,
  Monitor
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { UserRole } from '@/lib/types'
import { rolePermissions } from '@/lib/mock-data'
import { storage } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Дашборд кампаний',
    href: '/',
    icon: BarChart3,
    permissions: ['campaigns.view']
  },
  {
    name: 'Кампании',
    href: '/campaigns',
    icon: Phone,
    permissions: ['campaigns.view']
  },
  {
    name: 'Очередь звонков',
    href: '/queue',
    icon: Monitor,
    permissions: ['campaigns.view']
  },
  {
    name: 'Лиды',
    href: '/leads',
    icon: Users,
    permissions: ['leads.view']
  },
  {
    name: 'Задачи',
    href: '/tasks',
    icon: Tasks,
    permissions: ['tasks.view']
  },
  {
    name: 'Скрипты',
    href: '/scripts',
    icon: FileText,
    permissions: ['scripts.view']
  },
  {
    name: 'Аналитика',
    href: '/analytics',
    icon: BarChart3,
    permissions: ['analytics.view']
  },
  {
    name: 'Автоматизация',
    href: '/automation',
    icon: Settings,
    permissions: ['campaigns.view']
  },
  {
    name: '🎯 Демо-сценарий',
    href: '/demo1',
    icon: Monitor,
    permissions: []
  },
  {
    name: 'Настройки',
    href: '/settings',
    icon: Settings,
    permissions: []
  }
]

const roleLabels: Record<UserRole, string> = {
  admin: 'Администратор',
  marketer: 'Маркетолог',
  supervisor: 'Супервайзер',
  manager: 'Менеджер'
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [currentRole, setCurrentRole] = useState<UserRole>('admin')
  const [brandEnabled, setBrandEnabled] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState('AIGAMING.BOT')

  const brands = ['AIGAMING.BOT', 'LuckyWheel', 'GoldenPlay']

  // Загрузка настроек из localStorage при монтировании
  useEffect(() => {
    const savedRole = storage.get<UserRole>('currentRole', 'admin')
    const savedBrandEnabled = storage.get<boolean>('brandEnabled', true)
    const savedBrand = storage.get<string>('selectedBrand', 'AIGAMING.BOT')
    
    setCurrentRole(savedRole)
    setBrandEnabled(savedBrandEnabled)
    setSelectedBrand(savedBrand)
  }, [])

  // Сохранение настроек в localStorage
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role)
    storage.set('currentRole', role)
  }

  const handleBrandEnabledChange = (enabled: boolean) => {
    setBrandEnabled(enabled)
    storage.set('brandEnabled', enabled)
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand)
    storage.set('selectedBrand', brand)
  }

  // Получение текущих прав доступа
  const currentPermissions = rolePermissions[currentRole]

  // Проверка доступа к пункту меню
  const hasAccess = (permissions: string[]) => {
    if (permissions.length === 0) return true
    
    return permissions.some(permission => {
      const [resource, action] = permission.split('.')
      const resourcePerms = currentPermissions.permissions[resource as keyof typeof currentPermissions.permissions] as any
      return resourcePerms?.[action]
    })
  }

  // Фильтрация навигации по правам доступа
  const filteredNavigation = navigation.filter(item => hasAccess(item.permissions))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Hantico Call Center
                </span>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Role Selector */}
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <Select value={currentRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <SelectItem key={role} value={role}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Selection */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={brandEnabled}
                    onCheckedChange={handleBrandEnabledChange}
                  />
                  <label className="text-sm text-gray-700">Бренд</label>
                </div>
                
                {brandEnabled && (
                  <Select value={selectedBrand} onValueChange={handleBrandChange}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/avatars/01.png" alt="Пользователь" />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {roleLabels[currentRole]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        user@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r">
          <div className="p-4">
            <div className="space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5',
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Current Role Display */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Текущая роль:</div>
              <div className="font-medium text-sm text-gray-900">
                {roleLabels[currentRole]}
              </div>
              {brandEnabled && (
                <>
                  <div className="text-xs text-gray-500 mt-2 mb-1">Бренд:</div>
                  <div className="font-medium text-sm text-gray-900">
                    {selectedBrand}
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
