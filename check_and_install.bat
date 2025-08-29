@echo off
echo Checking Python installation...
"C:\Users\User\AppData\Local\Programs\Python\Python313\python.exe" --version
echo.
echo Installing SQLAlchemy...
"C:\Users\User\AppData\Local\Programs\Python\Python313\python.exe" -m pip install --user sqlalchemy
echo.
echo Verifying installation...
"C:\Users\User\AppData\Local\Programs\Python\Python313\python.exe" -c "import sqlalchemy; print('SQLAlchemy version:', sqlalchemy.__version__)"
pause
