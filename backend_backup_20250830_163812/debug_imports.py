import sys
import os

print("Python version:", sys.version)
print("\nPython executable:", sys.executable)
print("\nCurrent working directory:", os.getcwd())
print("\nPython path:")
for path in sys.path:
    print(f"  - {path}")

print("\nTrying to import app...")
try:
    import app
    print("✅ Successfully imported app")
    print("App location:", app.__file__)
except ImportError as e:
    print(f"❌ Failed to import app: {e}")

print("\nTrying to import models.database...")
try:
    from app.models.database import SessionLocal
    print("✅ Successfully imported SessionLocal from app.models.database")
except ImportError as e:
    print(f"❌ Failed to import SessionLocal: {e}")

print("\nTrying to import models.task...")
try:
    from app.models.task import Task, TaskStatus, TaskType
    print("✅ Successfully imported Task models")
except ImportError as e:
    print(f"❌ Failed to import Task models: {e}")

print("\nTrying to import schemas.video...")
try:
    from app.schemas.video import VideoGenerationRequest
    print("✅ Successfully imported VideoGenerationRequest")
except ImportError as e:
    print(f"❌ Failed to import VideoGenerationRequest: {e}")

print("\nTrying to import services.video.service...")
try:
    from app.services.video.service import VideoGenerationService
    print("✅ Successfully imported VideoGenerationService")
except ImportError as e:
    print(f"❌ Failed to import VideoGenerationService: {e}")
    # Print the directory structure to help debug
    print("\nDirectory structure:")
    for root, dirs, files in os.walk(os.getcwd()):
        level = root.replace(os.getcwd(), '').count(os.sep)
        indent = ' ' * 4 * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if f.endswith('.py'):
                print(f"{subindent}{f}")
