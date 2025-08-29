import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Reminder, ReminderType, ReminderRecurrence } from '../types';
import { createReminder, updateReminder } from '../api/reminders';

const reminderTypes = [
  { value: ReminderType.NOTE, label: 'Note' },
  { value: ReminderType.TASK, label: 'Task' },
  { value: ReminderType.DEADLINE, label: 'Deadline' },
  { value: ReminderType.MEETING, label: 'Meeting' },
  { value: ReminderType.CUSTOM, label: 'Custom' },
];

const recurrenceOptions = [
  { value: ReminderRecurrence.NONE, label: 'Does not repeat' },
  { value: ReminderRecurrence.DAILY, label: 'Daily' },
  { value: ReminderRecurrence.WEEKLY, label: 'Weekly' },
  { value: ReminderRecurrence.MONTHLY, label: 'Monthly' },
  { value: ReminderRecurrence.YEARLY, label: 'Yearly' },
  { value: ReminderRecurrence.CUSTOM, label: 'Custom...' },
];

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  reminder_type: z.nativeEnum(ReminderType),
  due_date: z.date({
    required_error: 'Due date is required',
  }),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.nativeEnum(ReminderRecurrence).default(ReminderRecurrence.NONE),
  custom_recurrence: z.string().optional(),
  send_email: z.boolean().default(false),
  send_push: z.boolean().default(true),
});

type ReminderFormValues = z.infer<typeof formSchema>;

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder?: Reminder | null;
  onSuccess?: () => void;
}

export function ReminderForm({ open, onOpenChange, reminder, onSuccess }: ReminderFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomRecurrence, setShowCustomRecurrence] = useState(false);

  const defaultValues: Partial<ReminderFormValues> = {
    title: '',
    description: '',
    reminder_type: ReminderType.CUSTOM,
    due_date: new Date(),
    is_recurring: false,
    recurrence_rule: ReminderRecurrence.NONE,
    send_email: false,
    send_push: true,
  };

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset form when reminder changes
  useEffect(() => {
    if (reminder) {
      form.reset({
        title: reminder.title,
        description: reminder.description || '',
        reminder_type: reminder.reminder_type,
        due_date: new Date(reminder.due_date),
        is_recurring: reminder.is_recurring,
        recurrence_rule: reminder.recurrence_rule || ReminderRecurrence.NONE,
        custom_recurrence: reminder.custom_recurrence || '',
        send_email: reminder.send_email,
        send_push: reminder.send_push,
      });
      setShowCustomRecurrence(reminder.recurrence_rule === ReminderRecurrence.CUSTOM);
    } else {
      form.reset(defaultValues);
      setShowCustomRecurrence(false);
    }
  }, [reminder, open]);

  const onSubmit = async (data: ReminderFormValues) => {
    try {
      setIsLoading(true);
      
      const payload = {
        ...data,
        // Convert date to ISO string for API
        due_date: data.due_date.toISOString(),
        // Only include custom_recurrence if recurrence_rule is CUSTOM
        ...(data.recurrence_rule !== ReminderRecurrence.CUSTOM && { custom_recurrence: undefined }),
      };

      if (reminder) {
        await updateReminder(reminder.id, payload);
        toast({
          title: 'Reminder updated',
          description: 'Your reminder has been updated successfully.',
        });
      } else {
        await createReminder(payload);
        toast({
          title: 'Reminder created',
          description: 'Your reminder has been created successfully.',
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to save reminder. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecurrenceChange = (value: string) => {
    const isCustom = value === ReminderRecurrence.CUSTOM;
    setShowCustomRecurrence(isCustom);
    
    // If not custom, clear any custom recurrence rule
    if (!isCustom) {
      form.setValue('custom_recurrence', '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{reminder ? 'Edit Reminder' : 'Create New Reminder'}</DialogTitle>
          <DialogDescription>
            {reminder 
              ? 'Update your reminder details.'
              : 'Set a new reminder for your notes, tasks, or deadlines.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Title */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Reminder title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add details about this reminder"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reminder Type */}
              <div>
                <FormField
                  control={form.control}
                  name="reminder_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reminderTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Due Date */}
              <div>
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPPp')
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                          <div className="p-4 border-t">
                            <Input
                              type="time"
                              value={field.value ? format(field.value, 'HH:mm') : ''}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const newDate = new Date(field.value || new Date());
                                newDate.setHours(hours, minutes);
                                field.onChange(newDate);
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Recurrence */}
              <div className="col-span-2 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_recurring"
                    checked={form.watch('is_recurring')}
                    onCheckedChange={(checked) => {
                      form.setValue('is_recurring', Boolean(checked));
                      if (!checked) {
                        form.setValue('recurrence_rule', ReminderRecurrence.NONE);
                        setShowCustomRecurrence(false);
                      }
                    }}
                  />
                  <label
                    htmlFor="is_recurring"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Recurring reminder
                  </label>
                </div>

                {form.watch('is_recurring') && (
                  <div className="pl-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="recurrence_rule"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleRecurrenceChange(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select recurrence" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {recurrenceOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {showCustomRecurrence && (
                      <FormField
                        control={form.control}
                        name="custom_recurrence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Recurrence Rule (iCalendar RRULE format)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="FREQ=WEEKLY;BYDAY=MO,WE,FR"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-muted-foreground mt-1">
                              Example: FREQ=WEEKLY;BYDAY=MO,WE,FR for every Monday, Wednesday, and Friday
                            </p>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="col-span-2 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Notification Preferences</h4>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="send_push"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Send push notification</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Receive a push notification when the reminder is due
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="send_email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Send email notification</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Receive an email when the reminder is due
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {reminder ? 'Update Reminder' : 'Create Reminder'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
