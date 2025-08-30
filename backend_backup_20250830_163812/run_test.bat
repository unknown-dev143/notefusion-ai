@echo off
echo Setting up Python environment...
call .\test_env\Scripts\activate.bat

echo.
echo Python executable:
python --version

echo.
echo Installing required packages...
pip install moviepy numpy imageio imageio-ffmpeg

echo.
echo Running test script...
python test_moviepy_env.py

pause
