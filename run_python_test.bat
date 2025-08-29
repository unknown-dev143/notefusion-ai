@echo off
echo Running Python test...
python simple_test.py > test_output.txt 2>&1
type test_output.txt
pause
