"""
Script to run audio service tests with proper output capture.
"""
import sys
import asyncio
import traceback
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.absolute() / "backend"
sys.path.insert(0, str(backend_dir))

async def run_tests():
    """Run the audio service tests with output capture."""
    try:
        # Import the test module
        from test_audio_services import main as run_audio_tests
        
        print("=" * 50)
        print("RUNNING AUDIO SERVICE TESTS")
        print("=" * 50)
        
        # Run the tests
        result = await run_audio_tests()
        
        print("\n" + "=" * 50)
        if result == 0:
            print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        else:
            print(f"❌ TESTS COMPLETED WITH {result} ERROR(S)")
        print("=" * 50)
        
        return result
        
    except Exception as e:
        print("\n" + "=" * 50)
        print("❌ ERROR RUNNING TESTS:")
        traceback.print_exc()
        print("=" * 50)
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(run_tests()))
