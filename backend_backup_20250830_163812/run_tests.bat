@echo off
"C:\Program Files\Python312\python.exe" -m pytest tests/test_hello.py -v > test_output.txt 2>&1
type test_output.txt
