export enum ReminderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  DISMISSED = 'DISMISSED',
  EXPIRED = 'EXPIRED',
}

export enum ReminderType {
  NOTE = 'NOTE',
  TASK = 'TASK',
  DEADLINE = 'DEADLINE',
  MEETING = 'MEETING',
  CUSTOM = 'CUSTOM',
}

export enum ReminderRecurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export interface Reminder {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  reminder_type: ReminderType;
  due_date: string; // ISO string
  is_recurring: boolean;
  recurrence_rule?: ReminderRecurrence;
  custom_recurrence?: string; // iCalendar RRULE format
  status: ReminderStatus;
  send_email: boolean;
  send_push: boolean;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  note_id?: number;
  task_id?: number;
}

export interface CreateReminderDto {
  title: string;
  description?: string;
  reminder_type: ReminderType;
  due_date: string; // ISO string
  is_recurring: boolean;
  recurrence_rule?: ReminderRecurrence;
  custom_recurrence?: string;
  send_email: boolean;
  send_push: boolean;
  note_id?: number;
  task_id?: number;
}

export interface UpdateReminderDto extends Partial<CreateReminderDto> {
  status?: ReminderStatus;
}

export interface ReminderListResponse {
  data: Reminder[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
