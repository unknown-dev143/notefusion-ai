import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { Plus, Bell, Clock, Check, X, Calendar, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Reminder, ReminderStatus, ReminderType } from '../types';
import { getReminders, updateReminderStatus, deleteReminder } from '../api/reminders';
import { ReminderForm } from './ReminderForm';
import { useToast } from '@/components/ui/use-toast';

type FilterType = 'all' | 'upcoming' | 'overdue' | 'completed' | 'dismissed';

const statusVariant = {
  [ReminderStatus.PENDING]: 'outline',
  [ReminderStatus.COMPLETED]: 'success',
  [ReminderStatus.DISMISSED]: 'secondary',
  [ReminderStatus.EXPIRED]: 'destructive',
} as const;

const typeIcon = {
  [ReminderType.NOTE]: '📝',
  [ReminderType.TASK]: '✅',
  [ReminderType.DEADLINE]: '⏰',
  [ReminderType.MEETING]: '👥',
  [ReminderType.CUSTOM]: '🔔',
};

export function ReminderList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  
  // Fetch reminders
  const { data: reminders = [], isLoading, error } = useQuery({
    queryKey: ['reminders'],
    queryFn: getReminders,
  });

  // Filter reminders based on the selected filter
  const filteredReminders = reminders.filter(reminder => {
    const now = new Date();
    const dueDate = new Date(reminder.due_date);
    
    switch (filter) {
      case 'upcoming':
        return reminder.status === ReminderStatus.PENDING && isAfter(dueDate, now);
      case 'overdue':
        return reminder.status === ReminderStatus.PENDING && isBefore(dueDate, now);
      case 'completed':
        return reminder.status === ReminderStatus.COMPLETED;
      case 'dismissed':
        return reminder.status === ReminderStatus.DISMISSED;
      default:
        return true;
    }
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReminderStatus }) => 
      updateReminderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({
        title: 'Reminder updated',
        description: 'The reminder status has been updated.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({
        title: 'Reminder deleted',
        description: 'The reminder has been deleted.',
      });
    },
  });

  const handleComplete = (id: number) => {
    updateStatusMutation.mutate({ id, status: ReminderStatus.COMPLETED });
  };

  const handleDismiss = (id: number) => {
    updateStatusMutation.mutate({ id, status: ReminderStatus.DISMISSED });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsFormOpen(true);
  };

  if (isLoading) return <div>Loading reminders...</div>;
  if (error) return <div>Error loading reminders</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Reminders</h2>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            {filteredReminders.length}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('upcoming')}>Upcoming</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('overdue')}>Overdue</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('completed')}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('dismissed')}>Dismissed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => {
            setEditingReminder(null);
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Reminder
          </Button>
        </div>
      </div>

      {filteredReminders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No reminders found</h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'all' 
                ? 'You don\'t have any reminders yet.' 
                : `You don't have any ${filter} reminders.`}
            </p>
            <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{typeIcon[reminder.reminder_type]}</span>
                      {reminder.title}
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {reminder.description.length > 50 
                          ? `${reminder.description.substring(0, 50)}...` 
                          : reminder.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {reminder.reminder_type.toLowerCase()}
                    </Badge>
                    {reminder.is_recurring && (
                      <Badge variant="outline" className="ml-2">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(parseISO(reminder.due_date), 'MMM d, yyyy h:mm a')}
                    </div>
                    {isBefore(new Date(reminder.due_date), new Date()) && 
                     reminder.status === ReminderStatus.PENDING && (
                      <Badge variant="destructive" className="mt-1">
                        Overdue
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[reminder.status]}>
                      {reminder.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {reminder.status === ReminderStatus.PENDING && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleComplete(reminder.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDismiss(reminder.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(reminder)}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ReminderForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        reminder={editingReminder}
        onSuccess={() => {
          setIsFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['reminders'] });
        }}
      />
    </div>
  );
}
