'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  User,
  FileText,
  TrendingUp
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  details?: string[];
  metrics?: { [key: string]: string | number };
}

const DEMO_SCENARIO: DemoStep[] = [
  {
    id: 'import',
    title: 'Импорт контактов',
    description: 'Загружаем CSV файл с 500 контактами',
    duration: 2000,
    status: 'pending',
    details: [
      'Загружен файл contacts_500.csv',
      'Проверка формата данных',
      'Дедупликация по номеру телефона',
      'Валидация номеров'
    ],
    metrics: {
      'Всего записей': 500,
      'Валидных': 487,
      'Дубликатов': 13,
      'Готово к обзвону': 487
    }
  },
  {
    id: 'campaign',
    title: 'Запуск кампании',
    description: 'Создание и запуск кампании &quot;Регистрация казино&quot;',
    duration: 1500,
    status: 'pending',
    details: [
      'Настройка скрипта разговора',
      'Установка лимитов попыток',
      'Конфигурация SMS шаблонов',
      'Активация кампании'
    ],
    metrics: {
      'Скрипт': 'Casino Registration v2.1',
      'Параллельность': 5,
      'Макс. попыток': 3,
      'SMS согласие': 'Включено'
    }
  },
  {
    id: 'monitoring',
    title: 'Мониторинг звонков',
    description: 'Отслеживание активных звонков в реальном времени',
    duration: 3000,
    status: 'pending',
    details: [
      'Инициализация 5 параллельных линий',
      'Обработка первых ответов',
      'Фиксация результатов звонков',
      'Обновление статистики'
    ],
    metrics: {
      'Активных звонков': 5,
      'Дозвонились': 23,
      'Не ответили': 12,
      'Занято': 8
    }
  },
  {
    id: 'cdr_success',
    title: 'Обработка успешного звонка',
    description: 'CDR: Ответ + согласие на SMS',
    duration: 2500,
    status: 'pending',
    details: [
      'Звонок: +7 (999) 123-45-67',
      'Результат: Ответил, заинтересован',
      'SMS согласие: Получено',
      'Автоматическая отправка SMS'
    ],
    metrics: {
      'Длительность': '2:34',
      'Исход': 'answer_success',
      'SMS согласие': 'Да',
      'SMS отправлено': 'Автоматически'
    }
  },
  {
    id: 'cdr_retry',
    title: 'Обработка недозвона',
    description: 'CDR: Не ответил → повторный звонок',
    duration: 1800,
    status: 'pending',
    details: [
      'Звонок: +7 (999) 876-54-32',
      'Результат: Не ответил',
      'Планирование повтора через 2 часа',
      'Обновление счетчика попыток'
    ],
    metrics: {
      'Исход': 'no_answer',
      'Попытка': '1 из 3',
      'Следующий звонок': 'Через 2 часа',
      'Приоритет': 'Средний'
    }
  },
  {
    id: 'cdr_refuse',
    title: 'Обработка отказа',
    description: 'CDR: Отказ → создание задачи менеджеру',
    duration: 2000,
    status: 'pending',
    details: [
      'Звонок: +7 (999) 555-11-22',
      'Результат: Отказался, просит не звонить',
      'Причина: &quot;Не интересно&quot;',
      'Автосоздание задачи менеджеру'
    ],
    metrics: {
      'Исход': 'answer_refuse',
      'Причина': 'Не интересно',
      'Задача': 'Создана для Manager_01',
      'Приоритет': 'Высокий'
    }
  },
  {
    id: 'task_complete',
    title: 'Выполнение задачи менеджером',
    description: 'Менеджер обработал задачу и закрыл лида',
    duration: 1500,
    status: 'pending',
    details: [
      'Менеджер просмотрел CDR',
      'Добавил комментарий',
      'Пометил задачу как выполненную',
      'Лид переведен в статус &quot;отказ&quot;'
    ],
    metrics: {
      'Задача': 'Выполнена',
      'Время обработки': '15 минут',
      'Статус лида': 'refused',
      'Комментарий': 'Добавлен'
    }
  },
  {
    id: 'registration',
    title: 'Регистрация клиента',
    description: 'Клиент зарегистрировался по SMS ссылке',
    duration: 2200,
    status: 'pending',
    details: [
      'Переход по SMS ссылке',
      'Заполнение формы регистрации',
      'Подтверждение email',
      'Обновление статуса в CRM'
    ],
    metrics: {
      'Лид ID': 'L_00123',
      'Статус': 'registered',
      'Источник': 'SMS campaign',
      'Конверсия': '+1'
    }
  },
  {
    id: 'dashboard',
    title: 'Обновление дашборда',
    description: 'Итоговая статистика кампании',
    duration: 1000,
    status: 'pending',
    details: [
      'Обновление KPI карточек',
      'Пересчет конверсии',
      'Генерация отчетов',
      'Уведомления заинтересованных'
    ],
    metrics: {
      'Всего звонков': 487,
      'Дозвонились': 156,
      'Согласие SMS': 43,
      'Регистраций': 12,
      'Конверсия': '2.5%'
    }
  }
];

export default function Demo1Page() {
  const [steps, setSteps] = useState<DemoStep[]>(DEMO_SCENARIO);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const resetDemo = () => {
    setSteps(DEMO_SCENARIO.map(step => ({ ...step, status: 'pending' })));
    setCurrentStep(0);
    setProgress(0);
    setIsRunning(false);
  };

  const runStep = async (stepIndex: number) => {
    const step = steps[stepIndex];
    
    // Начинаем выполнение шага
    setSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { ...s, status: 'running' } : s
    ));

    // Симулируем прогресс
    const duration = step.duration;
    const interval = 50;
    const increment = 100 / (duration / interval);
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += increment;
      setProgress(Math.min(currentProgress, 100));
    }, interval);

    // Ждем завершения
    await new Promise(resolve => setTimeout(resolve, duration));
    
    clearInterval(progressInterval);
    setProgress(100);

    // Завершаем шаг
    setSteps(prev => prev.map((s, i) => 
      i === stepIndex ? { ...s, status: 'completed' } : s
    ));

    // Небольшая пауза перед следующим шагом
    await new Promise(resolve => setTimeout(resolve, 500));
    setProgress(0);
  };

  const runDemo = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await runStep(i);
    }
    
    setIsRunning(false);
    setCurrentStep(-1);
  };

  const getStatusIcon = (status: DemoStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStepIcon = (stepId: string) => {
    const iconMap = {
      'import': FileText,
      'campaign': Play,
      'monitoring': TrendingUp,
      'cdr_success': CheckCircle,
      'cdr_retry': RotateCcw,
      'cdr_refuse': AlertTriangle,
      'task_complete': User,
      'registration': CheckCircle,
      'dashboard': TrendingUp
    };
    const Icon = iconMap[stepId as keyof typeof iconMap] || Phone;
    return <Icon className="h-6 w-6" />;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎯 Демо-сценарий: Hantico Call Center
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Интерактивная демонстрация полного цикла работы системы обзвона
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={runDemo} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Выполняется...' : 'Запустить демо'}
          </Button>
          
          <Button 
            onClick={resetDemo} 
            variant="outline"
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Сбросить
          </Button>
        </div>

        {/* Общий прогресс */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Общий прогресс</span>
            <span className="text-sm text-gray-500">
              {steps.filter(s => s.status === 'completed').length} / {steps.length}
            </span>
          </div>
          <Progress 
            value={(steps.filter(s => s.status === 'completed').length / steps.length) * 100} 
            className="h-2"
          />
        </div>
      </div>

      {/* Список шагов */}
      <div className="grid gap-6">
        {steps.map((step, index) => (
          <Card 
            key={step.id} 
            className={`transition-all duration-300 ${
              currentStep === index ? 'ring-2 ring-blue-500 shadow-lg' : ''
            } ${step.status === 'completed' ? 'bg-green-50' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStepIcon(step.id)}
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {step.title}
                      {getStatusIcon(step.status)}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                  {index + 1}
                </Badge>
              </div>
              
              {/* Прогресс текущего шага */}
              {currentStep === index && step.status === 'running' && (
                <div className="mt-3">
                  <Progress value={progress} className="h-1" />
                </div>
              )}
            </CardHeader>

            <CardContent>
              {/* Детали */}
              {step.details && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Детали выполнения:</h4>
                  <ul className="space-y-1">
                    {step.details.map((detail, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <div className="h-3 w-3 border border-gray-300 rounded-full" />
                        )}
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Метрики */}
              {step.metrics && (
                <div>
                  <h4 className="font-medium mb-2">Результаты:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(step.metrics).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">{key}</div>
                        <div className="font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Итоговая статистика */}
      {steps.every(s => s.status === 'completed') && (
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-xl text-green-800 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              🎉 Демо-сценарий завершен успешно!
            </CardTitle>
            <CardDescription>
              Система обзвона полностью отработала весь цикл от импорта до регистрации
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">487</div>
                <div className="text-sm text-gray-600">Контактов обработано</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-gray-600">Дозвонились</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">43</div>
                <div className="text-sm text-gray-600">SMS согласий</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">12</div>
                <div className="text-sm text-gray-600">Регистраций</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">2.5%</div>
                <div className="text-sm text-gray-600">Конверсия</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
