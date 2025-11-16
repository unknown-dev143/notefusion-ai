import { Reminder, CreateReminderDto, UpdateReminderDto, ReminderListResponse } from '../types';
import { apiClient } from '@/lib/api';

export const getReminders = async (params?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<Reminder[]> => {
  const response = await apiClient.get<ReminderListResponse>('/api/v1/reminders', { params });
  return response.data.data;
};

export const getUpcomingReminders = async (): Promise<Reminder[]> => {
  const response = await apiClient.get<Reminder[]>('/api/v1/reminders/upcoming');
  return response.data;
};

export const getReminder = async (id: number): Promise<Reminder> => {
  const response = await apiClient.get<Reminder>(`/api/v1/reminders/${id}`);
  return response.data;
};

export const createReminder = async (data: CreateReminderDto): Promise<Reminder> => {
  const response = await apiClient.post<Reminder>('/api/v1/reminders', data);
  return response.data;
};

export const updateReminder = async (id: number, data: UpdateReminderDto): Promise<Reminder> => {
  const response = await apiClient.put<Reminder>(`/api/v1/reminders/${id}`, data);
  return response.data;
};

export const deleteReminder = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/v1/reminders/${id}`);
};

export const updateReminderStatus = async (id: number, status: string): Promise<Reminder> => {
  const response = await apiClient.post<Reminder>(`/api/v1/reminders/${id}/${status.toLowerCase()}`);
  return response.data;
};

export const completeReminder = async (id: number): Promise<Reminder> => {
  return updateReminderStatus(id, 'complete');
};

export const dismissReminder = async (id: number): Promise<Reminder> => {
  return updateReminderStatus(id, 'dismiss');
};
