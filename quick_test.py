import sys
import os

def main():
    print("===== Python Environment Test =====")
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    
    # Test file operations
    test_file = "test_file.txt"
    try:
        with open(test_file, 'w') as f:
            f.write("Test successful!")
        print(f"\n✅ Successfully wrote to {test_file}")
        
        with open(test_file, 'r') as f:
            content = f.read()
        print(f"✅ Successfully read from {test_file}: {content}")
        
        os.remove(test_file)
        print(f"✅ Successfully deleted {test_file}")
        
        print("\n✅ All tests passed!")
        print("\n===== Running minimal_app.py =====")
        
        # Try to run the main application
        try:
            from minimal_app import main as app_main
            app_main()
        except ImportError as e:
            print(f"\n❌ Could not import minimal_app: {e}")
            print("\nPlease make sure you're in the correct directory and all dependencies are installed.")
            
    except Exception as e:
        print(f"\n❌ Test failed: {e}")

if __name__ == "__main__":
    main()
    input("\nPress Enter to exit...")
