try:
    import sqlalchemy
    print(f"SQLAlchemy is installed! Version: {sqlalchemy.__version__}")
    print("Installation path:", sqlalchemy.__file__)
except ImportError as e:
    print("SQLAlchemy is not installed or there was an error:")
    print(str(e))
