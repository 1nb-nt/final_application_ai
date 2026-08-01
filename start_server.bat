@echo off
REM Starts the full app locally at http://127.0.0.1:3001.
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
  set PYTHON=.venv\Scripts\python.exe
) else (
  set PYTHON=python
)
start "" http://127.0.0.1:3001/
%PYTHON% -m uvicorn server:app --host 127.0.0.1 --port 3001
if errorlevel 1 (
  echo.
  echo Could not find a working Python runtime. Install Python from https://python.org and try again.
  pause
)
