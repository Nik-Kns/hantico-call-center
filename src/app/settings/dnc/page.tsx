'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Ban,
  Upload,
  Download,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  Shield,
  Globe,
  Building,
  Clock,
  UserX
} from 'lucide-react'

interface DNCRecord {
  id: string
  phone: string
  reason: 'user_refuse' | 'complaint' | 'invalid' | 'spam_risk' | 'regulatory'
  scope: 'global' | 'campaign'
  campaign?: string
  addedDate: string
  addedBy: string
  comment?: string
  expiresAt?: string
}

const mockDNCRecords: DNCRecord[] = [
  {
    id: 'dnc_1',
    phone: '+7 (900) 111-22-33',
    reason: 'user_refuse',
    scope: 'global',
    addedDate: '2024-01-09 10:00:00',
    addedBy: 'Система',
    comment: 'Клиент попросил не звонить'
  },
  {
    id: 'dnc_2',
    phone: '+7 (900) 222-33-44',
    reason: 'complaint',
    scope: 'global',
    addedDate: '2024-01-08 15:30:00',
    addedBy: 'Иванов И.И.',
    comment: 'Жалоба в Роскомнадзор'
  },
  {
    id: 'dnc_3',
    phone: '+7 (900) 333-44-55',
    reason: 'invalid',
    scope: 'campaign',
    campaign: 'Новогодняя кампания',
    addedDate: '2024-01-07 12:00:00',
    addedBy: 'Система',
    comment: 'Несуществующий номер'
  },
  {
    id: 'dnc_4',
    phone: '+7 (900) 444-55-66',
    reason: 'spam_risk',
    scope: 'global',
    addedDate: '2024-01-06 09:00:00',
    addedBy: 'AI анализатор',
    comment: 'Высокий риск спам-жалоб'
  },
  {
    id: 'dnc_5',
    phone: '+7 (900) 555-66-77',
    reason: 'regulatory',
    scope: 'global',
    addedDate: '2024-01-05 14:00:00',
    addedBy: 'Юридический отдел',
    comment: 'Запрет по решению суда',
    expiresAt: '2025-01-05'
  }
]

const stats = {
  total: 892,
  global: 567,
  campaign: 325,
  addedToday: 12,
  expiringSoon: 8
}

export default function DNCPage() {
  const router = useRouter()
  const [records, setRecords] = useState<DNCRecord[]>(mockDNCRecords)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterReason, setFilterReason] = useState<string>('all')
  const [filterScope, setFilterScope] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [bulkImportText, setBulkImportText] = useState('')

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  const handleBulkDelete = () => {
    setRecords(prev => prev.filter(r => !selectedRecords.includes(r.id)))
    setSelectedRecords([])
  }

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'user_refuse':
        return <Badge className="bg-yellow-100 text-yellow-800">Отказ клиента</Badge>
      case 'complaint':
        return <Badge className="bg-red-100 text-red-800">Жалоба</Badge>
      case 'invalid':
        return <Badge className="bg-gray-100 text-gray-800">Недействителен</Badge>
      case 'spam_risk':
        return <Badge className="bg-orange-100 text-orange-800">Спам-риск</Badge>
      case 'regulatory':
        return <Badge className="bg-purple-100 text-purple-800">Регуляторный</Badge>
      default:
        return <Badge>{reason}</Badge>
    }
  }

  const getScopeIcon = (scope: string) => {
    if (scope === 'global') {
      return <Globe className="h-4 w-4 text-red-500" />
    }
    return <Building className="h-4 w-4 text-blue-500" />
  }

  const filteredRecords = records.filter(record => {
    if (searchQuery && !record.phone.includes(searchQuery)) return false
    if (filterReason !== 'all' && record.reason !== filterReason) return false
    if (filterScope !== 'all' && record.scope !== filterScope) return false
    return true
  })

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
            <h1 className="text-3xl font-bold mb-2">Черные списки / DNC</h1>
            <p className="text-gray-600">
              Управление исключениями и запрещенными номерами
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить номер
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Массовый импорт
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
      </div>

      {/* Alert */}
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Важно: номера в черном списке автоматически исключаются из всех кампаний
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Глобальные исключения действуют для всей системы, локальные — только для указанной кампании
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего записей</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Ban className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Глобальные</p>
                <p className="text-2xl font-bold text-red-600">{stats.global}</p>
              </div>
              <Globe className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Для кампаний</p>
                <p className="text-2xl font-bold text-blue-600">{stats.campaign}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Добавлено сегодня</p>
                <p className="text-2xl font-bold">+{stats.addedToday}</p>
              </div>
              <UserX className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Истекает скоро</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Поиск по номеру</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="+7 (900) 123-45-67"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reason-filter">Причина</Label>
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger id="reason-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все причины</SelectItem>
                  <SelectItem value="user_refuse">Отказ клиента</SelectItem>
                  <SelectItem value="complaint">Жалоба</SelectItem>
                  <SelectItem value="invalid">Недействительный</SelectItem>
                  <SelectItem value="spam_risk">Спам-риск</SelectItem>
                  <SelectItem value="regulatory">Регуляторный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scope-filter">Область действия</Label>
              <Select value={filterScope} onValueChange={setFilterScope}>
                <SelectTrigger id="scope-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="global">Глобальные</SelectItem>
                  <SelectItem value="campaign">Для кампаний</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DNC Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Черный список</CardTitle>
            <div className="flex items-center space-x-2">
              {selectedRecords.length > 0 && (
                <>
                  <Badge variant="outline">{selectedRecords.length} выбрано</Badge>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Удалить выбранные
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRecords.length === filteredRecords.length && filteredRecords.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRecords(filteredRecords.map(r => r.id))
                      } else {
                        setSelectedRecords([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Номер телефона</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Область</TableHead>
                <TableHead>Кампания</TableHead>
                <TableHead>Добавлен</TableHead>
                <TableHead>Кем добавлен</TableHead>
                <TableHead>Комментарий</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRecords.includes(record.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRecords([...selectedRecords, record.id])
                        } else {
                          setSelectedRecords(selectedRecords.filter(id => id !== record.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono font-medium">{record.phone}</TableCell>
                  <TableCell>{getReasonBadge(record.reason)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getScopeIcon(record.scope)}
                      <span className="text-sm">
                        {record.scope === 'global' ? 'Глобально' : 'Кампания'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{record.campaign || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {record.addedDate}
                      {record.expiresAt && (
                        <div className="text-xs text-yellow-600">
                          Истекает: {record.expiresAt}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{record.addedBy}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-sm text-gray-600 truncate">
                      {record.comment || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить номер в черный список</DialogTitle>
            <DialogDescription>
              Укажите номер телефона и причину добавления в DNC
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Номер телефона</Label>
              <Input id="phone" placeholder="+7 (900) 123-45-67" />
            </div>
            
            <div>
              <Label htmlFor="reason">Причина</Label>
              <Select>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Выберите причину" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user_refuse">Отказ клиента</SelectItem>
                  <SelectItem value="complaint">Жалоба</SelectItem>
                  <SelectItem value="invalid">Недействительный номер</SelectItem>
                  <SelectItem value="spam_risk">Риск спам-жалоб</SelectItem>
                  <SelectItem value="regulatory">Регуляторный запрет</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="scope">Область действия</Label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="scope" value="global" defaultChecked />
                  <span className="text-sm">Глобально (для всех кампаний)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="scope" value="campaign" />
                  <span className="text-sm">Для конкретной кампании</span>
                </label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment">Комментарий (опционально)</Label>
              <Textarea
                id="comment"
                placeholder="Дополнительная информация..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Добавить в черный список
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}