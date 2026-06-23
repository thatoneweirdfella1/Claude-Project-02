#!/bin/bash

# ADHD-to-AI Translator: Automated Setup Script
# Handles backend, frontend, and database initialization

set -e

echo "================================"
echo "ADHD-to-AI Translator Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.11+ is required but not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python $PYTHON_VERSION found"

if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found (frontend will not run)"
else
    NODE_VERSION=$(node --version)
    echo "✓ Node.js $NODE_VERSION found"
fi

echo ""
echo -e "${BLUE}Setting up Backend...${NC}"

# Backend setup
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || . venv/Scripts/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -q -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo -e "${YELLOW}⚠️  Please edit backend/.env and add your API keys:${NC}"
    echo "   ANTHROPIC_API_KEY=sk-ant-..."
    echo "   (Optional: OPENAI_API_KEY, PERPLEXITY_API_KEY)"
    echo ""
    read -p "Press Enter when you've added your API keys..."
fi

# Create directories
mkdir -p logs
mkdir -p ../data

# Initialize database
echo "Initializing database..."
python3 -c "from services.database_service import db_service; print('✓ Database ready')"

echo "✓ Backend setup complete"

# Backend tests
echo ""
echo -e "${BLUE}Running Backend Tests...${NC}"
python3 tests/test_integration_spec.py 2>&1 | tail -20

cd ..

# Frontend setup (if Node.js is available)
if command -v node &> /dev/null; then
    echo ""
    echo -e "${BLUE}Setting up Frontend...${NC}"
    cd frontend

    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install -q
    fi

    echo "✓ Frontend setup complete"
    cd ..
else
    echo ""
    echo -e "${YELLOW}Skipping frontend setup (Node.js not found)${NC}"
    echo "To set up frontend manually:"
    echo "  cd frontend"
    echo "  npm install"
    echo "  npm start"
fi

echo ""
echo "================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "2. Start Frontend (in new terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Open in Browser:"
echo "   http://localhost:3000"
echo ""
echo "4. API Documentation:"
echo "   http://localhost:8000/docs"
echo ""
echo "Or use Docker Compose:"
echo "   docker-compose up"
echo ""
