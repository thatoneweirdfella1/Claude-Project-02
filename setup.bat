@echo off
REM NeuroDivergenceAI: Windows Setup Script

echo ================================
echo NeuroDivergenceAI Setup
echo ================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python 3.11+ is required but not installed
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

python --version
echo [OK] Python found

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Node.js not found - frontend will not run
    echo Install from https://nodejs.org/ if needed
) else (
    node --version
    echo [OK] Node.js found
)

REM Backend setup
echo.
echo Setting up Backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [IMPORTANT] Edit backend\.env and add your API keys before running
)

if not exist "logs" mkdir logs

cd ..

REM Frontend setup
if exist "frontend\package.json" (
    echo.
    echo Setting up Frontend...
    cd frontend

    if not exist "node_modules" (
        echo Installing frontend dependencies...
        call npm install
    )

    cd ..
    echo [OK] Frontend ready
)

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo To start the application:
echo.
echo Backend:
echo   cd backend
echo   python app.py
echo.
echo Frontend (in a new terminal):
echo   cd frontend
echo   npm start
echo.
echo Then open: http://localhost:3000
echo.
pause
