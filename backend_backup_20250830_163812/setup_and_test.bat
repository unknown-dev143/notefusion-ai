@echo off
setlocal enabledelayedexpansion

:: Set Python executable (adjust path if needed)
set PYTHON=python

:: Create and activate virtual environment
echo Creating virtual environment...
%PYTHON% -m venv .venv
call .venv\Scripts\activate

:: Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

:: Install package in development mode with test dependencies
echo Installing package and test dependencies...
pip install -e .[dev]

:: Run the tests
echo Running tests...
python -m pytest test_flashcard_integration.py -v

:: Keep the window open
pause
