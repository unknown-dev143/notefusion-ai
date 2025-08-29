"""Scheduler service for handling recurring tasks."""
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Callable, Awaitable, Any
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.date import DateTrigger
from pytz import utc

from app.db.session import SessionLocal
from app.models.reminder import Reminder, ReminderStatus
from app.services.notification_service import notification_service

logger = logging.getLogger(__name__)

class Scheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler(timezone=utc)
        self.scheduler.start()
        self.jobs = {}
        
    async def start(self):
        """Start the scheduler and load existing reminders."""
        logger.info("Starting scheduler...")
        await self.schedule_pending_reminders()
        logger.info("Scheduler started")
        
    async def shutdown(self):
        """Shutdown the scheduler."""
        self.scheduler.shutdown()
        logger.info("Scheduler shut down")
        
    async def schedule_pending_reminders(self):
        """Schedule all pending reminders from the database."""
        db = SessionLocal()
        try:
            reminders = db.query(Reminder).filter(
                Reminder.status == ReminderStatus.PENDING,
                Reminder.due_date > datetime.utcnow()
            ).all()
            
            for reminder in reminders:
                self.schedule_reminder(reminder)
                
            logger.info(f"Scheduled {len(reminders)} pending reminders")
        except Exception as e:
            logger.error(f"Error scheduling reminders: {str(e)}", exc_info=True)
        finally:
            db.close()
            
    def schedule_reminder(self, reminder: Reminder):
        """Schedule a single reminder."""
        job_id = f"reminder_{reminder.id}"
        
        # Remove existing job if it exists
        if job_id in self.jobs:
            self.scheduler.remove_job(job_id)
            
        # Calculate time until reminder
        now = datetime.utcnow()
        time_until_reminder = (reminder.due_date - now).total_seconds()
        
        # Only schedule if the reminder is in the future
        if time_until_reminder > 0:
            # Schedule the reminder
            job = self.scheduler.add_job(
                self._send_reminder_notification,
                'date',
                run_date=reminder.due_date,
                args=[reminder.id],
                id=job_id,
                replace_existing=True
            )
            
            self.jobs[job_id] = job
            logger.info(f"Scheduled reminder {reminder.id} for {reminder.due_date}")
            
            # If it's a recurring reminder, schedule the next occurrence
            if reminder.is_recurring and reminder.recurrence_rule != 'NONE':
                self._schedule_recurring_reminder(reminder)
                
    def _schedule_recurring_reminder(self, reminder: Reminder):
        """Schedule the next occurrence of a recurring reminder."""
        job_id = f"recurring_reminder_{reminder.id}"
        
        # Remove existing job if it exists
        if job_id in self.jobs:
            self.scheduler.remove_job(job_id)
            
        # Create a new reminder for the next occurrence
        next_reminder = self._get_next_recurring_reminder(reminder)
        
        if next_reminder:
            job = self.scheduler.add_job(
                self._create_next_recurring_reminder,
                'date',
                run_date=next_reminder.due_date,
                args=[reminder.id],
                id=job_id,
                replace_existing=True
            )
            
            self.jobs[job_id] = job
            logger.info(f"Scheduled next occurrence of recurring reminder {reminder.id} for {next_reminder.due_date}")
            
    def _get_next_recurring_reminder(self, reminder: Reminder) -> Optional[Reminder]:
        """Calculate the next occurrence of a recurring reminder."""
        if not reminder.is_recurring or not reminder.recurrence_rule:
            return None
            
        next_reminder = Reminder(
            user_id=reminder.user_id,
            title=reminder.title,
            description=reminder.description,
            reminder_type=reminder.reminder_type,
            due_date=self._calculate_next_occurrence(reminder),
            is_recurring=reminder.is_recurring,
            recurrence_rule=reminder.recurrence_rule,
            custom_recurrence=reminder.custom_recurrence,
            status=ReminderStatus.PENDING,
            send_email=reminder.send_email,
            send_push=reminder.send_push,
            note_id=reminder.note_id,
            task_id=reminder.task_id
        )
        
        return next_reminder
        
    def _calculate_next_occurrence(self, reminder: Reminder) -> datetime:
        """Calculate the next occurrence of a reminder based on its recurrence rule."""
        if reminder.custom_recurrence and reminder.recurrence_rule == 'CUSTOM':
            # TODO: Implement custom recurrence using icalendar or similar
            # For now, just add one day
            return reminder.due_date + timedelta(days=1)
            
        # Handle standard recurrence rules
        if reminder.recurrence_rule == 'DAILY':
            return reminder.due_date + timedelta(days=1)
        elif reminder.recurrence_rule == 'WEEKLY':
            return reminder.due_date + timedelta(weeks=1)
        elif reminder.recurrence_rule == 'MONTHLY':
            # Add approximately one month
            return reminder.due_date + timedelta(days=30)
        elif reminder.recurrence_rule == 'YEARLY':
            # Add one year
            return reminder.due_date.replace(year=reminder.due_date.year + 1)
        else:
            # Default to daily if unknown
            return reminder.due_date + timedelta(days=1)
            
    async def _create_next_recurring_reminder(self, reminder_id: int):
        """Create the next occurrence of a recurring reminder."""
        db = SessionLocal()
        try:
            reminder = db.query(Reminder).get(reminder_id)
            if not reminder or not reminder.is_recurring:
                return
                
            next_reminder = self._get_next_recurring_reminder(reminder)
            if next_reminder:
                db.add(next_reminder)
                db.commit()
                db.refresh(next_reminder)
                
                # Schedule the next reminder
                self.schedule_reminder(next_reminder)
                logger.info(f"Created next occurrence of recurring reminder {next_reminder.id}")
                
        except Exception as e:
            logger.error(f"Error creating next recurring reminder: {str(e)}", exc_info=True)
            db.rollback()
        finally:
            db.close()
            
    async def _send_reminder_notification(self, reminder_id: int):
        """Send a notification for a reminder."""
        db = SessionLocal()
        try:
            reminder = db.query(Reminder).get(reminder_id)
            if not reminder:
                logger.error(f"Reminder {reminder_id} not found")
                return
                
            # Send the notification
            await notification_service.send_reminder_notification(reminder)
            
            # If it's not recurring, mark it as completed
            if not reminder.is_recurring:
                reminder.status = ReminderStatus.COMPLETED
                db.commit()
                logger.info(f"Completed reminder {reminder.id}")
            else:
                logger.info(f"Sent notification for recurring reminder {reminder.id}")
                
        except Exception as e:
            logger.error(f"Error sending reminder notification: {str(e)}", exc_info=True)
            db.rollback()
        finally:
            db.close()
            
    def remove_reminder(self, reminder_id: int):
        """Remove a scheduled reminder."""
        job_id = f"reminder_{reminder_id}"
        recurring_job_id = f"recurring_reminder_{reminder_id}"
        
        if job_id in self.jobs:
            self.scheduler.remove_job(job_id)
            del self.jobs[job_id]
            
        if recurring_job_id in self.jobs:
            self.scheduler.remove_job(recurring_job_id)
            del self.jobs[recurring_job_id]
            
        logger.info(f"Removed scheduled jobs for reminder {reminder_id}")

# Global scheduler instance
scheduler = Scheduler()

async def init_scheduler():
    """Initialize the scheduler on application startup."""
    await scheduler.start()
    
async def shutdown_scheduler():
    """Shutdown the scheduler on application shutdown."""
    await scheduler.shutdown()
