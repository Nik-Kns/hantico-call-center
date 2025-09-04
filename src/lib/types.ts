// Роли пользователей
export type UserRole = 'admin' | 'marketer' | 'supervisor' | 'manager';

// Статусы лидов
export type LeadStatus = 
  | 'new' 
  | 'in_queue' 
  | 'calling' 
  | 'called' 
  | 'success' 
  | 'refused' 
  | 'blacklisted' 
  | 'registered';

// Исходы звонков
export type CallOutcome = 
  | 'answer_success' 
  | 'answer_refuse' 
  | 'no_answer' 
  | 'busy' 
  | 'voicemail' 
  | 'invalid' 
  | 'blacklist';

// Состояния кампаний
export type CampaignState = 'running' | 'paused' | 'stopped' | 'draft';

// Приоритеты задач
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Статусы задач
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Статусы SMS
export type SmsStatus = 'pending' | 'sent' | 'delivered' | 'failed';

// Категории кампаний
export type CampaignCategory = 'acquisition' | 'retention' | 'reactivation';

// Сущность Lead/Контакт
export interface Lead {
  id: string;
  phone: string;
  name?: string;
  timezone?: string;
  language?: string;
  segment?: string;
  consentSms: boolean;
  status: LeadStatus;
  blacklist: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastCallAt?: Date;
  registrationDate?: Date;
  tags: string[];
  metadata?: Record<string, any>;
}

// Политика повторных попыток
export interface AttemptsPolicy {
  no_answer: {
    maxAttempts: number;
    intervalMinutes: number;
  };
  busy: {
    maxAttempts: number;
    intervalMinutes: number;
  };
  voicemail: {
    action: 'stop' | 'retry';
    maxAttempts?: number;
    intervalMinutes?: number;
  };
}

// Окна дозвона
export interface CallWindow {
  dayOfWeek: number; // 0-6 (Понедельник-Воскресенье)
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  timezone: string;
}

// Сущность Campaign
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  source: 'csv' | 'segment' | 'manual';
  sourceConfig?: {
    csvFile?: string;
    segmentId?: string;
    filters?: Record<string, any>;
  };
  scriptId: string;
  scriptVersion: 'A' | 'B';
  callWindows: CallWindow[];
  attemptsPolicy: AttemptsPolicy;
  concurrency: number; // Параллельность звонков
  priority: number; // 1-10
  state: CampaignState;
  category: CampaignCategory;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  settings: {
    enableSms: boolean;
    autoEscalation: boolean;
    recordCalls: boolean;
    enableTranscription: boolean;
  };
  stats: {
    totalLeads: number;
    processed: number;
    successful: number;
    refused: number;
    pending: number;
  };
}

// Транскрипт с таймкодами
export interface TranscriptSegment {
  timestamp: number; // секунды от начала
  speaker: 'agent' | 'client';
  text: string;
}

// Сущность Call/CDR
export interface Call {
  id: string;
  leadId: string;
  campaignId: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number; // секунды
  outcome: CallOutcome;
  consentSms: boolean;
  transcript?: TranscriptSegment[];
  audioUrl?: string;
  summary?: string;
  tags: string[];
  agentNotes?: string;
  attemptNumber: number;
  nextAttemptAt?: Date;
  metadata?: Record<string, any>;
}

// Сущность Task
export interface Task {
  id: string;
  leadId: string;
  callId?: string;
  title: string;
  description?: string;
  reason: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeRole?: UserRole;
  assigneeId?: string;
  dueAt: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

// Шаблон SMS
export interface SmsTemplate {
  id: string;
  name: string;
  text: string;
  variables: string[]; // ['name', 'link', 'brand']
  category: string;
  language: string;
  isActive: boolean;
}

// Сущность SMS
export interface Sms {
  id: string;
  leadId: string;
  templateId: string;
  text: string; // Текст с подставленными переменными
  status: SmsStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

// Узел скрипта
export interface ScriptNode {
  id: string;
  type: 'message' | 'question' | 'condition' | 'action';
  content: string;
  variables?: string[]; // для подстановки {name}, {brand}
  branches?: {
    [key: string]: string; // ключ ответа -> id следующего узла
  };
  actions?: {
    type: 'set_tag' | 'set_consent' | 'end_call';
    value: any;
  }[];
}

// Сущность Script
export interface Script {
  id: string;
  name: string;
  description?: string;
  version: string;
  isActive: boolean;
  language: string;
  nodes: ScriptNode[];
  startNodeId: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Правило автоматизации
export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    event: 'call_completed' | 'task_created' | 'sms_sent';
    conditions: {
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }[];
  };
  actions: {
    type: 'send_sms' | 'create_task' | 'update_lead' | 'schedule_call';
    config: Record<string, any>;
  }[];
  isActive: boolean;
  priority: number;
}

// Права доступа по ролям
export interface RolePermissions {
  role: UserRole;
  permissions: {
    campaigns: {
      view: boolean;
      create: boolean;
      edit: boolean;
      start: boolean;
      pause: boolean;
      delete: boolean;
    };
    leads: {
      view: boolean;
      edit: boolean;
      delete: boolean;
      export: boolean;
    };
    calls: {
      view: boolean;
      listen: boolean;
      transcript: boolean;
      edit_outcome: boolean;
    };
    tasks: {
      view: boolean;
      create: boolean;
      assign: boolean;
      complete: boolean;
    };
    sms: {
      send: boolean;
      view_templates: boolean;
      edit_templates: boolean;
    };
    scripts: {
      view: boolean;
      edit: boolean;
      create: boolean;
    };
    analytics: {
      view: boolean;
      export: boolean;
    };
  };
}

// Фильтры для различных списков
export interface LeadFilters {
  status?: LeadStatus[];
  segment?: string[];
  campaign?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  consentSms?: boolean;
  blacklist?: boolean;
}

export interface CallFilters {
  outcome?: CallOutcome[];
  campaign?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  duration?: {
    min?: number;
    max?: number;
  };
  consentSms?: boolean;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
  dueDate?: {
    from: Date;
    to: Date;
  };
}

// Метрики дашборда
export interface CampaignMetrics {
  totalCalls: number;
  successfulCalls: number;
  answerRate: number; // %
  successRate: number; // %
  smsConsentRate: number; // %
  refusalRate: number; // %
  averageCallDuration: number; // секунды
  costPerLead: number;
  registrationRate: number; // %
}

export interface QueueStatus {
  active: number;
  waiting: number;
  errors: number;
  totalProcessed: number;
}

// Настройки приложения
export interface AppSettings {
  currentUser: {
    role: UserRole;
    permissions: RolePermissions;
  };
  brands: string[];
  selectedBrand?: string;
  brandEnabled: boolean;
}

// Агенты и голоса
export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  style: 'formal' | 'friendly' | 'energetic' | 'calm';
  sampleUrl?: string;
  provider: 'elevenlabs' | 'yandex' | 'custom';
  settings: {
    speed: number; // 0.5 - 2.0
    pitch: number; // -20 - +20
    volume: number; // 0.0 - 1.0
    stability: number; // 0.0 - 1.0
  };
}

export interface AgentPrompt {
  id: string;
  stage: string; // 'greeting', 'consent_question', 'rejection_response', etc.
  title: string;
  prompt: string;
  conditions?: {
    if: string; // условие
    then: string; // что говорить
  }[];
  fallback?: string; // что говорить если условие не сработало
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  role: string; // 'registration_agent', 'reminder_agent', etc.
  voiceId: string;
  status: 'active' | 'inactive' | 'archived';
  prompts: AgentPrompt[];
  campaigns: string[]; // ID кампаний где используется
  settings: {
    responseDelay: number; // задержка ответа в мс
    maxSilenceDuration: number; // максимальная тишина в сек
    interruptionHandling: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  version: number;
  createdBy: string;
}

export interface AgentTest {
  id: string;
  agentId: string;
  userInput: string;
  agentResponse: string;
  stage: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface VoiceLibrary {
  voices: Voice[];
  categories: {
    id: string;
    name: string;
    description: string;
    voiceIds: string[];
  }[];
}
