import logging
import time
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator, Dict, Optional, Type, TypeVar

from sqlalchemy import create_engine, event
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import QueuePool

from app.config.settings import settings

logger = logging.getLogger(__name__)

# SQLAlchemy setup
Base = declarative_base()

# Type variables for better type hints
T = TypeVar("T", bound=Base)

class Database:
    """Database connection manager with connection pooling and monitoring"""
    
    def __init__(self, db_url: str, **kwargs):
        """Initialize the database connection"""
        self.db_url = db_url
        self.engine: Optional[AsyncEngine] = None
        self.async_session_maker: Optional[async_sessionmaker] = None
        self._sync_engine = None
        self._sync_session_maker = None
        self._setup_complete = False
        self._pool_options = {
            'pool_size': 20,
            'max_overflow': 10,
            'pool_timeout': 30,
            'pool_recycle': 3600,
            'pool_pre_ping': True,
            'pool_use_lifo': True,
            **kwargs.get('pool_options', {})
        }
    
    async def connect(self):
        """Create database connection pool"""
        if self._setup_complete:
            return
            
        logger.info(f"Connecting to database: {self._mask_credentials(self.db_url)}")
        
        # Create async engine with connection pooling
        self.engine = create_async_engine(
            self.db_url,
            **self._pool_options,
            echo=settings.DEBUG,
            future=True,
            execution_options={
                'isolation_level': 'READ COMMITTED',
                'compiled_cache': None,  # Disable statement caching for now
            },
        )
        
        # Create async session factory
        self.async_session_maker = async_sessionmaker(
            bind=self.engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
            class_=AsyncSession,
        )
        
        # Create sync engine for migrations and testing
        sync_db_url = self.db_url.replace('+asyncpg', '').replace('+asyncmy', '').replace('+aiosqlite', '')
        self._sync_engine = create_engine(
            sync_db_url,
            **self._pool_options,
            echo=settings.DEBUG,
            future=True,
        )
        
        self._sync_session_maker = sessionmaker(
            bind=self._sync_engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
            class_=Session,
        )
        
        # Add event listeners
        self._add_event_listeners()
        
        self._setup_complete = True
        logger.info("Database connection pool initialized")
    
    async def disconnect(self):
        """Close all database connections"""
        if self.engine:
            await self.engine.dispose()
            logger.info("Database connection pool closed")
        
        if self._sync_engine:
            self._sync_engine.dispose()
            logger.info("Synchronous database connection pool closed")
        
        self._setup_complete = False
    
    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get an async database session with automatic cleanup"""
        if not self.async_session_maker:
            await self.connect()
            
        session = self.async_session_maker()
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {str(e)}", exc_info=True)
            raise
        finally:
            await session.close()
    
    @asynccontextmanager
    def sync_session(self) -> Session:
        """Get a sync database session (for migrations, etc.)"""
        if not self._sync_session_maker:
            raise RuntimeError("Database not initialized. Call connect() first.")
            
        session = self._sync_session_maker()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Sync database session error: {str(e)}", exc_info=True)
            raise
        finally:
            session.close()
    
    def _add_event_listeners(self):
        """Add SQLAlchemy event listeners for monitoring"""
        if not self.engine:
            return
        
        # Track query execution time
        @event.listens_for(self.engine.sync_engine, 'before_cursor_execute')
        def before_cursor_execute(conn, cursor, statement, params, context, executemany):
            context._query_start_time = time.time()
        
        @event.listens_for(self.engine.sync_engine, 'after_cursor_execute')
        def after_cursor_execute(conn, cursor, statement, params, context, executemany):
            total = time.time() - context._query_start_time
            
            # Log slow queries
            if total > 1.0:  # 1 second threshold
                logger.warning(
                    "Slow query",
                    extra={
                        'query': statement,
                        'params': params,
                        'duration_seconds': total,
                    }
                )
            
            # Update Prometheus metrics
            from app.monitoring import DB_QUERIES_TOTAL, DB_QUERY_DURATION
            
            # Extract table name from SQL (simplified)
            table_name = 'unknown'
            for word in statement.split():
                word = word.lower()
                if word in ('from', 'into', 'update'):
                    table_name = statement.split(word)[1].split()[0].strip('`"\'')
                    break
            
            # Extract operation type
            operation = statement.split()[0].lower()
            
            # Update metrics
            DB_QUERIES_TOTAL.labels(operation=operation, table=table_name).inc()
            DB_QUERY_DURATION.labels(operation=operation, table=table_name).observe(total)
    
    @staticmethod
    def _mask_credentials(url: str) -> str:
        """Mask sensitive information in database URLs"""
        from urllib.parse import urlparse, parse_qs, urlunparse
        
        try:
            parsed = urlparse(url)
            if parsed.password:
                # Replace password with ****
                netloc = parsed.netloc.replace(f":{parsed.password}@", ":****@")
                parts = list(parsed)
                parts[1] = netloc
                return urlunparse(parts)
        except Exception:
            pass
        
        return url

# Initialize database connection
database = Database(settings.DATABASE_URL)

# Dependency to get database session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session"""
    async with database.session() as session:
        try:
            yield session
        finally:
            await session.close()

# For type hints
SessionLocal = AsyncSession
