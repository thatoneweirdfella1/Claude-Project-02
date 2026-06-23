# ADHD-to-AI Translator

**Transform rambling ADHD-style input into optimal AI responses through a 5-stage intelligent pipeline.**

A complete system that translates unclear, tangential, or scattered questions into clear prompts optimized for specific AI models (Haiku, Opus-Fast, Opus-Thinking), automatically selects 18 prompt engineering techniques, composes final prompts, and learns from feedback.

## ✨ Features

### 5-Stage Pipeline
1. **Translation Engine** - Detects 4 gap categories, applies 6 translation operations, scores confidence
2. **Routing Engine** - 20 rules, 6-dimensional scoring, routes to optimal model
3. **Technique Selection** - Scores all 18 techniques, resolves conflicts, respects token budgets
4. **Composition Engine** - Template injection, 8 validation checks, structured prompts
5. **Execution** - API calls, token tracking, database logging, feedback collection

### Multi-AI Support (Phase 11)
- Account pool management (8 free accounts)
- 3 dialogue modes: Debate, Consensus, Synthesis
- Account rotation with token management

### Learning System
- Pattern detection after 15+ questions
- Automatic rule refinement
- Statistical confidence tracking

## 🏗️ Architecture

```
frontend/                 # React UI (dark mode, Claude-style)
  ├── src/
  │   ├── App.tsx        # Main pipeline component
  │   ├── App.css        # Dark mode styles
  │   └── components/    # InputBox, TranslationReview, RoutingExplainer, etc.
  └── package.json

backend/                  # FastAPI backend
  ├── core/
  │   ├── config.py      # Environment, settings
  │   ├── constants.py   # 20 routing rules, 18 techniques, thresholds
  │   └── logger.py      # Structured logging
  ├── models/
  │   ├── enums.py       # Gap categories, model tiers, question types
  │   └── schemas.py     # Pydantic schemas for all 5 stages
  ├── stages/
  │   ├── stage1_translation.py
  │   ├── stage2_routing.py
  │   ├── stage3_technique_selection.py
  │   ├── stage4_composition.py
  │   └── stage5_execution.py
  ├── services/
  │   ├── database_service.py   # SQLite logging
  │   ├── api_client.py         # Claude, OpenAI, Perplexity
  ├── libraries/
  │   └── prompts.py     # 46+ templates, 10 categories
  ├── utils/
  │   ├── scoring.py     # Confidence calculations
  │   ├── validators.py  # 8 composition checks
  │   └── conflict_checker.py
  ├── analysis/
  │   └── pattern_analyzer.py   # Learning system
  ├── app.py             # FastAPI application
  └── tests/
      ├── test_stages.py # Unit tests (all stages passing ✓)
      └── test_runner.py # Comprehensive test suite

database/
  └── app.db             # SQLite with interaction log
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- API Keys: Anthropic, OpenAI (optional), Perplexity (optional)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

# Run server
python app.py
```

Server starts at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm start
```

Frontend starts at `http://localhost:3000`

## 📊 Testing

### Run All Tests
```bash
cd backend
python tests/test_runner.py
```

Expected output: **✅ 18/18 tests passed (100%)**

Test coverage:
- Stage 1 (Translation): 5 test cases
- Stage 2 (Routing): 5 test cases
- Stage 3 (Techniques): 5 test cases
- Stage 4 (Composition): 3 test cases

### Test Spec Files (196+ cases)
- `31.0_translation_test_cases.md` - 50 translation cases
- `32.0_routing_test_cases.md` - 25-30 routing cases
- `33.0_technique_selection_test_cases.md` - 50 technique cases
- `34.0_integration_test_cases.md` - 10 end-to-end cases
- `35.0_failure_mode_test_cases.md` - 11 failure modes
- `36.0_learning_system_test_cases.md` - 50-question learning simulation

## 🔌 API Endpoints

### Main Pipeline
```bash
POST /process
{
  "raw_input": "Your rambling ADHD-style input here..."
}
```

Returns: Full 5-stage pipeline output with translation, routing, techniques, prompt, response

### Individual Stages (for testing)
```bash
POST /translate
POST /feedback/{interaction_id}
GET /patterns/{user_id}
GET /interactions/{user_id}
```

### Health Check
```bash
GET /health
```

## 📋 Configuration

### Environment Variables (.env)
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...

DATABASE_PATH=./app.db
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
DEBUG=false

ENABLE_EXTENDED_THINKING=true
ENABLE_MULTI_AI=true
LEARNING_ANALYSIS_THRESHOLD=15
```

## 🎯 Routing Rules (20)

The router uses 20 conditional rules to choose between:
- **Haiku** - Simple factual, low complexity
- **Opus-Fast** - Moderate complexity, most general use
- **Opus-Thinking** - Complex analysis, health, evidence-based, novel domains

Key decision factors:
- Complexity (1-10 scale)
- Domain (factual, analytical, creative, code, health, etc.)
- Scope (narrow, medium, broad)
- Novelty (how familiar is this domain?)
- Certainty (is there a clear right answer?)
- Consequence of error (0-5 scale)

## 🧠 Techniques (18 T01-T18)

1. **T01** - Permission to Say "I Don't Know"
2. **T02** - Chain-of-Thought
3. **T03** - Quote-First
4. **T04** - Self-Verification
5. **T05** - Accuracy Role-Priming
6. **T06** - Retrieval-Augmented Generation
7. **T07** - Few-Shot Examples
8. **T08** - Instruction Hierarchy
9. **T09** - Explicit Constraints
10. **T10** - Output Format Specification
11. **T11** - Reasoning Decomposition
12. **T12** - Question Reframing
13. **T13** - Assumption Surfacing
14. **T14** - Scope Limitation
15. **T15** - Meta-Prompting
16. **T16** - Explicit Step Counting
17. **T17** - Confidence Scoring
18. **T18** - Constraint Violation Detection

Techniques are automatically selected based on question characteristics, ordered by canonical sequence, and checked for conflicts/dependencies.

## 🗄️ Database Schema

### interactions table
- Logs complete pipeline execution
- Stores translation, routing, techniques, final prompt, model response
- Tracks user feedback and behavioral signals
- Used by learning system for pattern analysis

### patterns table
- Discovered patterns from interaction history
- Pattern type (routing, technique, gap_category)
- Confidence scores
- Linked source interactions

### refined_rules table
- Rules modified by learning system
- Track improvements
- Audit trail of refinements

### accounts table (Phase 11)
- Account pool management
- Token tracking per provider
- Auto-rotation when depleted

### dialogues table (Phase 11)
- Multi-AI dialogue records
- Debate/consensus/synthesis mode logs

## 🔄 Learning System

Triggers after 15+ questions per user:
1. **Pattern Analysis** - Detect routing/technique effectiveness
2. **Statistical Testing** - Confidence thresholds (70%+)
3. **Rule Refinement** - Auto-adjust thresholds for future questions
4. **Feedback Integration** - Learn from user ratings

Example patterns:
- "Product questions route better to Opus-Fast than Haiku"
- "Quote-First technique most effective for health questions"
- "Tangential preamble detected 40% of questions"

## 📈 Performance

- **Translation**: <100ms per question
- **Routing**: <50ms (20-rule decision tree)
- **Technique Selection**: <150ms (18 techniques scored)
- **Composition**: <100ms (template injection + validation)
- **Full Pipeline**: <5 seconds (including API call)

Database: SQLite (local, no network overhead)

## 🚢 Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATABASE_URL=sqlite:///./app.db
    volumes:
      - ./data:/data

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### Production Checklist
- [ ] Set DEBUG=false
- [ ] Use production logging
- [ ] Configure CORS for your domain
- [ ] Rotate API keys regularly
- [ ] Monitor database size (SQLite)
- [ ] Enable HTTPS for frontend
- [ ] Set up backups for app.db
- [ ] Monitor API rate limits

## 📚 Documentation

- `COMPLETE_DETAILED_PROJECT_BLUEPRINT.md` - Phases 1-11 specification
- `37.0_developer_documentation.md` - Implementation guide with pseudocode
- `38.0_user_documentation.md` - User guide
- `11.0_multi_ai_conversation_mode.md` - Phase 11 (multi-AI mode)

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check port 8000 is available
lsof -i :8000  # Kill if needed
```

### Frontend can't reach backend
```bash
# Ensure backend is running on port 8000
# Check CORS settings in app.py
# Verify firewall isn't blocking localhost:8000
```

### Database errors
```bash
# Reset database
rm backend/app.db
# It will be recreated on next run
```

### Low confidence scores
- Provide clearer input
- Use simpler sentences
- Avoid multiple questions at once
- System learns after 15+ interactions

## 📝 License

Built for ADHD cognition research and AI translation systems.

## 🙏 Acknowledgments

- Research: ADHD communication patterns from 135-conversation archive
- Spec: Comprehensive blueprint covering Phases 1-11
- Testing: 196+ test cases from real conversations
- Standards: Following Claude prompt engineering best practices
