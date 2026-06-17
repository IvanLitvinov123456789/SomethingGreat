@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if not errorlevel 1 goto run_py

where python >nul 2>nul
if not errorlevel 1 goto run_python

echo Python 3 was not found.
echo Install Python 3 and enable Add Python to PATH.
pause
exit /b 1

:run_py
py -3 local_server.py
goto finished

:run_python
python local_server.py

:finished
if errorlevel 1 pause
endlocal
