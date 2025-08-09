import asyncio
from sqlalchemy import create_engine, MetaData, Table, Column, String, Text, DateTime, JSON, Enum
import uuid
from datetime import datetime

# Database URL - make sure this matches your actual database URL
DATABASE_URL = "sqlite:///./notefusion.db"

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
metadata = MetaData()

# Define the tasks table
TaskStatus = Enum('pending', 'processing', 'completed', 'failed', 'cancelled', name='taskstatus')
TaskType = Enum('video_generation', 'audio_processing', 'document_processing', 'ai_training', name='tasktype')

tasks_table = Table(
    'tasks',
    metadata,
    Column('id', String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('task_id', String(255), unique=True, nullable=False, index=True),
    Column('user_id', String(255), nullable=False, index=True),
    Column('task_type', TaskType, nullable=False),
    Column('status', TaskStatus, default='pending', nullable=False, index=True),
    Column('input_data', JSON, nullable=True),
    Column('result_data', JSON, nullable=True),
    Column('error_message', Text, nullable=True),
    Column('created_at', DateTime, default=datetime.utcnow, nullable=False),
    Column('updated_at', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False),
    Column('completed_at', DateTime, nullable=True)
)

async def init_db():
    # Create all tables
    metadata.create_all(engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    # Create the tables
    asyncio.run(init_db())
    
    # Create a connection to verify the tables were created
    with engine.connect() as conn:
        result = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = [row[0] for row in result]
        print("\nTables in the database:", tables)
        
        if 'tasks' in tables:
            print("\nTasks table schema:")
            result = conn.execute("PRAGMA table_info(tasks);")
            for row in result:
                print(f"- {row[1]} ({row[2]})")
