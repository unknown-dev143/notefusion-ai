@echo off
echo Testing Python installation...
where python > python_path.txt 2>&1
type python_path.txt
echo.
python --version > python_version.txt 2>&1
type python_version.txt
echo.
python -c "import sys; print(f'Python executable: {sys.executable}')" > python_info.txt 2>&1
type python_info.txt

if exist python_path.txt del python_path.txt
if exist python_version.txt del python_version.txt
if exist python_info.txt del python_info.txt

pause
