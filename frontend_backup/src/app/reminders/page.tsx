'use client';

import { Suspense } from 'react';
import { ReminderList } from '@/features/reminders';
import { Skeleton } from '@/components/ui/skeleton';

export default function RemindersPage() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<RemindersSkeleton />}>
        <ReminderList />
      </Suspense>
    </div>
  );
}

function RemindersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
