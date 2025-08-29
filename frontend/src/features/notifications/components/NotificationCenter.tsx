import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, AlertCircle, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  getNotifications,
  Notification as NotificationType
} from '../api/notifications';

interface NotificationCenterProps {
  className?: string;
  maxItems?: number;
}

export function NotificationCenter({ 
  className = '',
  maxItems = 10 
}: NotificationCenterProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });
  
  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  
  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  
  // Toggle notification center
  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };
  
  // Mark notification as read
  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };
  
  // Delete notification
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(id);
  };
  
  // Get unread count
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: NotificationType) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to the relevant page
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell */}
      <button
        onClick={toggleNotificationCenter}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>
          
          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.slice(0, maxItems).map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors",
                      !notification.is_read && "bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="text-gray-400 hover:text-gray-500"
                              aria-label="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(notification.id, e)}
                              className="text-gray-400 hover:text-red-500"
                              aria-label="Delete notification"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {notification.message}
                        </p>
                        <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <time dateTime={notification.created_at}>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </time>
                          {!notification.is_read && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {notifications.length > maxItems && (
            <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
              <a
                href="/notifications"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
