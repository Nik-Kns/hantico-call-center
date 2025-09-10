'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Search,
  Tag,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react'

interface KnowledgeItem {
  id: string
  intent: string
  tags: string[]
  answer: string
  scriptVersion: string
  usage: number
}

interface ForbiddenPhrase {
  id: string
  phrase: string
  reason: string
  severity: 'critical' | 'high' | 'medium'
}

const mockKnowledge: KnowledgeItem[] = [
  {
    id: 'kb_1',
    intent: 'price_question',
    tags: ['цена', 'стоимость', 'сколько'],
    answer: 'Стоимость зависит от выбранного тарифа. Базовый тариф начинается от 990 рублей в месяц.',
    scriptVersion: 'v2.1',
    usage: 234
  },
  {
    id: 'kb_2',
    intent: 'refund_policy',
    tags: ['возврат', 'деньги назад', 'отмена'],
    answer: 'Мы предоставляем полный возврат средств в течение 14 дней с момента оплаты.',
    scriptVersion: 'v2.1',
    usage: 89
  },
  {
    id: 'kb_3',
    intent: 'technical_support',
    tags: ['поддержка', 'помощь', 'проблема'],
    answer: 'Техническая поддержка доступна 24/7. Вы можете связаться с нами через чат или по телефону.',
    scriptVersion: 'v2.0',
    usage: 456
  }
]

const mockForbidden: ForbiddenPhrase[] = [
  {
    id: 'fb_1',
    phrase: 'гарантированный доход',
    reason: 'Запрещено регулятором - вводит в заблуждение',
    severity: 'critical'
  },
  {
    id: 'fb_2',
    phrase: 'без риска',
    reason: 'Некорректное утверждение для финансовых продуктов',
    severity: 'high'
  },
  {
    id: 'fb_3',
    phrase: 'эксклюзивное предложение',
    reason: 'Может восприниматься как давление',
    severity: 'medium'
  }
]

export default function KnowledgePage() {
  const router = useRouter()
  const [knowledge] = useState<KnowledgeItem[]>(mockKnowledge)
  const [forbidden] = useState<ForbiddenPhrase[]>(mockForbidden)
  const [searchQuery, setSearchQuery] = useState('')

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Критично</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Высокий</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Средний</Badge>
      default:
        return <Badge>{severity}</Badge>
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
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">База знаний для скрипта</h1>
            <p className="text-gray-600">
              Управление ответами на типовые вопросы и запрещенными фразами
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить знание
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего ответов</p>
                <p className="text-2xl font-bold">{knowledge.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Запрещенных фраз</p>
                <p className="text-2xl font-bold">{forbidden.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Использований/24ч</p>
                <p className="text-2xl font-bold">779</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="knowledge">
        <TabsList className="mb-6">
          <TabsTrigger value="knowledge">База ответов</TabsTrigger>
          <TabsTrigger value="forbidden">Запрещенные фразы</TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ответы на типовые вопросы</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Поиск по интентам и тегам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knowledge.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{item.intent}</span>
                          <Badge variant="outline" className="text-xs">
                            v{item.scriptVersion}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.usage} использований
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.map((tag, idx) => (
                            <Badge key={idx} className="bg-blue-50 text-blue-700">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-700">{item.answer}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forbidden">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Запрещенные фразы</CardTitle>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить фразу
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {forbidden.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-red-600">&quot;{item.phrase}&quot;</span>
                          {getSeverityBadge(item.severity)}
                        </div>
                        <p className="text-sm text-gray-600">{item.reason}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}