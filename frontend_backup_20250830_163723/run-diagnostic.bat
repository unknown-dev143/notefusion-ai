@echo off
node node-diagnostic.js > diagnostic-output.txt 2>&1
if exist diagnostic-output.txt (
    echo Diagnostic output saved to diagnostic-output.txt
    type diagnostic-output.txt
) else (
    echo Failed to run diagnostic
)
pause
