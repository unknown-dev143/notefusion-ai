@echo off
echo Running Python script...
python test_python_simple.py > python_output.txt 2>&1
type python_output.txt
pause
