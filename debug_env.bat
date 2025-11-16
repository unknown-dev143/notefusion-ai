@echo off
echo Starting Python environment debug...
echo.

REM Set output file
set OUTPUT_FILE=python_env_debug.txt

echo Testing Python installation... > %OUTPUT_FILE%
echo ============================== >> %OUTPUT_FILE%
python --version >> %OUTPUT_FILE% 2>&1
echo. >> %OUTPUT_FILE%

echo. >> %OUTPUT_FILE%
echo Python path: >> %OUTPUT_FILE%
where python >> %OUTPUT_FILE% 2>&1
echo. >> %OUTPUT_FILE%

echo. >> %OUTPUT_FILE%
echo Environment variables: >> %OUTPUT_FILE%
echo ===================== >> %OUTPUT_FILE%
set >> %OUTPUT_FILE%

echo. >> %OUTPUT_FILE%
echo Running test script... >> %OUTPUT_FILE%
echo ==================== >> %OUTPUT_FILE%
python test_python_env.py >> %OUTPUT_FILE% 2>&1

echo Debug information has been written to %OUTPUT_FILE%
type %OUTPUT_FILE%
pause
