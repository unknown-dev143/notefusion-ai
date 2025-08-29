@echo off
setlocal

set PYTHON=python
set SCRIPT=run_audio_tests.py
set OUTPUT=test_output.txt

echo Running tests... Please wait...
%PYTHON% %SCRIPT% > %OUTPUT% 2>&1

if %ERRORLEVEL% EQU 0 (
    echo Tests completed successfully!
) else (
    echo Tests failed with error code %ERRORLEVEL%
)

type %OUTPUT%
pause
