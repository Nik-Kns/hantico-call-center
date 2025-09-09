'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  CheckSquare,
  Clock,
  AlertCircle,
  Phone,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react'

interface Task {
  id: string
  type: 'callback' | 'no_consent' | 'refusal' | 'technical'
  priority: 'high' | 'medium' | 'low'
  leadName: string
  leadPhone: string
  campaign: string
  reason: string
  createdAt: string
  deadline?: string
  assignee?: string
  status: 'pending' | 'in_progress' | 'completed'
}

const mockTasks: Task[] = [
  {
    id: 'task_1',
    type: 'callback',
    priority: 'high',
    leadName: 'Иванов И.И.',
    leadPhone: '+7900***1234',
    campaign: 'Новогодняя кампания',
    reason: 'Просил перезвонить после 18:00',
    createdAt: '2024-01-09 10:00',
    deadline: '2024-01-09 18:00',
    status: 'pending'
  },
  {
    id: 'task_2',
    type: 'no_consent',
    priority: 'medium',
    leadName: 'Петрова М.С.',
    leadPhone: '+7900***2345',
    campaign: 'Реактивация',
    reason: 'Не дал согласие на SMS',
    createdAt: '2024-01-09 09:30',
    assignee: 'Менеджер 1',
    status: 'in_progress'
  },
  {
    id: 'task_3',
    type: 'refusal',
    priority: 'low',
    leadName: 'Сидоров А.П.',
    leadPhone: '+7900***3456',
    campaign: 'Обзвон базы',
    reason: 'Отказ с причиной: дорого',
    createdAt: '2024-01-08 15:00',
    status: 'pending'
  }
]

export default function TasksPage() {
  const router = useRouter()
  const [tasks] = useState<Task[]>(mockTasks)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Высокий</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Средний</Badge>
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Низкий</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'callback':
        return <Phone className="h-4 w-4 text-blue-500" />
      case 'no_consent':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'refusal':
        return <MessageSquare className="h-4 w-4 text-red-500" />
      default:
        return <CheckSquare className="h-4 w-4" />
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
        
        <h1 className="text-3xl font-bold mb-2">Задачи менеджера</h1>
        <p className="text-gray-600">Централизованный inbox для ручной обработки</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В очереди</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В работе</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <User className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Просрочено</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Завершено сегодня</p>
                <p className="text-2xl font-bold text-green-600">15</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Активные задачи</CardTitle>
            {selectedTasks.length > 0 && (
              <div className="flex space-x-2">
                <Badge variant="outline">{selectedTasks.length} выбрано</Badge>
                <Button size="sm">Взять в работу</Button>
                <Button size="sm" variant="outline">Закрыть</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Приоритет</TableHead>
                <TableHead>Лид</TableHead>
                <TableHead>Кампания</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Создано</TableHead>
                <TableHead>Дедлайн</TableHead>
                <TableHead>Ответственный</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTasks([...selectedTasks, task.id])
                        } else {
                          setSelectedTasks(selectedTasks.filter(id => id !== task.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{getTypeIcon(task.type)}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.leadName}</p>
                      <p className="text-sm text-gray-500">{task.leadPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{task.campaign}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-sm">{task.reason}</span>
                  </TableCell>
                  <TableCell className="text-sm">{task.createdAt}</TableCell>
                  <TableCell>
                    {task.deadline && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">{task.deadline}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{task.assignee || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}