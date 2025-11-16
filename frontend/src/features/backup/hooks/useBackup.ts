import { useState, useCallback } from 'react';
import { message } from 'antd';
import { backupService } from '../services/backupService';
import { useAuth } from '../../../contexts/AuthContext';

export const useBackup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [activeBackup, setActiveBackup] = useState<any>(null);
  const { user } = useAuth();

  const createBackup = useCallback(async () => {
    if (!user) {
      message.error('You must be logged in to create a backup');
      return null;
    }

    try {
      setIsLoading(true);
      const backup = await backupService.createBackup(user.id);
      message.success('Backup created successfully');
      return backup;
    } catch (error) {
      console.error('Failed to create backup:', error);
      message.error('Failed to create backup');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const restoreBackup = useCallback(async (backupId: string) => {
    try {
      setIsLoading(true);
      const success = await backupService.restoreBackup(backupId);
      if (success) {
        message.success('Backup restored successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      message.error('Failed to restore backup');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBackup = useCallback(async (backupId: string) => {
    try {
      setIsLoading(true);
      const success = await backupService.deleteBackup(backupId);
      if (success) {
        setBackups(prev => prev.filter(b => b.id !== backupId));
        message.success('Backup deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      message.error('Failed to delete backup');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const scheduleBackup = useCallback(async (frequency: 'daily' | 'weekly' | 'monthly') => {
    if (!user) {
      message.error('You must be logged in to schedule backups');
      return null;
    }

    try {
      setIsLoading(true);
      const jobId = await backupService.scheduleBackup(user.id, frequency);
      message.success(`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} backup scheduled`);
      return jobId;
    } catch (error) {
      console.error('Failed to schedule backup:', error);
      message.error('Failed to schedule backup');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchBackups = useCallback(async () => {
    if (!user) return [];

    try {
      setIsLoading(true);
      const userBackups = await backupService.getBackups(user.id);
      setBackups(userBackups);
      return userBackups;
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      message.error('Failed to fetch backups');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    backups,
    activeBackup,
    setActiveBackup,
    createBackup,
    restoreBackup,
    deleteBackup,
    scheduleBackup,
    fetchBackups,
  };
};
