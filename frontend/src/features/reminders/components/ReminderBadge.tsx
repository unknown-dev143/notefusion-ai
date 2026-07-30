import React from 'react';
import { Badge, BadgeProps } from '../../../components/ui/badge';
import { LuClock, LuCheck, LuX, LuTriangleAlert as LuAlertTriangle } from 'react-icons/lu';
import { ReminderStatus } from '../types';

interface ReminderBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: ReminderStatus;
  showText?: boolean;
  className?: string;
}

const statusIcons = {
  [ReminderStatus.PENDING]: LuClock,
  [ReminderStatus.COMPLETED]: LuCheck,
  [ReminderStatus.DISMISSED]: LuX,
  [ReminderStatus.EXPIRED]: LuAlertTriangle,
};

const statusVariants = {
  [ReminderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  [ReminderStatus.COMPLETED]: 'bg-green-100 text-green-800 hover:bg-green-200',
  [ReminderStatus.DISMISSED]: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  [ReminderStatus.EXPIRED]: 'bg-red-100 text-red-800 hover:bg-red-200',
};

const statusText = {
  [ReminderStatus.PENDING]: 'Pending',
  [ReminderStatus.COMPLETED]: 'Completed',
  [ReminderStatus.DISMISSED]: 'Dismissed',
  [ReminderStatus.EXPIRED]: 'Expired',
};

export function ReminderBadge({
  status,
  showText = true,
  className = '',
  ...props
}: ReminderBadgeProps) {
  const Icon = statusIcons[status] || LuClock;
  
  return (
    <Badge
      className={`inline-flex items-center gap-1 ${statusVariants[status]} ${className}`}
      variant="outline"
      {...props}
    >
      <Icon className="h-3 w-3" />
      {showText && <span>{statusText[status]}</span>}
    </Badge>
  );
}
