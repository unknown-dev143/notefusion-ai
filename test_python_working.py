# Simple script to test if Python is working
import sys

def main():
    print("Python is working!")
    print(f"Python Version: {sys.version}")
    print("If you see this message, Python is installed and running correctly.")
    return 0

if __name__ == "__main__":
    exit(main())
