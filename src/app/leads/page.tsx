'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Download
} from 'lucide-react'

import { mockLeads } from '@/lib/mock-data'
import { Lead } from '@/lib/types'
import { formatPhoneNumber } from '@/lib/utils'

export default function LeadsPage() {
  const [leads] = useState<Lead[]>(mockLeads)
  const [showResults, setShowResults] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [searchData, setSearchData] = useState({
    phone: '',
    lastName: '',
    firstName: '',
    middleName: '',
    passportSeries: '',
    vin: '',
    carNumber: ''
  })

  const handleSearch = () => {
    setShowResults(true)
  }

  const handleNewSearch = () => {
    setShowResults(false)
    setShowLogs(false)
    setSearchData({
      phone: '',
      lastName: '',
      firstName: '',
      middleName: '',
      passportSeries: '',
      vin: '',
      carNumber: ''
    })
  }

  const handleShowLogs = () => {
    setShowLogs(true)
  }

  if (showLogs) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLogs(false)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-medium text-gray-900">Лог поиска клиентов</h1>
            <Button variant="outline" size="sm" className="ml-auto">
              Лог поиска клиентов
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">ФИО</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Наименование действия</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Действие</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Дата создания</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Сергеев Сергей Сергеевич</td>
                  <td className="py-3 px-4 text-gray-600">Переход на внешнюю страницу</td>
                  <td className="py-3 px-4">
                    <a href="https://docs.google.com/document/..." className="text-blue-600 text-sm break-all">
                      https://docs.google.com/document/d/1P-7ZakqgRVEwcalHqGq8xRChMzuPYlZAulNs2f2bHMGE/edit?tab=t.0
                    </a>
                  </td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Сергеев Сергей Сергеевич</td>
                  <td className="py-3 px-4 text-gray-600">Поиск</td>
                  <td className="py-3 px-4 text-gray-600">Иванов Иван Иванович</td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Сергеев Сергей Сергеевич</td>
                  <td className="py-3 px-4 text-gray-600">Поиск</td>
                  <td className="py-3 px-4 text-gray-600">+79874635400</td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Сергеев Сергей Сергеевич</td>
                  <td className="py-3 px-4 text-gray-600">Переход на внешнюю страницу</td>
                  <td className="py-3 px-4">
                    <a href="https://docs.google.com/document/..." className="text-blue-600 text-sm break-all">
                      https://docs.google.com/document/d/1P-7ZakqgRVEwcalHqGq8xRChMzuPYlZAulNs2f2bHMGE/edit?tab=t.0
                    </a>
                  </td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-900">Сергеев Сергей Сергеевич</td>
                  <td className="py-3 px-4 text-gray-600">Поиск</td>
                  <td className="py-3 px-4 text-gray-600">Горький Максим</td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>1-20 из 1726253</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="px-3 py-1">«</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">‹</Button>
              <Button variant="default" size="sm" className="px-3 py-1 bg-orange-400 text-white">1</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">2</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">3</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">...</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">100</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">›</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">»</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowResults(false)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-medium text-gray-900">Поиск клиентов</h1>
            <Button variant="outline" size="sm" className="ml-auto" onClick={handleShowLogs}>
              Лог поиска клиентов
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Search Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Введите данные для поиска</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Номер телефона</label>
                <input
                  type="text"
                  placeholder="+7 (___) ___-__-__"
                  value={searchData.phone}
                  onChange={(e) => setSearchData({...searchData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                <input
                  type="text"
                  placeholder="Сергеев"
                  value={searchData.lastName}
                  onChange={(e) => setSearchData({...searchData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  placeholder="Сергей"
                  value={searchData.firstName}
                  onChange={(e) => setSearchData({...searchData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Отчество</label>
                <input
                  type="text"
                  placeholder="Иванович"
                  value={searchData.middleName}
                  onChange={(e) => setSearchData({...searchData, middleName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchData.middleName && (
                  <p className="text-xs text-red-500 mt-1">Обязательно при поиске по ФИО</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Серия и номер В/У</label>
                <input
                  type="text"
                  placeholder="AA 00 123456"
                  value={searchData.passportSeries}
                  onChange={(e) => setSearchData({...searchData, passportSeries: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIN номер</label>
                <input
                  type="text"
                  placeholder="4Y1SL65848Z411439"
                  value={searchData.vin}
                  onChange={(e) => setSearchData({...searchData, vin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Номер авто</label>
                <input
                  type="text"
                  placeholder="В 100 ВУ 72"
                  value={searchData.carNumber}
                  onChange={(e) => setSearchData({...searchData, carNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleNewSearch}>
                Новый поиск
              </Button>
              <Button className="bg-orange-400 hover:bg-orange-500 text-white">
                Найти
              </Button>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Дата регистрации</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">ФИО</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Телефон</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Парк</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Тип занятости</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">VIN номер</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Номер авто</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Дата последнего заказа</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">03.05.2023 / 05:50</td>
                  <td className="py-3 px-4">
                    <a href="#" className="text-blue-600 hover:underline">Сергеев Сергей Сергеевич</a>
                  </td>
                  <td className="py-3 px-4 text-gray-900">+7(999)***-**-99</td>
                  <td className="py-3 px-4 text-gray-600">Горького</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-gray-100 text-gray-700">Парковый исполнитель</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">WAUZ**********</td>
                  <td className="py-3 px-4 text-gray-600">А7**** 199</td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023 / 05:50</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">03.05.2023 / 05:50</td>
                  <td className="py-3 px-4">
                    <a href="#" className="text-blue-600 hover:underline">Сергеев Сергей Сергеевич</a>
                  </td>
                  <td className="py-3 px-4 text-gray-900">+7(999)***-**-99</td>
                  <td className="py-3 px-4 text-gray-600">Горького</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-100 text-blue-700">Парковый самозанятый</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">1FTF**********</td>
                  <td className="py-3 px-4 text-gray-600">Е3**** 777</td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023 / 05:50</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">03.05.2023 / 05:50</td>
                  <td className="py-3 px-4">
                    <a href="#" className="text-blue-600 hover:underline">Сергеев Сергей Сергеевич</a>
                  </td>
                  <td className="py-3 px-4 text-gray-900">+7(999)***-**-99</td>
                  <td className="py-3 px-4 text-gray-600">Горького</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-purple-100 text-purple-700">Индивидуальный предприниматель</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">KL0H**********</td>
                  <td className="py-3 px-4 text-gray-600">Т5**** 999</td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023 / 05:50</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">03.05.2023 / 05:50</td>
                  <td className="py-3 px-4">
                    <a href="#" className="text-blue-600 hover:underline">Сергеев Сергей Сергеевич</a>
                  </td>
                  <td className="py-3 px-4 text-gray-900">+7(999)***-**-99</td>
                  <td className="py-3 px-4 text-gray-600">Горького</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-gray-100 text-gray-700">Парковый исполнитель</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">SALV**********</td>
                  <td className="py-3 px-4 text-gray-600">Е3**** 777</td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023 / 05:50</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-900">03.05.2023 / 05:50</td>
                  <td className="py-3 px-4">
                    <a href="#" className="text-blue-600 hover:underline">Сергеев Сергей Сергеевич</a>
                  </td>
                  <td className="py-3 px-4 text-gray-900">+7(999)***-**-99</td>
                  <td className="py-3 px-4 text-gray-600">Горького</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-gray-100 text-gray-700">Парковый исполнитель</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">JTDB**********</td>
                  <td className="py-3 px-4 text-gray-600">Т5**** 999</td>
                  <td className="py-3 px-4 text-gray-600">03.05.2023 / 05:50</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>1-20 из 1726253</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="px-3 py-1">«</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">‹</Button>
              <Button variant="default" size="sm" className="px-3 py-1 bg-orange-400 text-white">1</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">2</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">3</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">...</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">100</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">›</Button>
              <Button variant="ghost" size="sm" className="px-3 py-1">»</Button>
              <select className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm">
                <option>20</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-medium text-gray-900">Клиенты</h1>
      </div>

      <div className="p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Профили клиентов</h2>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Аккаунты</h2>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <button 
                  onClick={handleSearch}
                  className="text-lg font-medium text-gray-900 text-left w-full"
                >
                  Поиск клиентов
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}