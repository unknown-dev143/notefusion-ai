import { Reminder, CreateReminderDto, UpdateReminderDto, ReminderListResponse } from '../types';
import { api } from '../../../lib/api';

export const getReminders = async (params?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<Reminder[]> => {
  const response = await api.get<ReminderListResponse>('/reminders', { params });
  return response.data.data;
};

export const getUpcomingReminders = async (): Promise<Reminder[]> => {
  const response = await api.get<Reminder[]>('/reminders/upcoming');
  return response.data;
};

export const getReminder = async (id: number): Promise<Reminder> => {
  const response = await api.get<Reminder>(`/reminders/${id}`);
  return response.data;
};

export const createReminder = async (data: CreateReminderDto): Promise<Reminder> => {
  const response = await api.post<Reminder>('/reminders', data);
  return response.data;
};

export const updateReminder = async (id: number, data: UpdateReminderDto): Promise<Reminder> => {
  const response = await api.put<Reminder>(`/reminders/${id}`, data);
  return response.data;
};

export const deleteReminder = async (id: number): Promise<void> => {
  await api.delete(`/reminders/${id}`);
};

export const updateReminderStatus = async (id: number, status: string): Promise<Reminder> => {
  const response = await api.post<Reminder>(`/reminders/${id}/${status.toLowerCase()}`);
  return response.data;
};

export const completeReminder = async (id: number): Promise<Reminder> => {
  return updateReminderStatus(id, 'complete');
};

export const dismissReminder = async (id: number): Promise<Reminder> => {
  return updateReminderStatus(id, 'dismiss');
};
