@echo off
echo Setting up Python virtual environment...
python -m venv .venv
call .venv\Scripts\activate.bat

:: Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

:: Install dependencies
echo Installing dependencies...
pip install -e .
pip install pytest pytest-asyncio sqlalchemy[asyncio] aiosqlite

:: Run the test
echo Running flashcard tests...
python test_flashcards_manual.py

:: Keep the window open
pause
