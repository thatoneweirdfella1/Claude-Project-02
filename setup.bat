@echo off
REM ADHD-to-AI Translator: Windows Setup Script

echo ================================
echo ADHD-to-AI Translator Setup
echo ================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python 3.11+ is required but not installed
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [OK] Python %PYTHON_VERSION% found

REM Backend setup
echo.
echo Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install --upgrade pip >nul 2>&1
pip install -q -r requirements.txt

REM Create .env if needed
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo WARNING: Please edit backend\.env and add your API keys
    echo   ANTHROPIC_API_KEY=sk-ant-...
    pause
)

REM Create directories
if not exist "logs" mkdir logs
if not exist "..\data" mkdir ..\data

REM Run tests
echo.
echo Running tests...
python tests\test_integration_spec.py

REM Return to root
cd ..

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo.
echo 1. Start Backend:
echo    cd backend
echo    venv\Scripts\activate.bat
echo    python app.py
echo.
echo 2. Start Frontend (new terminal):
echo    cd frontend
echo    npm start
echo.
echo 3. Open in Browser:
echo    http://localhost:3000
echo.
pause
