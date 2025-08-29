import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Testing imports...")

try:
    from app.models.database import SessionLocal
    print("✅ Successfully imported SessionLocal from app.models.database")
    
    from app.models.task import Task, TaskStatus, TaskType
    print("✅ Successfully imported Task models")
    
    from app.schemas.video import VideoGenerationRequest
    print("✅ Successfully imported VideoGenerationRequest")
    
    from app.services.video.service import VideoGenerationService
    print("✅ Successfully imported VideoGenerationService")
    
    print("\n✅ All imports successful!")
    
except ImportError as e:
    print(f"\n❌ Import error: {e}")
    print("\nCurrent Python path:")
    for path in sys.path:
        print(f"  - {path}")
