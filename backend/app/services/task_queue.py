import asyncio
import json
import uuid
import logging
from typing import Dict, List, Optional, Callable, Any, Awaitable, TypeVar, Generic
from datetime import datetime, timedelta
from enum import Enum
from pydantic import BaseModel, Field
import redis.asyncio as redis

logger = logging.getLogger(__name__)
T = TypeVar('T')

class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskResult(BaseModel):
    status: TaskStatus
    result: Optional[Any] = None
    error: Optional[str] = None
    progress: float = 0.0
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Task(BaseModel, Generic[T]):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    params: Dict[str, Any] = Field(default_factory=dict)
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[TaskResult] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    timeout: int = 3600  # 1 hour default timeout
    
    def update_progress(self, progress: float, metadata: Optional[Dict[str, Any]] = None):
        """Update task progress"""
        if not self.result:
            self.result = TaskResult(status=TaskStatus.PROCESSING)
        
        self.result.progress = max(0.0, min(1.0, progress))
        self.result.updated_at = datetime.utcnow()
        
        if metadata:
            self.result.metadata.update(metadata)
    
    def set_result(self, result: T, status: TaskStatus = TaskStatus.COMPLETED):
        """Set task result"""
        self.status = status
        self.result = TaskResult(
            status=status,
            result=result,
            progress=1.0,
            updated_at=datetime.utcnow()
        )
        self.updated_at = datetime.utcnow()
    
    def set_error(self, error: Exception):
        """Set task error"""
        self.status = TaskStatus.FAILED
        self.result = TaskResult(
            status=TaskStatus.FAILED,
            error=str(error),
            progress=self.result.progress if self.result else 0.0,
            updated_at=datetime.utcnow(),
            metadata=self.result.metadata if self.result else {}
        )
        self.updated_at = datetime.utcnow()

class TaskQueue:
    """Asynchronous task queue for background processing"""
    
    def __init__(
        self,
        redis_url: str,
        concurrency: int = 5,
        result_ttl: int = 86400,  # 24 hours
        namespace: str = "task_queue"
    ):
        self.redis_url = redis_url
        self.namespace = namespace
        self.concurrency = concurrency
        self.result_ttl = result_ttl
        self.redis: Optional[redis.Redis] = None
        self._running_tasks: Dict[str, asyncio.Task] = {}
        self._task_handlers: Dict[str, Callable[..., Awaitable[Any]]] = {}
        self._shutdown = False
        self._worker_task: Optional[asyncio.Task] = None
    
    async def initialize(self):
        """Initialize the task queue"""
        self.redis = redis.Redis.from_url(self.redis_url, decode_responses=True)
        await self.redis.ping()  # Test connection
        logger.info(f"Task queue initialized with namespace: {self.namespace}")
    
    def register_handler(self, task_name: str, handler: Callable[..., Awaitable[Any]]):
        """Register a task handler"""
        self._task_handlers[task_name] = handler
        logger.info(f"Registered handler for task: {task_name}")
    
    async def enqueue(self, task: Task) -> str:
        """Enqueue a new task"""
        if not self.redis:
            raise RuntimeError("Task queue not initialized")
        
        # Serialize the task
        task_data = task.model_dump_json()
        
        # Add to the task queue
        pipeline = self.redis.pipeline()
        pipeline.lpush(f"{self.namespace}:queue:{task.name}", task.id)
        pipeline.set(
            f"{self.namespace}:tasks:{task.id}",
            task_data,
            ex=self.result_ttl
        )
        await pipeline.execute()
        
        logger.info(f"Enqueued task {task.id} ({task.name})")
        return task.id
    
    async def get_task(self, task_id: str) -> Optional[Task]:
        """Get a task by ID"""
        if not self.redis:
            return None
        
        task_data = await self.redis.get(f"{self.namespace}:tasks:{task_id}")
        if not task_data:
            return None
        
        return Task.model_validate_json(task_data)
    
    async def update_task(self, task: Task):
        """Update a task in the queue"""
        if not self.redis:
            return
        
        task.updated_at = datetime.utcnow()
        task_data = task.model_dump_json()
        
        await self.redis.set(
            f"{self.namespace}:tasks:{task.id}",
            task_data,
            ex=self.result_ttl
        )
    
    async def cancel_task(self, task_id: str):
        """Cancel a pending task"""
        if not self.redis:
            return
        
        task = await self.get_task(task_id)
        if not task:
            return
        
        # If task is still pending, update its status
        if task.status == TaskStatus.PENDING:
            task.status = TaskStatus.CANCELLED
            await self.update_task(task)
            
            # Remove from queue if it's still there
            await self.redis.lrem(f"{self.namespace}:queue:{task.name}", 1, task_id)
    
    async def _process_task(self, task_id: str, task_name: str):
        """Process a single task"""
        if not self.redis:
            return
        
        try:
            # Get the task
            task = await self.get_task(task_id)
            if not task:
                logger.warning(f"Task {task_id} not found")
                return
            
            # Check if task was cancelled
            if task.status == TaskStatus.CANCELLED:
                logger.info(f"Task {task_id} was cancelled")
                return
            
            # Update task status to processing
            task.status = TaskStatus.PROCESSING
            task.result = TaskResult(status=TaskStatus.PROCESSING, progress=0.0)
            await self.update_task(task)
            
            # Get the handler
            handler = self._task_handlers.get(task_name)
            if not handler:
                raise ValueError(f"No handler registered for task: {task_name}")
            
            # Execute the task
            logger.info(f"Processing task {task_id} ({task_name})")
            
            # Create a wrapper to track progress
            async def progress_callback(progress: float, metadata: Optional[Dict[str, Any]] = None):
                task.update_progress(progress, metadata)
                await self.update_task(task)
            
            # Add progress callback to task params
            task_params = task.params.copy()
            task_params["_progress_callback"] = progress_callback
            
            # Run the task
            result = await handler(**task_params)
            
            # Update task with result
            task.set_result(result)
            await self.update_task(task)
            
            logger.info(f"Completed task {task_id} ({task_name})")
            
        except asyncio.CancelledError:
            # Task was cancelled
            if task:
                task.status = TaskStatus.CANCELLED
                await self.update_task(task)
            logger.info(f"Task {task_id} was cancelled during execution")
            
        except Exception as e:
            # Handle task failure
            logger.error(f"Task {task_id} failed: {str(e)}", exc_info=True)
            if task:
                task.set_error(e)
                await self.update_task(task)
        
        finally:
            # Clean up
            self._running_tasks.pop(task_id, None)
    
    async def _worker_loop(self):
        """Main worker loop"""
        if not self.redis:
            return
        
        logger.info("Task worker started")
        
        while not self._shutdown:
            try:
                # Check if we can run more tasks
                if len(self._running_tasks) >= self.concurrency:
                    await asyncio.sleep(0.1)
                    continue
                
                # Get the next task from any queue
                for task_name in self._task_handlers.keys():
                    # Use BRPOP to block until a task is available
                    result = await self.redis.brpop(
                        f"{self.namespace}:queue:{task_name}",
                        timeout=1
                    )
                    
                    if result:
                        _, task_id = result
                        task = await self.get_task(task_id)
                        if not task or task.status == TaskStatus.CANCELLED:
                            continue
                        
                        # Start processing the task
                        task_coro = self._process_task(task_id, task_name)
                        task_obj = asyncio.create_task(task_coro)
                        self._running_tasks[task_id] = task_obj
                        break
                
            except asyncio.CancelledError:
                logger.info("Worker received cancellation signal")
                break
                
            except Exception as e:
                logger.error(f"Error in worker loop: {str(e)}", exc_info=True)
                await asyncio.sleep(1)  # Prevent tight loop on errors
        
        logger.info("Task worker stopped")
    
    async def start(self):
        """Start the task queue worker"""
        if self._worker_task and not self._worker_task.done():
            logger.warning("Worker is already running")
            return
        
        self._shutdown = False
        self._worker_task = asyncio.create_task(self._worker_loop())
    
    async def stop(self, timeout: int = 30):
        """Stop the task queue worker"""
        if not self._worker_task:
            return
        
        logger.info("Shutting down task worker...")
        self._shutdown = True
        
        # Cancel the worker task
        if self._worker_task and not self._worker_task.done():
            self._worker_task.cancel()
            try:
                await asyncio.wait_for(self._worker_task, timeout=timeout)
            except asyncio.TimeoutError:
                logger.warning("Worker did not shut down gracefully")
        
        # Cancel all running tasks
        for task_id, task in list(self._running_tasks.items()):
            if not task.done():
                task.cancel()
                logger.info(f"Cancelled running task: {task_id}")
        
        # Wait for tasks to complete
        if self._running_tasks:
            logger.info(f"Waiting for {len(self._running_tasks)} tasks to complete...")
            try:
                await asyncio.wait_for(
                    asyncio.gather(*self._running_tasks.values(), return_exceptions=True),
                    timeout=timeout
                )
            except asyncio.TimeoutError:
                logger.warning("Some tasks did not complete gracefully")
        
        # Close Redis connection
        if self.redis:
            await self.redis.close()
            self.redis = None
        
        logger.info("Task worker shutdown complete")

# Global task queue instance
task_queue: Optional[TaskQueue] = None

async def setup_task_queue(redis_url: str, **kwargs) -> TaskQueue:
    """Set up the global task queue"""
    global task_queue
    if task_queue is None:
        task_queue = TaskQueue(redis_url, **kwargs)
        await task_queue.initialize()
        await task_queue.start()
    return task_queue

async def shutdown_task_queue():
    """Shut down the global task queue"""
    global task_queue
    if task_queue:
        await task_queue.stop()
        task_queue = None
