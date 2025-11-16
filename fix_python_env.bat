@echo off
echo === Python Environment Check ===
echo.
echo 1. Checking Python installation...
"C:\Users\User\AppData\Local\Programs\Python\Python313\python.exe" --version
echo.
echo 2. Checking pip installation...
"C:\Users\User\AppData\Local\Programs\Python\Python313\Scripts\pip.exe" --version
echo.
echo 3. Installing SQLAlchemy...
"C:\Users\User\AppData\Local\Programs\Python\Python313\python.exe" -m pip install --user sqlalchemy
echo.
echo 4. Verifying SQLAlchemy installation...
"C:\Users\User\AppData\Local\Programs\Python\Python313\python.exe" -c "import sqlalchemy; print('SQLAlchemy version:', sqlalchemy.__version__); print('Installation path:', sqlalchemy.__file__)"
echo.
pause
