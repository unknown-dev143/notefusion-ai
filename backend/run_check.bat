@echo off
echo Running Python check...
"C:\Program Files\Python312\python.exe" check_pytest.py > output.txt 2>&1
type output.txt
