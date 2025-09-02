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
    name: 'Клиенты',
    href: '/leads',
    icon: Users,
    permissions: ['leads.view']
  },
  {
    name: 'История',
    href: '/queue',
    icon: Monitor,
    permissions: ['campaigns.view']
  },
  {
    name: 'Календарь',
    href: '/campaigns',
    icon: Phone,
    permissions: ['campaigns.view']
  },
  {
    name: 'Информация',
    href: '/tasks',
    icon: FileText,
    permissions: ['tasks.view']
  },
  {
    name: 'Настройки',
    href: '/settings',
    icon: Settings,
    permissions: []
  },
  {
    name: '🎯 Демо-сценарий',
    href: '/demo1',
    icon: Monitor,
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
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-red-600 rounded-full"></div>
                  </div>
                </div>
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
        <nav className="w-16 bg-white min-h-screen border-r border-gray-200 flex flex-col">
          <div className="flex-1 py-4">
            <div className="space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-center w-12 h-12 mx-2 rounded-lg transition-colors relative group',
                      isActive
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    )}
                    title={item.name}
                  >
                    <item.icon className="h-5 w-5" />
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Version info at bottom */}
          <div className="p-2 border-t border-gray-200">
            <div className="text-xs text-gray-400 text-center">
              <div>Версия</div>
              <div>01.08.08</div>
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
