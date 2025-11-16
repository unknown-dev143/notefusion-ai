try:
    import sqlalchemy
    print(f"SQLAlchemy version: {sqlalchemy.__version__}")
    print("SQLAlchemy is installed and working!")
except ImportError:
    print("SQLAlchemy is not installed")
    print("Try running: \"C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python313\\python.exe\" -m pip install sqlalchemy")
