import sys

def main():
    print("===== Python Environment Test =====")
    print(f"Python Version: {sys.version}")
    print(f"Executable: {sys.executable}")
    print("\nTest completed successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
