# ADHD-to-AI Translator: Quick Start Guide

**Get the system running locally in 5 minutes**

## Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend)
- Git
- API Keys (Anthropic, optional: OpenAI, Perplexity)

---

## Option 1: Docker Compose (Easiest)

### 1. Clone and Setup
```bash
cd Claude-Project-02
cp backend/.env.example backend/.env
# Edit backend/.env and add ANTHROPIC_API_KEY
```

### 2. Run with Docker
```bash
docker-compose up
```

Services will start:
- Backend: `http://localhost:8000` ✓
- Frontend: `http://localhost:3000` ✓
- Database: `./backend/app.db` (SQLite)

### 3. Test
```bash
# In a new terminal
curl http://localhost:8000/health
# Should return: {"status": "ok", "service": "ADHD-to-AI Translator"}
```

---

## Option 2: Local Development Setup

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # macOS/Linux
# or
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env file and add your API keys:
#   ANTHROPIC_API_KEY=sk-ant-...

# Run the server
python app.py
```

Backend runs at: `http://localhost:8000`

**API Documentation:** `http://localhost:8000/docs`

### Frontend Setup (in new terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: `http://localhost:3000`

---

## Environment Variables (.env)

Create `backend/.env` from `backend/.env.example`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-v0-your-key-here

# Optional (for Phase 11 multi-AI mode)
OPENAI_API_KEY=sk-your-key
PERPLEXITY_API_KEY=pplx-your-key

# Database
DATABASE_PATH=./app.db
LOG_FILE=./logs/app.log

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Features
ENABLE_EXTENDED_THINKING=true
ENABLE_MULTI_AI=true

# Learning System
LEARNING_ANALYSIS_THRESHOLD=15
MAX_TECHNIQUE_STACK=6
```

---

## Testing the System

### Run All Tests
```bash
cd backend
python tests/test_integration_spec.py
```

**Expected Output:**
```
✅ ALL 61 TESTS PASSED!

STAGE1          20/20 passed (100%)
STAGE2          21/21 passed (100%)
STAGE3          10/10 passed (100%)
STAGE4          5/ 5 passed (100%)
FAILURE_MODES   5/ 5 passed (100%)
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs

# Process a question through all 5 stages
curl -X POST http://localhost:8000/process \
  -H "Content-Type: application/json" \
  -d '{"raw_input": "ok so like i am really confused about this thing because it is kind of complicated but basically i need help understanding it"}'
```

---

## Using the UI

### 1. Open Frontend
Navigate to `http://localhost:3000` in your browser

### 2. Enter a Question
Type your rambling, scattered, or unclear question in the input box. Be natural - the system is designed to handle ADHD-style input!

**Examples:**
- "ok so like i've been thinking about this and it's kind of complicated but basically i need to understand how it works"
- "I'm fucking frustrated with this shit and I don't know why it won't work"
- "first can you explain X, and also help me understand Y, plus how does this relate to Z?"

### 3. View Pipeline
The system shows you:
- ✓ **Translation** - Detected gap, clarified questions, confidence
- ✓ **Routing** - Which model was chosen and why
- ✓ **Techniques** - Which 18 techniques were selected
- ✓ **Response** - The model's answer

### 4. Provide Feedback
Rate the response (1-5 stars) and optionally add comments. This helps the learning system improve!

---

## Phase 11: Multi-AI Mode

Try debating topics with multiple AI providers simultaneously:

### Via API
```bash
# Debate mode
curl -X POST http://localhost:8000/multi-ai/debate \
  -H "Content-Type: application/json" \
  -d '{"raw_input": "Should AI be regulated?"}'

# Consensus mode
curl -X POST http://localhost:8000/multi-ai/consensus \
  -H "Content-Type: application/json" \
  -d '{"raw_input": "What makes a good leader?"}'

# Synthesis mode (deeper principle discovery)
curl -X POST http://localhost:8000/multi-ai/synthesis \
  -H "Content-Type: application/json" \
  -d '{"raw_input": "Why do people believe conspiracy theories?"}'

# Check account pool status
curl http://localhost:8000/multi-ai/accounts
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check port 8000 is available
lsof -i :8000  # Kill if needed: kill -9 <PID>
```

### Frontend Can't Reach Backend
```bash
# Ensure backend is running
curl http://localhost:8000/health

# Check CORS settings
# Edit backend/app.py CORSMiddleware if needed
```

### Database Errors
```bash
# Reset database
rm backend/app.db
# It will be recreated automatically
```

### API Keys Not Working
```bash
# Verify .env file exists and has correct keys
cat backend/.env

# Check keys are loaded
grep ANTHROPIC_API_KEY backend/.env
```

---

## File Locations

| Component | Location |
|-----------|----------|
| Backend Code | `backend/` |
| Frontend Code | `frontend/` |
| Database | `backend/app.db` |
| Logs | `backend/logs/` |
| API Docs | `http://localhost:8000/docs` |
| Test Suite | `backend/tests/` |

---

## Common Commands

```bash
# Backend development
cd backend
python app.py              # Start server
python tests/test_integration_spec.py  # Run tests

# Frontend development
cd frontend
npm start                  # Dev server
npm build                  # Production build

# Docker
docker-compose up          # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
```

---

## Architecture Overview

```
Frontend (React)
    ↓ HTTP/JSON
Backend (FastAPI)
    ├── Stage 1: Translation Engine
    ├── Stage 2: Routing Engine  
    ├── Stage 3: Technique Selection
    ├── Stage 4: Composition Engine
    ├── Stage 5: Execution (calls Claude API)
    └── Phase 11: Multi-AI Dialogues
        ↓
    SQLite Database (logging & learning)
    ↓
    Claude/OpenAI/Perplexity APIs
```

---

## Next Steps

1. **Run the Tests** - Verify everything works with `test_integration_spec.py`
2. **Try the UI** - Enter a rambling question and see it get clarified
3. **Check Patterns** - After 15+ interactions, the system learns patterns
4. **Use Multi-AI** - Try Phase 11 debate/consensus/synthesis modes
5. **Read the Docs** - Check `README.md` for full documentation

---

## Performance

Expected metrics on a modern laptop:
- **Translation**: <100ms
- **Routing**: <50ms
- **Technique Selection**: <150ms
- **Composition**: <100ms
- **Full Pipeline**: <5s (including API call)
- **Database**: SQLite (instant local lookups)

---

## Support

- **Issues**: Check troubleshooting section above
- **Logs**: `backend/logs/app.log`
- **API Docs**: `http://localhost:8000/docs` (when running)
- **Full README**: See `README.md` for comprehensive documentation

---

## Ready to Go! 🚀

You now have a fully functional ADHD-to-AI Translator system running locally. Start with the UI, explore the API, try Phase 11, and watch the learning system improve over time!
