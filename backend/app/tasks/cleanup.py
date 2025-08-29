"""Cleanup tasks for NoteFusion AI."""
import os
import shutil
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

from celery import shared_task
from celery.exceptions import Reject

from ...core.config import settings

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def cleanup_temp_files(self, older_than_hours: int = 24) -> dict:
    """
    Clean up temporary files older than the specified number of hours.
    
    Args:
        older_than_hours: Delete files older than this many hours
        
    Returns:
        Dict with cleanup statistics
    """
    try:
        temp_dirs = [
            Path(settings.TEMP_DIR) if hasattr(settings, 'TEMP_DIR') else Path("data/temp"),
            Path("data/videos"),
            Path("data/exports"),
        ]
        
        cutoff_time = datetime.now() - timedelta(hours=older_than_hours)
        stats = {
            'deleted_files': 0,
            'deleted_dirs': 0,
            'total_size': 0,
            'started_at': datetime.now().isoformat(),
            'cutoff_time': cutoff_time.isoformat(),
        }
        
        for temp_dir in temp_dirs:
            if not temp_dir.exists():
                continue
                
            for root, dirs, files in os.walk(temp_dir, topdown=False):
                root_path = Path(root)
                
                # Process files
                for file in files:
                    file_path = root_path / file
                    try:
                        file_stat = file_path.stat()
                        file_time = max(
                            datetime.fromtimestamp(file_stat.st_atime),
                            datetime.fromtimestamp(file_stat.st_mtime),
                            datetime.fromtimestamp(file_stat.st_ctime)
                        )
                        
                        if file_time < cutoff_time:
                            file_size = file_path.stat().st_size
                            file_path.unlink()
                            stats['deleted_files'] += 1
                            stats['total_size'] += file_size
                            logger.debug(f"Deleted file: {file_path} (last modified: {file_time})")
                                
                    except (OSError, PermissionError) as e:
                        logger.warning(f"Could not delete file {file_path}: {str(e)}")
                
                # Process directories
                for dir_name in dirs:
                    dir_path = root_path / dir_name
                    try:
                        if dir_path.is_dir() and not any(dir_path.iterdir()):
                            dir_path.rmdir()
                            stats['deleted_dirs'] += 1
                            logger.debug(f"Deleted empty directory: {dir_path}")
                    except (OSError, PermissionError) as e:
                        logger.warning(f"Could not delete directory {dir_path}: {str(e)}")
        
        stats['completed_at'] = datetime.now().isoformat()
        stats['duration_seconds'] = (datetime.now() - datetime.fromisoformat(stats['started_at'])).total_seconds()
        
        logger.info(
            f"Cleanup completed: {stats['deleted_files']} files and {stats['deleted_dirs']} "
            f"directories deleted, {stats['total_size'] / (1024*1024):.2f} MB freed"
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}", exc_info=True)
        raise self.retry(exc=e, countdown=self.default_retry_delay * (2 ** self.request.retries))

@shared_task
def cleanup_old_task_results(older_than_days: int = 7) -> dict:
    """
    Clean up old Celery task results from the result backend.
    
    Args:
        older_than_days: Delete results older than this many days
        
    Returns:
        Dict with cleanup statistics
    """
    try:
        from celery.result import AsyncResult
        from app.core.celery_app import app as celery_app
        
        cutoff_time = datetime.now() - timedelta(days=older_than_days)
        stats = {
            'deleted_results': 0,
            'total_results': 0,
            'started_at': datetime.now().isoformat(),
            'cutoff_time': cutoff_time.isoformat(),
        }
        
        # Get all task results (this might be slow for large backends)
        # In production, you might want to use a more efficient approach
        i = celery_app.control.inspect()
        active_tasks = i.active() or {}
        reserved_tasks = i.reserved() or {}
        active_task_ids = set()
        
        # Get active task IDs
        for worker, tasks in active_tasks.items():
            active_task_ids.update(task['id'] for task in tasks)
            
        for worker, tasks in reserved_tasks.items():
            active_task_ids.update(task['id'] for task in tasks)
        
        # Get all task results (this is a simplified example)
        # In production, you'd use a more efficient method to find old tasks
        # For Redis, you might scan the keys with a specific pattern
        
        # This is a placeholder - actual implementation depends on your result backend
        # Here we're just demonstrating the concept
        stats['skipped'] = "Task result cleanup not fully implemented for this backend"
        
        stats['completed_at'] = datetime.now().isoformat()
        stats['active_tasks'] = len(active_task_ids)
        
        return stats
        
    except Exception as e:
        logger.error(f"Error cleaning up task results: {str(e)}", exc_info=True)
        raise Reject(str(e), requeue=False)
