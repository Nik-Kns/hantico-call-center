import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { ru } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Форматирование времени
export function formatTime(date: Date): string {
  return format(date, 'HH:mm', { locale: ru })
}

// Форматирование даты
export function formatDate(date: Date): string {
  if (isToday(date)) {
    return `Сегодня, ${formatTime(date)}`
  }
  
  if (isYesterday(date)) {
    return `Вчера, ${formatTime(date)}`
  }
  
  return format(date, 'dd.MM.yyyy HH:mm', { locale: ru })
}

// Форматирование относительного времени
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: ru 
  })
}

// Форматирование длительности звонка
export function formatCallDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes === 0) {
    return `${remainingSeconds}с`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Форматирование номера телефона
export function formatPhoneNumber(phone: string): string {
  // Простое форматирование для российских номеров
  if (phone.startsWith('+7')) {
    const digits = phone.slice(2)
    if (digits.length === 10) {
      return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
    }
  }
  return phone
}

// Маскировка номера телефона для безопасности
export function maskPhoneNumber(phone: string): string {
  // Убираем все символы кроме цифр и +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  if (cleaned.startsWith('+7') && cleaned.length >= 11) {
    // Российский номер: +7 (9XX) XXX-XX-XX -> +7 (9••) •••-••-12
    const digits = cleaned.slice(2)
    const lastTwo = digits.slice(-2)
    return `+7 (${digits[0]}••) •••-••-${lastTwo}`
  } else if (cleaned.startsWith('8') && cleaned.length >= 10) {
    // Российский номер с 8: 8 9XX XXX XX XX -> 8 (9••) •••-••-12
    const digits = cleaned.slice(1)
    const lastTwo = digits.slice(-2)
    return `8 (${digits[0]}••) •••-••-${lastTwo}`
  } else if (cleaned.length >= 10) {
    // Общий случай - показываем первые 2-3 цифры и последние 2
    const firstPart = cleaned.slice(0, 3)
    const lastTwo = cleaned.slice(-2)
    const middleLength = cleaned.length - 5
    const middle = '•'.repeat(middleLength)
    return `${firstPart}${middle}${lastTwo}`
  }
  
  // Если номер слишком короткий, маскируем середину
  if (cleaned.length >= 4) {
    const first = cleaned[0]
    const last = cleaned.slice(-1)
    const middleLength = cleaned.length - 2
    const middle = '•'.repeat(middleLength)
    return `${first}${middle}${last}`
  }
  
  // Очень короткий номер - полная маскировка
  return '•'.repeat(cleaned.length)
}

// Получение цвета для статуса
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Статусы лидов
    'new': 'bg-blue-100 text-blue-800',
    'in_queue': 'bg-yellow-100 text-yellow-800',
    'calling': 'bg-orange-100 text-orange-800',
    'called': 'bg-gray-100 text-gray-800',
    'success': 'bg-green-100 text-green-800',
    'refused': 'bg-red-100 text-red-800',
    'blacklisted': 'bg-black text-white',
    'registered': 'bg-emerald-100 text-emerald-800',
    
    // Исходы звонков
    'answer_success': 'bg-green-100 text-green-800',
    'answer_refuse': 'bg-red-100 text-red-800',
    'no_answer': 'bg-yellow-100 text-yellow-800',
    'busy': 'bg-orange-100 text-orange-800',
    'voicemail': 'bg-purple-100 text-purple-800',
    'robot_voicemail': 'bg-indigo-100 text-indigo-800',
    'invalid': 'bg-gray-100 text-gray-800',
    'blacklist': 'bg-black text-white',
    
    // Состояния кампаний
    'running': 'bg-green-100 text-green-800',
    'paused': 'bg-yellow-100 text-yellow-800',
    'stopped': 'bg-red-100 text-red-800',
    'draft': 'bg-gray-100 text-gray-800',
    
    // Приоритеты задач
    'low': 'bg-blue-100 text-blue-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800',
    
    // Статусы задач
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    
    // Статусы SMS
    'sent': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'failed': 'bg-red-100 text-red-800',
  }
  
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Получение текста для статуса на русском
export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    // Статусы лидов
    'new': 'Новый',
    'in_queue': 'В очереди',
    'calling': 'Звоним',
    'called': 'Обзвонен',
    'success': 'Успех',
    'refused': 'Отказ',
    'blacklisted': 'ЧС',
    'registered': 'Зарегистрирован',
    
    // Исходы звонков
    'answer_success': 'Успешно',
    'answer_refuse': 'Отказ',
    'no_answer': 'Не ответил',
    'busy': 'Занято',
    'voicemail': 'Автоответчик',
    'robot_voicemail': 'Робот-автоответчик',
    'invalid': 'Недоступен',
    'blacklist': 'ЧС',
    
    // Состояния кампаний
    'running': 'Запущена',
    'paused': 'Пауза',
    'stopped': 'Остановлена',
    'draft': 'Черновик',
    
    // Приоритеты задач
    'low': 'Низкий',
    'medium': 'Средний',
    'high': 'Высокий',
    'urgent': 'Срочно',
    
    // Статусы задач
    'pending': 'Ожидает',
    'in_progress': 'В работе',
    'completed': 'Выполнено',
    'cancelled': 'Отменено',
    
    // Статусы SMS
    'sent': 'Отправлено',
    'delivered': 'Доставлено',
    'failed': 'Ошибка',
  }
  
  return texts[status] || status
}

// Получение иконки для статуса
export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    // Статусы лидов
    'new': '🆕',
    'in_queue': '⏳',
    'calling': '📞',
    'called': '✅',
    'success': '🎉',
    'refused': '❌',
    'blacklisted': '🚫',
    'registered': '🎯',
    
    // Исходы звонков
    'answer_success': '✅',
    'answer_refuse': '❌',
    'no_answer': '📵',
    'busy': '📱',
    'voicemail': '📧',
    'robot_voicemail': '🤖',
    'invalid': '⚠️',
    'blacklist': '🚫',
    
    // Состояния кампаний
    'running': '▶️',
    'paused': '⏸️',
    'stopped': '⏹️',
    'draft': '📝',
    
    // Приоритеты задач
    'low': '🔵',
    'medium': '🟡',
    'high': '🟠',
    'urgent': '🔴',
    
    // Статусы задач
    'pending': '⏳',
    'in_progress': '🔄',
    'completed': '✅',
    'cancelled': '❌',
    
    // Статусы SMS
    'sent': '📤',
    'delivered': '✅',
    'failed': '❌',
  }
  
  return icons[status] || '❓'
}

// Вычисление процентов
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Генерация случайного ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

// Валидация номера телефона
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

// Экспорт в CSV
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let value = row[header]
        if (typeof value === 'string' && /\+?\d[\d\s\-\(\)]{6,}/.test(value)) {
          value = maskPhoneNumber(value)
        }
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Дебаунс функция
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Проверка прав доступа
export function hasPermission(
  userPermissions: any,
  resource: string,
  action: string
): boolean {
  return userPermissions?.[resource]?.[action] === true
}

// Локальное хранение
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  set: (key: string, value: any): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Игнорируем ошибки записи
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    
    try {
      window.localStorage.removeItem(key)
    } catch {
      // Игнорируем ошибки удаления
    }
  }
}
