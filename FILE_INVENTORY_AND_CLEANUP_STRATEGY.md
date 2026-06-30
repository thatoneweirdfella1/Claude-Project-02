# FILE INVENTORY & CLEANUP STRATEGY
## Complete File Audit, Deduplication & Archive Plan

**Date:** 2026-06-30  
**Branches Analyzed:** 4 (main, claude/redesign-main-first, claude/quirky-rubin-s6rckq, gh-pages)  
**Status:** Ready for cleanup and consolidation

---

## BRANCH STRUCTURE (Currently)

```
main (base/production)
├── All backend code ✅
├── All engines ✅
├── API routes ✅
├── Python tests ✅
├── Frontend React ✅
├── Basic index.html ✅
├── Documentation ✅

claude/redesign-main-first (current work)
├── Everything from main ✅
├── + REDESIGN_MOCKUP.html (NEW - visual mockup)
├── + STATUS_VISUAL.html (NEW - status display)

claude/quirky-rubin-s6rckq (designated dev branch)
├── Identical to main
├── (No unique files)

gh-pages (documentation/deployment)
├── Deployment artifact
├── No unique code
```

**Key Finding:** Only 2 files are unique to `claude/redesign-main-first`

---

## COMPLETE FILE INVENTORY

### ROOT LEVEL FILES

| File | Location | Purpose | Status | Keep? | Priority |
|------|----------|---------|--------|-------|----------|
| `index.html` | main | Main application (1309 lines) | Working baseline | ✅ YES | **CRITICAL** |
| `REDESIGN_MOCKUP.html` | redesign-main | Visual mockup for new layout | Reference only | ⚠️ ARCHIVE | **LOW** |
| `STATUS_VISUAL.html` | redesign-main | Status visualization test | Experimental | ⚠️ ARCHIVE | **LOW** |
| `translator_ui_microsoft.html` | main | Microsoft translator UI | Unused | ❌ DELETE | **LOW** |
| `marble-bg.png` | main | Background image asset | Used by styling | ✅ YES | **MEDIUM** |
| `README.md` | main | Project documentation | Outdated | ⚠️ UPDATE | **MEDIUM** |
| `package.json` | main | Frontend dependencies | Essential | ✅ YES | **CRITICAL** |
| `.gitignore` | main | Git ignore rules | Essential | ✅ YES | **MEDIUM** |
| Various docs (*.md) | main | Design specifications, plans | Reference | ⚠️ CONSOLIDATE | **MEDIUM** |

**Action:** Keep index.html + marble-bg.png, archive mockups, delete unused files

---

### DOCUMENTATION FILES

| File | Lines | Purpose | Quality | Keep? | Action |
|------|-------|---------|---------|-------|--------|
| `README.md` | ~100 | Project overview | Needs update | ✅ UPDATE | Refresh with new design direction |
| `ADHD_KNOWLEDGE_BASE.md` | Large | Knowledge reference | Good | ✅ KEEP | Archive as reference |
| `DESIGN_MAIN_FIRST.md` | | Design spec (old) | Superseded | ⚠️ ARCHIVE | Move to /archives/old-specs |
| `IMPROVEMENTS.md` | | Feature list | Partial | ⚠️ ARCHIVE | Move to /archives/planning |
| `PHASE-1-BUILD-PLAN.md` | | Phase planning | Outdated | ⚠️ ARCHIVE | Move to /archives/planning |
| `PRIORITY_ANTIPATTERNS.md` | | Best practices | Reference | ✅ KEEP | Keep for developer guidance |
| `SYSTEM_OPTIMIZATION_ROADMAP.md` | | Optimization ideas | Partial | ⚠️ ARCHIVE | Move to /archives/planning |
| `CONSOLIDATION_STRATEGY.md` | NEW | Branch analysis | Current | ✅ KEEP | Root level - essential |
| `FEATURE_COMPARISON_MATRIX.md` | NEW | Feature status | Current | ✅ KEEP | Root level - essential |
| `IMPLEMENTATION_ROADMAP.md` | NEW | Code changes | Current | ✅ KEEP | Root level - essential |

**Action:** Create `/archives` folder, move old specs there, update README

---

### BACKEND STRUCTURE

| Path | Purpose | Files | Status | Keep? |
|------|---------|-------|--------|-------|
| `backend/app/engines/` | All 10 engines | 15 files | ✅ Complete | ✅ YES |
| `backend/app/api/` | API endpoints | 3 files | ✅ Complete | ✅ YES |
| `backend/app/models.py` | Data models | 1 file | ✅ Complete | ✅ YES |
| `backend/app/database.py` | Database setup | 1 file | ✅ Complete | ✅ YES |
| `backend/app/config.py` | Configuration | 1 file | ✅ Complete | ✅ YES |
| `backend/tests/` | Integration tests | 5+ files | ✅ Complete | ✅ YES |
| `backend/test_*.py` | Legacy tests | 4 files | Outdated | ⚠️ ARCHIVE |
| `backend/requirements.txt` | Dependencies | 1 file | ✅ Current | ✅ YES |
| `backend/.env.example` | Config template | 1 file | ✅ Current | ✅ YES |

**Status:** Backend is well-organized, no duplicates, all essential ✅

---

### FRONTEND STRUCTURE

#### Vanilla JS (index.html)
- **Status:** Main implementation, working
- **Lines:** 1309
- **Keep:** ✅ YES (will refactor in place)
- **Refactoring:** Add 3-column layout, modals, accordions, material polish

#### React/TypeScript (frontend/)
- **Status:** Professional but incomplete
- **Files:** App.tsx, components, services, types, styles
- **Keep:** ✅ YES (alternative future implementation)
- **Action:** Keep as backup, can migrate to in Phase 2

#### HTML Mockups
- **REDESIGN_MOCKUP.html:** Visual reference
- **STATUS_VISUAL.html:** Experimental
- **Action:** Archive both, design spec is authority

---

## DUPLICATE FILE ANALYSIS

### Searched Patterns

| Pattern | Found | Where | Action |
|---------|-------|-------|--------|
| `index.html` | 2 | Root: main | Root: redesign-main (same) | Keep root, delete redesign version if exists |
| Engines | 0 | All in backend/engines | No duplication | ✅ Clean |
| API routes | 0 | backend/app/api/ | No duplication | ✅ Clean |
| Tests | 3 versions | backend/tests + backend/test_*.py | Old tests can archive | Archive legacy tests |
| Design specs | 5+ versions | Various .md files in root | Old specs superseded by new files | Archive to /archives/old-specs |
| State management | 1 | Both frontends use localStorage | Good, coordinated | ✅ Clean |

**Finding:** Minimal duplication, mostly documentation version creep

---

## DETAILED FILE-BY-FILE DECISION MATRIX

### CRITICAL: Must Keep in Root
```
✅ index.html - Main application (refactoring in place)
✅ backend/ - All source code
✅ frontend/ - React implementation
✅ package.json - Dependencies
✅ marble-bg.png - Required asset
✅ .gitignore - Git configuration
✅ requirements.txt - Python dependencies
```

### ESSENTIAL: Keep But Consolidate
```
✅ README.md - Update with current status
✅ CONSOLIDATION_STRATEGY.md - New, keep in root
✅ FEATURE_COMPARISON_MATRIX.md - New, keep in root
✅ IMPLEMENTATION_ROADMAP.md - New, keep in root
✅ ADHD_KNOWLEDGE_BASE.md - Reference, keep
✅ PRIORITY_ANTIPATTERNS.md - Developer guide, keep
```

### IMPORTANT: Archive (Not Delete)
```
⚠️ DESIGN_MAIN_FIRST.md → /archives/old-specs/
⚠️ IMPROVEMENTS.md → /archives/planning/
⚠️ PHASE-1-BUILD-PLAN.md → /archives/planning/
⚠️ SYSTEM_OPTIMIZATION_ROADMAP.md → /archives/planning/
⚠️ backend/test_flow_preservation.py → /archives/old-tests/
⚠️ backend/test_improvements.py → /archives/old-tests/
⚠️ backend/test_phase_2a.py → /archives/old-tests/
⚠️ backend/test_phase_2b.py → /archives/old-tests/
```

### ARCHIVE: Can Delete
```
❌ REDESIGN_MOCKUP.html - Served purpose, design spec is authority
❌ STATUS_VISUAL.html - Experimental, not needed
❌ translator_ui_microsoft.html - Unused, legacy
❌ frontend/dist/ - Build artifacts, can regenerate
❌ docs/index.html - Build artifact, can regenerate
```

### DO NOT DELETE (Ever)
```
✅ backend/venv/ - Python virtual environment
✅ .git/ - Git repository
✅ node_modules/ - JavaScript dependencies
✅ .env files - Environment configuration (don't commit anyway)
```

---

## ARCHIVE STRUCTURE PLAN

Create this folder structure:
```
/archives/
├── old-specs/
│   ├── DESIGN_MAIN_FIRST.md
│   ├── design-spec-v1.0.md (if exists)
│   └── README.md (index of old specs)
├── planning/
│   ├── IMPROVEMENTS.md
│   ├── PHASE-1-BUILD-PLAN.md
│   ├── SYSTEM_OPTIMIZATION_ROADMAP.md
│   └── README.md (index of planning docs)
├── old-tests/
│   ├── test_flow_preservation.py
│   ├── test_improvements.py
│   ├── test_phase_2a.py
│   ├── test_phase_2b.py
│   └── README.md (why these were archived)
├── mockups/
│   ├── REDESIGN_MOCKUP.html
│   ├── STATUS_VISUAL.html
│   └── README.md (visual references)
└── README.md (archive index)
```

---

## BRANCH CLEANUP PLAN

### Current Branches
1. **main** - Base/production (NO CHANGES)
2. **claude/redesign-main-first** - Current work (MERGE & DELETE)
3. **claude/quirky-rubin-s6rckq** - Dev branch (KEEP & USE)
4. **gh-pages** - Documentation (KEEP)

### Recommended Actions

#### Step 1: Consolidate Changes
```bash
# Current state: claude/redesign-main-first has 2 extra files
git checkout claude/quirky-rubin-s6rckq
git pull origin claude/quirky-rubin-s6rckq
git merge origin/claude/redesign-main-first
# Now quirky has everything including the 2 files
```

#### Step 2: Archive & Cleanup
```bash
# Create archive structure
mkdir -p archives/{old-specs,planning,old-tests,mockups}

# Move files to archives
git mv DESIGN_MAIN_FIRST.md archives/old-specs/
git mv IMPROVEMENTS.md archives/planning/
git mv PHASE-1-BUILD-PLAN.md archives/planning/
git mv SYSTEM_OPTIMIZATION_ROADMAP.md archives/planning/
# ... etc

# Remove unnecessary HTML files from root
git rm REDESIGN_MOCKUP.html STATUS_VISUAL.html translator_ui_microsoft.html
```

#### Step 3: Delete Unused Branches
```bash
# After merging, delete the old redesign branch
git push origin --delete claude/redesign-main-first
git branch -d claude/redesign-main-first
```

#### Step 4: Clean Python Tests
```bash
# Move old tests to archive
git mv backend/test_flow_preservation.py archives/old-tests/
git mv backend/test_improvements.py archives/old-tests/
git mv backend/test_phase_2a.py archives/old-tests/
git mv backend/test_phase_2b.py archives/old-tests/
```

#### Step 5: Update README
```bash
# Update README with current project status
# Add reference to new design documents
# Document the archive structure
git add README.md
git commit -m "Update README with current design direction"
```

---

## FILES TO PRESERVE (CRITICAL DATA)

### From All Branches - Content to Not Lose

| Content | Source | Type | Action |
|---------|--------|------|--------|
| All backend engines | main | Code | ✅ Already in main, no risk |
| API implementation | main | Code | ✅ Already in main, no risk |
| React frontend | main | Code | ✅ Already in main, no risk |
| ADHD knowledge base | main | Doc | ✅ Keep in root |
| Antipatterns guide | main | Doc | ✅ Keep in root |
| State management logic | index.html | Code | ✅ Refactoring in place |
| Session system | All | Code | ✅ No changes needed |
| Learning system | backend | Code | ✅ No changes needed |
| Translation engine | backend | Code | ✅ No changes needed |
| Routing engine | backend | Code | ✅ No changes needed |
| Composition techniques (12) | backend | Code | ✅ No changes needed |

**Risk Assessment:** ✅ LOW - All critical code is in main, well-backed-up

---

## CONSOLIDATION SEQUENCE

### Phase A: Analysis (DONE)
- ✅ Analyzed all branches
- ✅ Created consolidation strategy
- ✅ Created implementation roadmap
- ✅ Identified all files

### Phase B: Preparation
1. Create archive folder structure
2. Document what's being archived and why
3. Create archive README files (explain what each archive contains)
4. Tag current commits for reference

### Phase C: Consolidation
1. Merge redesign-main-first → quirky-rubin-s6rckq
2. Move files to archives
3. Delete old test files from active code
4. Remove unnecessary HTML files
5. Update documentation
6. Commit with message: "Consolidate branches, archive old designs, prepare for Phase 1 implementation"

### Phase D: Cleanup
1. Delete claude/redesign-main-first branch (local and remote)
2. Verify quirky-rubin-s6rckq has everything needed
3. Update .gitignore if needed
4. Final commit: "Clean branch structure, ready for development"

### Phase E: Verification
1. All critical code present ✅
2. All documentation consolidated ✅
3. Archives properly organized ✅
4. No duplicates ✅
5. Ready to develop ✅

---

## FILE SIZE IMPACT

### Current State (Estimated)
```
Critical code:    ~500 KB (backend + frontend)
Documentation:    ~2 MB (docs, specs, guides)
Assets:          ~100 KB (images)
Dependencies:     ~500 MB (venv, node_modules)
TOTAL:           ~502 MB
```

### After Cleanup
```
Critical code:    ~500 KB (unchanged)
Documentation:    ~1 MB (consolidated)
Assets:          ~100 KB (unchanged)
Dependencies:     ~500 MB (unchanged)
Archived:         ~1 MB (old docs, tests)
TOTAL:           ~501 MB (99% same)
```

**Note:** Savings are minimal because heavy items (dependencies) remain. Benefit is **organizational clarity**, not storage.

---

## DOCUMENTATION CONSOLIDATION

### New Master Documents (Keep in Root)
1. **CONSOLIDATION_STRATEGY.md** (NEW)
   - Branch analysis
   - Feature comparison
   - Gap analysis
   - Recommendations

2. **FEATURE_COMPARISON_MATRIX.md** (NEW)
   - Implementation status
   - Backend inventory
   - Frontend status
   - Complexity scoring

3. **IMPLEMENTATION_ROADMAP.md** (NEW)
   - Phase-by-phase changes
   - Specific code locations
   - Testing checklist
   - Success criteria

### Archived Old Specs (Move to /archives/old-specs/)
1. DESIGN_MAIN_FIRST.md
2. Any old design v1.0, v1.1, etc.
3. Old wireframes or mockups

**Rationale:** New design specs (VISUAL-SPECIFICATION-V2.0, etc.) supersede all old specs. Keep old for reference only (in archives).

### Archived Planning Docs (Move to /archives/planning/)
1. IMPROVEMENTS.md
2. PHASE-1-BUILD-PLAN.md
3. SYSTEM_OPTIMIZATION_ROADMAP.md

**Rationale:** These represented old planning. New implementation roadmap supersedes them.

### Archived Tests (Move to /archives/old-tests/)
1. test_flow_preservation.py
2. test_improvements.py
3. test_phase_2a.py
4. test_phase_2b.py

**Rationale:** Old test files. Current tests in backend/tests/ are current.

---

## DATA PRESERVATION VERIFICATION

### Backend Engines (All Present ✅)
```
✅ Translation (analyzer, operations, scorer)
✅ Routing (adhd_state, decision_tree)
✅ Anti-Sycophancy
✅ RSD Detection
✅ Cognitive Load
✅ Flow Preservation
✅ Memory/Learning
✅ Composition (composer + 12 techniques)
✅ Response Formatting
✅ Response Pipeline
```

### API Routes (All Present ✅)
```
✅ /api/translate
✅ /api/route
✅ /api/compose
✅ /api/ask
✅ /api/feedback
✅ /api/learn
```

### Frontend Logic (All Present ✅)
```
✅ State detection
✅ Session management
✅ Conversation history
✅ Pattern learning
✅ localStorage persistence
✅ Multi-model support
```

### Knowledge & Guidelines (All Present ✅)
```
✅ ADHD Knowledge Base
✅ Antipatterns Guide
✅ Design Specifications (V2.0)
✅ Feature Specifications
✅ Design Decision Hierarchy
✅ Information Architecture
```

---

## EXECUTION INSTRUCTIONS

### Step-by-Step Cleanup

**1. Create Archive Structure**
```bash
mkdir -p archives/{old-specs,planning,old-tests,mockups}
touch archives/README.md
```

**2. Create Archive Index Files**

archives/README.md:
```
# Archives

This directory contains historical documents, old designs, and deprecated code.
Kept for reference only. Do not use in active development.

## Contents

- old-specs/ - Old design specifications (superseded by V2.0 specs)
- planning/ - Historical planning documents
- old-tests/ - Deprecated test files
- mockups/ - Visual mockups and prototypes
```

archives/old-specs/README.md:
```
# Old Design Specifications

These specifications have been superseded by V2.0 specs.

Kept for historical reference. For current design authority, see:
- VISUAL-SPECIFICATION-V2.0.md
- FEATURE-SPECIFICATION-V2.0.md
- DESIGN-DECISION-HIERARCHY-V2.0.md
- INFORMATION-ARCHITECTURE-V2.0.md
```

**3. Move Files**
```bash
git mv DESIGN_MAIN_FIRST.md archives/old-specs/
git mv IMPROVEMENTS.md archives/planning/
git mv PHASE-1-BUILD-PLAN.md archives/planning/
git mv SYSTEM_OPTIMIZATION_ROADMAP.md archives/planning/
git mv backend/test_flow_preservation.py archives/old-tests/
git mv backend/test_improvements.py archives/old-tests/
git mv backend/test_phase_2a.py archives/old-tests/
git mv backend/test_phase_2b.py archives/old-tests/
git mv REDESIGN_MOCKUP.html archives/mockups/
git mv STATUS_VISUAL.html archives/mockups/
```

**4. Delete Unused Files**
```bash
git rm translator_ui_microsoft.html
git rm -rf frontend/dist
git rm -rf docs/index.html
```

**5. Update .gitignore** (if needed)
Add to .gitignore if not already there:
```
venv/
node_modules/
.env
.env.local
__pycache__/
*.pyc
dist/
build/
```

**6. Commit Cleanup**
```bash
git add -A
git commit -m "Consolidate branches and archive old designs

- Move old design specs to /archives/old-specs/
- Move planning docs to /archives/planning/
- Move deprecated tests to /archives/old-tests/
- Move mockups to /archives/mockups/
- Remove unused HTML files
- Keep only essential files in root

All critical code preserved. Ready for Phase 1 implementation."
```

**7. Merge Branches**
```bash
git checkout claude/quirky-rubin-s6rckq
git merge origin/claude/redesign-main-first
# (now quirky has all cleanup changes)
```

**8. Delete Old Branch**
```bash
git branch -d claude/redesign-main-first
git push origin --delete claude/redesign-main-first
```

**9. Push Changes**
```bash
git push -u origin claude/quirky-rubin-s6rckq
```

---

## VERIFICATION CHECKLIST

After cleanup, verify:

```
✅ All backend code present
✅ All frontend code present
✅ All new design specs present
✅ All critical documentation present
✅ Archives properly organized
✅ No important files deleted
✅ All code still builds/runs
✅ No duplicates remain
✅ Branch structure clean
✅ Ready for implementation
```

---

## RISK ASSESSMENT

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Accidentally delete critical code | Low | High | Review each file before moving to archive |
| Lose old design ideas | Low | Medium | Archive all old docs, not delete them |
| Break dependencies | Very Low | Medium | Don't touch venv/ or node_modules/ |
| Merge conflicts | Low | Medium | Do cleanup on quirky-rubin branch only |
| Forget what was archived | Low | Low | Document archive structure in README |

**Overall Risk:** ✅ LOW - Procedure is straightforward, all files backed up

---

## FINAL STATUS

### What You'll Have After Cleanup

✅ **Clean Repository**
- 4 branches (main, quirky-rubin, gh-pages, and optionally remove redesign-main)
- Organized file structure
- No duplicate code
- Clear archives for historical reference

✅ **Ready to Implement**
- All backend engines intact
- All frontend code intact
- New design specifications in place
- Implementation roadmap ready
- No distractions from old code

✅ **Well-Documented**
- CONSOLIDATION_STRATEGY.md (analysis & decisions)
- FEATURE_COMPARISON_MATRIX.md (status tracking)
- IMPLEMENTATION_ROADMAP.md (exact code changes)
- Archive README files (explains what's archived)

✅ **Future-Proof**
- Old designs archived but accessible
- Old tests preserved for reference
- No critical data lost
- Clear direction forward

---

**Document Status:** Complete & Ready for Execution  
**Next Step:** Execute cleanup procedure, then begin Phase 1 implementation  
**Estimated Cleanup Time:** 30 minutes (straightforward procedure)
