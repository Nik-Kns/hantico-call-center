import { 
  Lead, 
  Campaign, 
  Call, 
  Task, 
  Sms, 
  Script, 
  SmsTemplate,
  AutomationRule,
  RolePermissions,
  Agent,
  Voice,
  VoiceLibrary,
  CampaignMetrics,
  QueueStatus,
  AppSettings,
  UserRole
} from './types';

// Моковые лиды
export const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    phone: '+79001234567',
    name: 'Алексей Петров',
    timezone: 'Europe/Moscow',
    language: 'ru',
    segment: 'VIP',
    consentSms: true,
    status: 'success',
    blacklist: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T14:30:00Z'),
    lastCallAt: new Date('2024-01-15T14:30:00Z'),
    registrationDate: new Date('2024-01-15T15:45:00Z'),
    tags: ['high-value', 'interested'],
  },
  {
    id: 'lead-2',
    phone: '+79007654321',
    name: 'Мария Иванова',
    timezone: 'Europe/Moscow',
    language: 'ru',
    segment: 'Regular',
    consentSms: false,
    status: 'called',
    blacklist: false,
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T13:15:00Z'),
    lastCallAt: new Date('2024-01-15T13:15:00Z'),
    tags: ['needs-followup'],
  },
  {
    id: 'lead-3',
    phone: '+79009876543',
    name: 'Дмитрий Сидоров',
    timezone: 'Europe/Moscow',
    language: 'ru',
    segment: 'New',
    consentSms: true,
    status: 'in_queue',
    blacklist: false,
    createdAt: new Date('2024-01-15T11:00:00Z'),
    updatedAt: new Date('2024-01-15T11:00:00Z'),
    tags: ['first-time'],
  },
  {
    id: 'lead-4',
    phone: '+79005555555',
    name: 'Елена Козлова',
    timezone: 'Europe/Moscow',
    language: 'ru',
    segment: 'Regular',
    consentSms: true,
    status: 'refused',
    blacklist: false,
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T12:45:00Z'),
    lastCallAt: new Date('2024-01-15T12:45:00Z'),
    tags: ['objections', 'timing-issues'],
  },
  {
    id: 'lead-5',
    phone: '+79001111111',
    name: 'Андрей Морозов',
    timezone: 'Europe/Moscow',
    language: 'ru',
    segment: 'VIP',
    consentSms: false,
    status: 'blacklisted',
    blacklist: true,
    createdAt: new Date('2024-01-14T15:00:00Z'),
    updatedAt: new Date('2024-01-15T10:20:00Z'),
    lastCallAt: new Date('2024-01-15T10:20:00Z'),
    tags: ['aggressive', 'do-not-call'],
  },
];

// Функция для генерации названий кампаний
const generateCampaignName = () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const scriptNum = Math.floor(Math.random() * 15) + 1;
  const baseNum = Math.floor(Math.random() * 9999) + 1000;
  return `${dateStr}: скрипт №${scriptNum}, база №${baseNum}`;
};

// Моковые кампании
export const mockCampaigns: Campaign[] = [
  {
    id: 'obz-1',
    name: 'Акция "Новый год 2025"',
    description: 'VIP клиенты - новогодние поздравления и предложения',
    source: 'segment',
    sourceConfig: {
      segmentId: 'vip-segment',
      filters: { minDeposit: 1000 }
    },
    scriptId: 'script-1',
    scriptVersion: 'A',
    callWindows: [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '18:00',
        timezone: 'Europe/Moscow'
      },
      {
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '18:00',
        timezone: 'Europe/Moscow'
      }
    ],
    attemptsPolicy: {
      no_answer: { maxAttempts: 3, intervalMinutes: 120 },
      busy: { maxAttempts: 2, intervalMinutes: 30 },
      voicemail: { action: 'retry', maxAttempts: 1, intervalMinutes: 240 }
    },
    concurrency: 5,
    priority: 8,
    state: 'running',
    category: 'acquisition',
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    startedAt: new Date('2024-01-15T10:00:00Z'),
    settings: {
      enableSms: true,
      autoEscalation: true,
      recordCalls: true,
      enableTranscription: true
    },
    stats: {
      totalLeads: 1250,
      processed: 847,
      successful: 623,
      refused: 224,
      pending: 403
    }
  },
  {
    id: 'obz-2',
    name: 'Реактивация неактивных',
    description: 'Возврат клиентов, не заходивших более 90 дней',
    source: 'csv',
    sourceConfig: {
      csvFile: 'inactive_users_90days.csv'
    },
    scriptId: 'script-2',
    scriptVersion: 'B',
    callWindows: [
      {
        dayOfWeek: 3,
        startTime: '10:00',
        endTime: '17:00',
        timezone: 'Europe/Moscow'
      }
    ],
    attemptsPolicy: {
      no_answer: { maxAttempts: 2, intervalMinutes: 180 },
      busy: { maxAttempts: 1, intervalMinutes: 60 },
      voicemail: { action: 'stop' }
    },
    concurrency: 3,
    priority: 5,
    state: 'paused',
    category: 'reactivation',
    createdAt: new Date('2024-01-12T14:00:00Z'),
    updatedAt: new Date('2024-01-15T11:30:00Z'),
    startedAt: new Date('2024-01-14T09:00:00Z'),
    settings: {
      enableSms: true,
      autoEscalation: false,
      recordCalls: true,
      enableTranscription: false
    },
    stats: {
      totalLeads: 2100,
      processed: 456,
      successful: 298,
      refused: 158,
      pending: 1644
    }
  },
  {
    id: 'obz-3',
    name: 'Холодная база январь',
    description: 'Знакомство с продуктом для новых лидов',
    source: 'manual',
    scriptId: 'script-3',
    scriptVersion: 'A',
    callWindows: [
      {
        dayOfWeek: 5,
        startTime: '11:00',
        endTime: '16:00',
        timezone: 'Europe/Moscow'
      }
    ],
    attemptsPolicy: {
      no_answer: { maxAttempts: 1, intervalMinutes: 60 },
      busy: { maxAttempts: 1, intervalMinutes: 30 },
      voicemail: { action: 'stop' }
    },
    concurrency: 2,
    priority: 3,
    state: 'draft',
    category: 'acquisition',
    createdAt: new Date('2024-01-15T12:00:00Z'),
    updatedAt: new Date('2024-01-15T12:00:00Z'),
    settings: {
      enableSms: false,
      autoEscalation: false,
      recordCalls: true,
      enableTranscription: true
    },
    stats: {
      totalLeads: 850,
      processed: 0,
      successful: 0,
      refused: 0,
      pending: 850
    }
  }
];

// Моковые звонки
export const mockCalls: Call[] = [
  {
    id: 'call-1',
    leadId: 'lead-1',
    campaignId: 'campaign-1',
    startedAt: new Date('2024-01-15T14:30:00Z'),
    endedAt: new Date('2024-01-15T14:37:30Z'),
    duration: 450,
    outcome: 'answer_success',
    consentSms: true,
    transcript: [
      {
        timestamp: 0,
        speaker: 'agent',
        text: 'Добрый день! Меня зовут Анна, я звоню от AIGAMING.BOT. У нас для вас специальное предложение.'
      },
      {
        timestamp: 8,
        speaker: 'client',
        text: 'Здравствуйте, слушаю вас.'
      },
      {
        timestamp: 12,
        speaker: 'agent',
        text: 'Мы подготовили для VIP клиентов эксклюзивный бонус 200% на депозит. Вас интересует?'
      },
      {
        timestamp: 25,
        speaker: 'client',
        text: 'Да, звучит интересно. А какие условия?'
      },
      {
        timestamp: 32,
        speaker: 'agent',
        text: 'Отлично! Могу отправить вам SMS с подробностями и ссылкой для активации. Согласны?'
      },
      {
        timestamp: 42,
        speaker: 'client',
        text: 'Да, конечно, отправляйте.'
      }
    ],
    audioUrl: '/demo/call-1-recording.mp3',
    summary: 'Клиент заинтересован в специальном предложении, дал согласие на SMS',
    tags: ['interested', 'vip-offer', 'consent-given'],
    attemptNumber: 1,
  },
  {
    id: 'call-2',
    leadId: 'lead-2',
    campaignId: 'campaign-1',
    startedAt: new Date('2024-01-15T13:15:00Z'),
    endedAt: new Date('2024-01-15T13:18:15Z'),
    duration: 195,
    outcome: 'answer_refuse',
    consentSms: false,
    transcript: [
      {
        timestamp: 0,
        speaker: 'agent',
        text: 'Добрый день! Меня зовут Анна, я звоню от AIGAMING.BOT.'
      },
      {
        timestamp: 6,
        speaker: 'client',
        text: 'Я не интересуюсь азартными играми, спасибо.'
      },
      {
        timestamp: 12,
        speaker: 'agent',
        text: 'Понимаю. А может быть вас заинтересуют спортивные ставки?'
      },
      {
        timestamp: 18,
        speaker: 'client',
        text: 'Нет, меня это совсем не интересует. Не звоните больше, пожалуйста.'
      }
    ],
    audioUrl: '/demo/call-2-recording.mp3',
    summary: 'Клиент категорически не заинтересован, просит не звонить',
    tags: ['not-interested', 'do-not-call-request'],
    attemptNumber: 1,
  },
  {
    id: 'call-3',
    leadId: 'lead-4',
    campaignId: 'campaign-2',
    startedAt: new Date('2024-01-15T12:45:00Z'),
    endedAt: new Date('2024-01-15T12:50:30Z'),
    duration: 330,
    outcome: 'answer_refuse',
    consentSms: false,
    transcript: [
      {
        timestamp: 0,
        speaker: 'agent',
        text: 'Здравствуйте! Звоню по поводу вашего аккаунта в казино.'
      },
      {
        timestamp: 8,
        speaker: 'client',
        text: 'Да, слушаю.'
      },
      {
        timestamp: 12,
        speaker: 'agent',
        text: 'Мы заметили, что вы давно не заходили. У нас есть специальное предложение для возврата.'
      },
      {
        timestamp: 22,
        speaker: 'client',
        text: 'Знаете, сейчас не лучшее время для игр. Может быть позже.'
      }
    ],
    audioUrl: '/demo/call-3-recording.mp3',
    summary: 'Клиент не готов играть сейчас, возможно заинтересуется позже',
    tags: ['timing-issues', 'maybe-later'],
    attemptNumber: 1,
    nextAttemptAt: new Date('2024-01-22T12:45:00Z'),
  },
  {
    id: 'call-4',
    leadId: 'lead-4',
    campaignId: 'campaign-2',
    startedAt: new Date('2024-01-15T11:15:00Z'),
    endedAt: new Date('2024-01-15T11:18:45Z'),
    duration: 225,
    outcome: 'answer_success',
    consentSms: true,
    transcript: [
      {
        timestamp: 0,
        speaker: 'agent',
        text: 'Здравствуйте! Звоню по поводу нашего предложения для клиентов.'
      },
      {
        timestamp: 5,
        speaker: 'client',
        text: 'Да, слушаю.'
      },
      {
        timestamp: 8,
        speaker: 'agent',
        text: 'У нас есть специальное предложение по возврату бонуса. Интересно?'
      },
      {
        timestamp: 15,
        speaker: 'client',
        text: 'Можете отправить детали по SMS.'
      }
    ],
    audioUrl: '/demo/call-4-recording.mp3',
    summary: 'Клиент согласился получить информацию по SMS',
    tags: ['interested', 'sms-requested'],
    attemptNumber: 1,
  },
  {
    id: 'call-5',
    leadId: 'lead-5',
    campaignId: 'campaign-1',
    startedAt: new Date('2024-01-15T13:22:00Z'),
    endedAt: new Date('2024-01-15T13:24:15Z'),
    duration: 135,
    outcome: 'no_answer',
    consentSms: false,
    transcript: [],
    audioUrl: '/demo/call-5-recording.mp3',
    summary: 'Не ответили на звонок',
    tags: ['no-answer'],
    attemptNumber: 1,
    nextAttemptAt: new Date('2024-01-15T15:22:00Z'),
  },
  {
    id: 'call-6',
    leadId: 'lead-1',
    campaignId: 'campaign-3',
    startedAt: new Date('2024-01-15T16:30:00Z'),
    endedAt: new Date('2024-01-15T16:35:20Z'),
    duration: 320,
    outcome: 'answer_refuse',
    consentSms: false,
    transcript: [
      {
        timestamp: 0,
        speaker: 'agent',
        text: 'Добрый день! Звоню с предложением по нашим услугам.'
      },
      {
        timestamp: 4,
        speaker: 'client',
        text: 'Не интересно, спасибо.'
      },
      {
        timestamp: 7,
        speaker: 'agent',
        text: 'Понимаю. Хорошего дня!'
      }
    ],
    audioUrl: '/demo/call-6-recording.mp3',
    summary: 'Клиент отказался от предложения',
    tags: ['refused', 'quick-refusal'],
    attemptNumber: 1,
  }
];

// Моковые задачи
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    leadId: 'lead-2',
    callId: 'call-2',
    title: 'Обработать отказ клиента',
    description: 'Клиент категорически отказался, просит не звонить. Нужно добавить в черный список.',
    reason: 'answer_refuse',
    priority: 'medium',
    status: 'pending',
    assigneeRole: 'manager',
    dueAt: new Date('2024-01-16T10:00:00Z'),
    createdAt: new Date('2024-01-15T13:20:00Z'),
    updatedAt: new Date('2024-01-15T13:20:00Z'),
  },
  {
    id: 'task-2',
    leadId: 'lead-4',
    callId: 'call-3',
    title: 'Запланировать повторный звонок',
    description: 'Клиент сказал "может быть позже". Запланировать звонок через неделю.',
    reason: 'maybe_later',
    priority: 'low',
    status: 'completed',
    assigneeRole: 'manager',
    dueAt: new Date('2024-01-16T14:00:00Z'),
    createdAt: new Date('2024-01-15T12:55:00Z'),
    updatedAt: new Date('2024-01-15T15:30:00Z'),
    completedAt: new Date('2024-01-15T15:30:00Z'),
  },
  {
    id: 'task-3',
    leadId: 'lead-1',
    title: 'Проверить регистрацию',
    description: 'Клиент получил SMS, но регистрация не завершена. Связаться для уточнения.',
    reason: 'incomplete_registration',
    priority: 'high',
    status: 'in_progress',
    assigneeRole: 'manager',
    assigneeId: 'manager-1',
    dueAt: new Date('2024-01-16T09:00:00Z'),
    createdAt: new Date('2024-01-15T16:00:00Z'),
    updatedAt: new Date('2024-01-15T17:00:00Z'),
  }
];

// Моковые SMS шаблоны
export const mockSmsTemplates: SmsTemplate[] = [
  {
    id: 'template-1',
    name: 'Специальный бонус VIP',
    text: 'Привет, {name}! Твой эксклюзивный бонус 200% ждет активации: {link}. {brand}',
    variables: ['name', 'link', 'brand'],
    category: 'promotion',
    language: 'ru',
    isActive: true,
  },
  {
    id: 'template-2',
    name: 'Возврат неактивных',
    text: 'Скучаем по тебе, {name}! Специальное предложение для возврата: {link}. {brand}',
    variables: ['name', 'link', 'brand'],
    category: 'reactivation',
    language: 'ru',
    isActive: true,
  },
  {
    id: 'template-3',
    name: 'Подтверждение регистрации',
    text: '{name}, завершите регистрацию и получите бонус: {link}. Поддержка: {support}. {brand}',
    variables: ['name', 'link', 'support', 'brand'],
    category: 'confirmation',
    language: 'ru',
    isActive: true,
  }
];

// Моковые SMS
export const mockSms: Sms[] = [
  {
    id: 'sms-1',
    leadId: 'lead-1',
    templateId: 'template-1',
    text: 'Привет, Алексей! Твой эксклюзивный бонус 200% ждет активации: https://aigaming.bot/bonus/special2024. AIGAMING.BOT',
    status: 'delivered',
    sentAt: new Date('2024-01-15T14:40:00Z'),
    deliveredAt: new Date('2024-01-15T14:40:30Z'),
  },
  {
    id: 'sms-2',
    leadId: 'lead-3',
    templateId: 'template-2',
    text: 'Скучаем по тебе, Дмитрий! Специальное предложение для возврата: https://aigaming.bot/return. AIGAMING.BOT',
    status: 'sent',
    sentAt: new Date('2024-01-15T15:00:00Z'),
  }
];

// Моковые скрипты
export const mockScripts: Script[] = [
  {
    id: 'script-1',
    name: 'Скрипт привлечения №1',
    description: 'Скрипт для привлечения VIP клиентов',
    version: '1.0',
    isActive: true,
    language: 'ru',
    nodes: [
      {
        id: 'start',
        type: 'message',
        content: 'Добрый день! Меня зовут {agent_name}, я звоню от {brand}. У нас для вас специальное предложение.',
        variables: ['agent_name', 'brand'],
        branches: { continue: 'offer' }
      },
      {
        id: 'offer',
        type: 'question',
        content: 'Мы подготовили для VIP клиентов эксклюзивный бонус 200% на депозит. Вас интересует?',
        branches: { 
          yes: 'consent', 
          no: 'objection',
          maybe: 'clarify'
        }
      },
      {
        id: 'consent',
        type: 'question',
        content: 'Отлично! Могу отправить вам SMS с подробностями и ссылкой для активации. Согласны?',
        branches: { 
          yes: 'success',
          no: 'no_sms'
        }
      },
      {
        id: 'success',
        type: 'action',
        content: 'Спасибо! SMS будет отправлена в течение минуты. Хорошего дня!',
        actions: [
          { type: 'set_consent', value: true },
          { type: 'end_call', value: 'answer_success' }
        ]
      }
    ],
    startNodeId: 'start',
    createdAt: new Date('2024-01-10T10:00:00Z'),
    updatedAt: new Date('2024-01-12T15:00:00Z'),
  }
];

// Моковые правила автоматизации
export const mockAutomationRules: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'Отправка SMS при согласии',
    trigger: {
      event: 'call_completed',
      conditions: [
        { field: 'outcome', operator: 'equals', value: 'answer_success' },
        { field: 'consentSms', operator: 'equals', value: true }
      ]
    },
    actions: [
      {
        type: 'send_sms',
        config: {
          templateId: 'template-1',
          delay: 60 // секунд
        }
      }
    ],
    isActive: true,
    priority: 1
  },
  {
    id: 'rule-2',
    name: 'Создание задачи при отказе',
    trigger: {
      event: 'call_completed',
      conditions: [
        { field: 'outcome', operator: 'equals', value: 'answer_refuse' }
      ]
    },
    actions: [
      {
        type: 'create_task',
        config: {
          title: 'Обработать отказ клиента',
          priority: 'medium',
          assigneeRole: 'manager',
          dueHours: 24
        }
      }
    ],
    isActive: true,
    priority: 2
  }
];

// Права доступа по ролям
export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    role: 'admin',
    permissions: {
      campaigns: { view: true, create: true, edit: true, start: true, pause: true, delete: true },
      leads: { view: true, edit: true, delete: true, export: true },
      calls: { view: true, listen: true, transcript: true, edit_outcome: true },
      tasks: { view: true, create: true, assign: true, complete: true },
      sms: { send: true, view_templates: true, edit_templates: true },
      scripts: { view: true, edit: true, create: true },
      analytics: { view: true, export: true }
    }
  },
  marketer: {
    role: 'marketer',
    permissions: {
      campaigns: { view: true, create: true, edit: true, start: true, pause: true, delete: false },
      leads: { view: true, edit: false, delete: false, export: true },
      calls: { view: true, listen: false, transcript: true, edit_outcome: false },
      tasks: { view: true, create: true, assign: false, complete: false },
      sms: { send: false, view_templates: true, edit_templates: false },
      scripts: { view: true, edit: false, create: false },
      analytics: { view: true, export: true }
    }
  },
  supervisor: {
    role: 'supervisor',
    permissions: {
      campaigns: { view: true, create: false, edit: false, start: true, pause: true, delete: false },
      leads: { view: true, edit: true, delete: false, export: true },
      calls: { view: true, listen: true, transcript: true, edit_outcome: true },
      tasks: { view: true, create: true, assign: true, complete: true },
      sms: { send: true, view_templates: true, edit_templates: false },
      scripts: { view: true, edit: false, create: false },
      analytics: { view: true, export: false }
    }
  },
  manager: {
    role: 'manager',
    permissions: {
      campaigns: { view: true, create: false, edit: false, start: false, pause: false, delete: false },
      leads: { view: true, edit: true, delete: false, export: false },
      calls: { view: true, listen: true, transcript: true, edit_outcome: true },
      tasks: { view: true, create: true, assign: false, complete: true },
      sms: { send: true, view_templates: true, edit_templates: false },
      scripts: { view: true, edit: false, create: false },
      analytics: { view: false, export: false }
    }
  }
};

// Моковые метрики кампаний
export const mockCampaignMetrics: Record<string, CampaignMetrics> = {
  'campaign-1': {
    totalCalls: 45,
    successfulCalls: 12,
    answerRate: 73.3,
    successRate: 26.7,
    smsConsentRate: 75.0,
    refusalRate: 17.8,
    averageCallDuration: 285,
    costPerLead: 125.50,
    registrationRate: 58.3
  },
  'campaign-2': {
    totalCalls: 85,
    successfulCalls: 15,
    answerRate: 65.9,
    successRate: 17.6,
    smsConsentRate: 46.7,
    refusalRate: 29.4,
    averageCallDuration: 195,
    costPerLead: 89.20,
    registrationRate: 33.3
  },
  'campaign-3': {
    totalCalls: 0,
    successfulCalls: 0,
    answerRate: 0,
    successRate: 0,
    smsConsentRate: 0,
    refusalRate: 0,
    averageCallDuration: 0,
    costPerLead: 0,
    registrationRate: 0
  }
};

// Статус очереди
export const mockQueueStatus: QueueStatus = {
  active: 8,
  waiting: 2047, // 403 + 1644 (из активных и приостановленных кампаний)
  errors: 3,
  totalProcessed: 1303 // 847 + 456 (обработанные из активных кампаний)
};

// Настройки приложения по умолчанию
export const defaultAppSettings: AppSettings = {
  currentUser: {
    role: 'admin',
    permissions: rolePermissions.admin
  },
  brands: ['AIGAMING.BOT', 'LuckyWheel', 'GoldenPlay'],
  selectedBrand: 'AIGAMING.BOT',
  brandEnabled: true
};

// Утилиты для работы с моковыми данными
export const mockDataUtils = {
  // Получить лиды по кампании
  getLeadsByCampaign: (campaignId: string): Lead[] => {
    return mockLeads.filter(lead => {
      const call = mockCalls.find(c => c.leadId === lead.id);
      return call?.campaignId === campaignId;
    });
  },

  // Получить звонки по лиду
  getCallsByLead: (leadId: string): Call[] => {
    return mockCalls.filter(call => call.leadId === leadId);
  },

  // Получить задачи по лиду
  getTasksByLead: (leadId: string): Task[] => {
    return mockTasks.filter(task => task.leadId === leadId);
  },

  // Получить SMS по лиду
  getSmsByLead: (leadId: string): Sms[] => {
    return mockSms.filter(sms => sms.leadId === leadId);
  },

  // Обновить статус лида
  updateLeadStatus: (leadId: string, status: Lead['status']) => {
    const lead = mockLeads.find(l => l.id === leadId);
    if (lead) {
      lead.status = status;
      lead.updatedAt = new Date();
    }
  },

  // Обновить состояние кампании
  updateCampaignState: (campaignId: string, state: Campaign['state']) => {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.state = state;
      campaign.updatedAt = new Date();
      if (state === 'running' && !campaign.startedAt) {
        campaign.startedAt = new Date();
      }
    }
  },

  // Создать новую задачу
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockTasks.push(newTask);
    return newTask;
  },

  // Отправить SMS
  sendSms: (leadId: string, templateId: string, variables: Record<string, string>) => {
    const template = mockSmsTemplates.find(t => t.id === templateId);
    if (!template) return null;

    let text = template.text;
    template.variables.forEach(variable => {
      text = text.replace(`{${variable}}`, variables[variable] || '');
    });

    const newSms: Sms = {
      id: `sms-${Date.now()}`,
      leadId,
      templateId,
      text,
      status: 'sent',
      sentAt: new Date()
    };
    
    mockSms.push(newSms);
    return newSms;
  }
};

// Моковые данные для голосов
export const mockVoices: Voice[] = [
  {
    id: 'voice-anna-1',
    name: 'Анна (дружелюбная)',
    gender: 'female',
    language: 'ru-RU',
    style: 'friendly',
    provider: 'elevenlabs',
    sampleUrl: '/samples/anna-friendly.mp3',
    settings: {
      speed: 1.0,
      pitch: 0,
      volume: 0.8,
      stability: 0.75
    }
  },
  {
    id: 'voice-anna-2',
    name: 'Анна (деловая)',
    gender: 'female',
    language: 'ru-RU',
    style: 'formal',
    provider: 'elevenlabs',
    sampleUrl: '/samples/anna-formal.mp3',
    settings: {
      speed: 0.95,
      pitch: -2,
      volume: 0.8,
      stability: 0.8
    }
  },
  {
    id: 'voice-mikhail-1',
    name: 'Михаил (деловой)',
    gender: 'male',
    language: 'ru-RU',
    style: 'formal',
    provider: 'elevenlabs',
    sampleUrl: '/samples/mikhail-formal.mp3',
    settings: {
      speed: 0.9,
      pitch: -5,
      volume: 0.85,
      stability: 0.85
    }
  },
  {
    id: 'voice-elena-1',
    name: 'Елена (профессиональная)',
    gender: 'female',
    language: 'ru-RU',
    style: 'formal',
    provider: 'yandex',
    sampleUrl: '/samples/elena-professional.mp3',
    settings: {
      speed: 1.0,
      pitch: 0,
      volume: 0.8,
      stability: 0.8
    }
  },
  {
    id: 'voice-dmitry-1',
    name: 'Дмитрий (энергичный)',
    gender: 'male',
    language: 'ru-RU',
    style: 'energetic',
    provider: 'elevenlabs',
    sampleUrl: '/samples/dmitry-energetic.mp3',
    settings: {
      speed: 1.1,
      pitch: 2,
      volume: 0.9,
      stability: 0.7
    }
  }
];

// Моковые данные для агентов
export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Анна - Регистрация',
    description: 'Агент для регистрации новых пользователей',
    role: 'registration_agent',
    voiceId: 'voice-anna-1',
    status: 'active',
    campaigns: ['obz-1', 'obz-3'],
    settings: {
      responseDelay: 500,
      maxSilenceDuration: 3,
      interruptionHandling: true
    },
    prompts: [
      {
        id: 'prompt-1',
        stage: 'greeting',
        title: 'Приветствие',
        prompt: 'Здравствуйте! Меня зовут Анна, я звоню от компании. У вас есть минутка для разговора?',
        conditions: [
          {
            if: 'время_дня == утро',
            then: 'Доброе утро! Меня зовут Анна...'
          },
          {
            if: 'время_дня == вечер',
            then: 'Добрый вечер! Меня зовут Анна...'
          }
        ],
        fallback: 'Здравствуйте! Меня зовут Анна, я звоню от компании.'
      },
      {
        id: 'prompt-2',
        stage: 'consent_question',
        title: 'Вопрос о согласии',
        prompt: 'Мы предлагаем вам зарегистрироваться на нашей платформе. Могу я отправить вам ссылку для регистрации по SMS?',
        fallback: 'Хотели бы вы получить информацию о регистрации?'
      },
      {
        id: 'prompt-3',
        stage: 'rejection_response',
        title: 'Ответ на отказ',
        prompt: 'Понимаю. Возможно, вас заинтересует в будущем. Хорошего дня!',
        fallback: 'Спасибо за время. До свидания!'
      }
    ],
    createdAt: new Date('2024-01-10T10:00:00Z'),
    updatedAt: new Date('2024-01-15T14:30:00Z'),
    version: 2,
    createdBy: 'admin'
  },
  {
    id: 'agent-2',
    name: 'Михаил - Реактивация',
    description: 'Агент для возврата неактивных клиентов',
    role: 'reactivation_agent',
    voiceId: 'voice-mikhail-1',
    status: 'active',
    campaigns: ['obz-2'],
    settings: {
      responseDelay: 300,
      maxSilenceDuration: 4,
      interruptionHandling: true
    },
    prompts: [
      {
        id: 'prompt-4',
        stage: 'greeting',
        title: 'Приветствие',
        prompt: 'Здравствуйте! Это Михаил из компании. Мы заметили, что вы давно не заходили к нам. Хотел предложить специальное предложение.',
        fallback: 'Здравствуйте! Это Михаил, у нас есть специальное предложение для вас.'
      },
      {
        id: 'prompt-5',
        stage: 'offer_presentation',
        title: 'Презентация предложения',
        prompt: 'Мы приготовили для вас персональный бонус 100% к депозиту. Интересно?',
        fallback: 'У нас есть специальный бонус для вас.'
      }
    ],
    createdAt: new Date('2024-01-12T09:00:00Z'),
    updatedAt: new Date('2024-01-14T16:00:00Z'),
    version: 1,
    createdBy: 'admin'
  },
  {
    id: 'agent-3',
    name: 'Елена - Холодные звонки',
    description: 'Агент для работы с холодной базой',
    role: 'cold_calling_agent',
    voiceId: 'voice-elena-1',
    status: 'inactive',
    campaigns: [],
    settings: {
      responseDelay: 700,
      maxSilenceDuration: 2,
      interruptionHandling: false
    },
    prompts: [
      {
        id: 'prompt-6',
        stage: 'greeting',
        title: 'Приветствие',
        prompt: 'Добрый день! Меня зовут Елена. Я представляю компанию, которая специализируется на...',
        fallback: 'Добрый день! Это Елена из компании.'
      }
    ],
    createdAt: new Date('2024-01-05T15:00:00Z'),
    updatedAt: new Date('2024-01-05T15:00:00Z'),
    version: 1,
    createdBy: 'admin'
  }
];

// Каталог голосов
export const mockVoiceLibrary: VoiceLibrary = {
  voices: mockVoices,
  categories: [
    {
      id: 'female-friendly',
      name: 'Женские дружелюбные',
      description: 'Теплые женские голоса для клиентского сервиса',
      voiceIds: ['voice-anna-1']
    },
    {
      id: 'female-formal',
      name: 'Женские деловые',
      description: 'Профессиональные женские голоса',
      voiceIds: ['voice-anna-2', 'voice-elena-1']
    },
    {
      id: 'male-formal',
      name: 'Мужские деловые',
      description: 'Авторитетные мужские голоса',
      voiceIds: ['voice-mikhail-1']
    },
    {
      id: 'male-energetic',
      name: 'Мужские энергичные',
      description: 'Динамичные мужские голоса для активных продаж',
      voiceIds: ['voice-dmitry-1']
    }
  ]
};
