@echo off
echo Running Python debug script...
python debug_python.py > debug_output.txt 2>&1
type debug_output.txt
pause
