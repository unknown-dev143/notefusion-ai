print("Testing imports from within the app directory...")

try:
    from models.database import SessionLocal
    print("✅ Successfully imported SessionLocal from models.database")
    
    from models.task import Task, TaskStatus, TaskType
    print("✅ Successfully imported Task models")
    
    from schemas.video import VideoGenerationRequest
    print("✅ Successfully imported VideoGenerationRequest")
    
    from services.video.service import VideoGenerationService
    print("✅ Successfully imported VideoGenerationService")
    
    print("\n✅ All imports successful!")
    
except ImportError as e:
    print(f"\n❌ Import error: {e}")
    
    import sys
    print("\nCurrent Python path:")
    for path in sys.path:
        print(f"  - {path}")
