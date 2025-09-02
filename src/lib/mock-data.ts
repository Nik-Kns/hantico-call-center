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

// Моковые кампании
export const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Новогодняя акция VIP',
    description: 'Привлечение VIP клиентов с новогодними бонусами',
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
      totalLeads: 150,
      processed: 45,
      successful: 12,
      refused: 8,
      pending: 105
    }
  },
  {
    id: 'campaign-2',
    name: 'Реактивация неактивных',
    description: 'Возврат клиентов, не заходивших более 30 дней',
    source: 'csv',
    sourceConfig: {
      csvFile: 'inactive_users_jan2024.csv'
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
      totalLeads: 200,
      processed: 85,
      successful: 15,
      refused: 25,
      pending: 115
    }
  },
  {
    id: 'campaign-3',
    name: 'Тестовая кампания',
    description: 'A/B тестирование нового скрипта',
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
      totalLeads: 50,
      processed: 0,
      successful: 0,
      refused: 0,
      pending: 50
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
        text: 'Добрый день! Меня зовут Анна, я звоню от AIGAMING.BOT. У нас для вас специальное новогоднее предложение.'
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
    summary: 'Клиент заинтересован в новогоднем предложении, дал согласие на SMS',
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
    name: 'Новогодний бонус VIP',
    text: 'Привет, {name}! Твой эксклюзивный новогодний бонус 200% ждет активации: {link}. {brand}',
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
    text: 'Привет, Алексей! Твой эксклюзивный новогодний бонус 200% ждет активации: https://aigaming.bot/bonus/ny2024. AIGAMING.BOT',
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
    name: 'Новогодняя акция VIP',
    description: 'Скрипт для привлечения VIP клиентов',
    version: '1.0',
    isActive: true,
    language: 'ru',
    nodes: [
      {
        id: 'start',
        type: 'message',
        content: 'Добрый день! Меня зовут {agent_name}, я звоню от {brand}. У нас для вас специальное новогоднее предложение.',
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
  waiting: 127,
  errors: 3,
  totalProcessed: 245
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
