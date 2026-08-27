# Checkpoint D — Live Verification Matrix & Test Plan
Candidate SHA: `80ed82b`  
Public deployment baseline: `https://claude-project-02.vercel.app/` (to be updated with `80ed82b`)

---

## Part 1: Deployment Verification

### Pre-Deployment Checklist
- [ ] Verify candidate SHA `80ed82b` is clean (no uncommitted changes)
- [ ] Confirm build passes: `npm run build` → SUCCESS
- [ ] Confirm all tests pass: `npm run test` → 714 PASS
- [ ] Record exact deployment timestamp and Vercel deployment ID
- [ ] Verify deployed version displays build marker or commit SHA in UI (if available)

### Post-Deployment Checklist
- [ ] Wait for Vercel to finish build (typically 2–3 minutes)
- [ ] Access preview URL: `https://claude-project-02.vercel.app/`
- [ ] Verify page loads without errors
- [ ] Check browser console for errors (F12 → Console)
- [ ] Record: Deployment URL, Vercel build ID, timestamp deployed

---

## Part 2: Acceptance Test Matrix — User Outcomes

### Test A1: Template Creation, Save, Reload, Load
**Starting state**: Fresh session, no saved templates (besides defaults)

| Step | Action | Expected | Pass/Fail | Evidence |
|------|--------|----------|-----------|----------|
| 1 | Navigate to Talk to AI | Composer visible, draft empty | | |
| 2 | Type draft text: "Explain quantum computing" | Text appears in draft box | | |
| 3 | Add context: paste URL or text snippet | Text appears in Context Snapshot | | |
| 4 | Click Load Template → Save current settings | Save dialog opens | | |
| 5 | Enter template name: "Quantum Explainer" | Name field accepts text | | |
| 6 | Click Save button | Dialog closes; status message appears | | |
| 7 | Click Load Template again | Template list shows "Quantum Explainer" | | |
| 8 | Reload page (Ctrl+R or F5) | Page reloads; no data loss | | |
| 9 | Click Load Template again | "Quantum Explainer" still in list | | |
| 10 | Click to load "Quantum Explainer" | Draft and context restored; model/settings applied | | |

**Acceptance**: All steps pass; context and draft survive reload.

---

### Test A2: Select Conversation Range → Multi-AI → Results Persist After Reload
**Starting state**: Fresh session with conversation

| Step | Action | Expected | Pass/Fail | Evidence |
|------|--------|----------|-----------|----------|
| 1 | Send a test question | Message appears in conversation as user message | | |
| 2 | Get AI response (manual copy-paste acceptable) | Response appears in conversation | | |
| 3 | Click Multi-AI Actions toggle | Section expands | | |
| 4 | Click "Select last exchange" | User question and AI response highlighted | | |
| 5 | Click "Review selected context" | Preview dialog shows exact bundle | | |
| 6 | Click "Use this context in Multi-AI" | Dialog closes; "Prepared context" message shows | | |
| 7 | (If paid route available) Select partner(s) and click Start Debate | Debate begins (or error if provider unavailable) | | |
| 8 | (If debate runs) Consensus/Synthesis complete | Results appear; persisted to conversation | | |
| 9 | Reload page | Conversation intact; Multi-AI results visible | | |

**Acceptance**: Selection, debate, and results persist through reload.

---

### Test A3: Attach File → Validate Metadata → Reject Oversized
**Starting state**: Fresh session

| Step | Action | Expected | Pass/Fail | Evidence |
|------|--------|----------|-----------|----------|
| 1 | Click Attach in composer | File input dialog opens | | |
| 2 | Select valid small text file (.txt, 1 KB) | File appears in Context Snapshot with name, type, size | | |
| 3 | Verify Context Snapshot shows: ID, type, size, "removable" | All fields present | | |
| 4 | Click remove button on file | File removed from Context Snapshot | | |
| 5 | Try to attach oversized file (>50 MB) | Error message appears; file NOT added | | |
| 6 | Verify error is specific (e.g., "exceeds 50 MB limit") | Error is actionable, not generic | | |

**Acceptance**: Valid files added with full metadata; oversized rejected with clear error.

---

### Test A4: Paste Public URL → Preview → Add to Context
**Starting state**: Fresh session

| Step | Action | Expected | Pass/Fail | Evidence |
|------|--------|----------|-----------|----------|
| 1 | Click Attach → Paste a URL | URL input field appears | | |
| 2 | Paste a public URL (e.g., `https://example.com`) | Field accepts URL | | |
| 3 | Click Fetch or Preview button | Preview loads and shows page text | | |
| 4 | Click "Add to context" | URL content appears in Context Snapshot | | |
| 5 | Try to paste a blocked URL (e.g., `https://internal-service`) | Error message: "Blocked URL" or "Not accessible" | | |

**Acceptance**: Public URLs preview and add; blocked URLs rejected with specific reason.

---

### Test A5: Provider Status → Refresh → Shows Current State
**Starting state**: Settings screen

| Step | Action | Expected | Pass/Fail | Evidence |
|------|--------|----------|-----------|----------|
| 1 | Navigate to Settings | Settings panel loads | | |
| 2 | Scroll to "AI Connections" section | Provider list visible | | |
| 3 | Check each provider row | Shows "Configured & server-ready" OR "Not configured / not ready" | | |
| 4 | Click "Refresh provider status" button | Status updates; timestamp changes | | |
| 5 | Verify status is not hard-coded "ready" | Status matches server reality (not cached) | | |

**Acceptance**: Status reflects current server state; refresh is live.

---

### Test A6: Session Save/Archive → Reload → Verify Persisted
**Starting state**: Active session with conversation

| Step | Action | Expected | Pass/Fail | Evidence |
|------|--------|----------|-----------|----------|
| 1 | Send a test message | Appears in conversation | | |
| 2 | Click Quick Actions → More → Finish Session | Dialog with Keep/Save/Archive/Discard appears | | |
| 3 | Click Save | Session saved; status message appears | | |
| 4 | Click Sessions in left nav | Sessions list loads | | |
| 5 | Verify saved session appears in list | Session title/date visible | | |
| 6 | Reload page | Sessions list still shows saved session | | |
| 7 | Click to open saved session | Conversation messages restored | | |

**Acceptance**: Save persists through reload; conversation intact.

---

### Test A7: Create Project → Tag Session → Reload → Verify Persisted
**Starting state**: Active session; Projects screen

| Step | Action | Expected | Pass/Fail | Evidence |
|------|--------|----------|-----------|----------|
| 1 | Navigate to Projects | Projects screen loads | | |
| 2 | Look for "Create Project" or similar button | Button exists and is clickable | | |
| 3 | Click to create new project | Dialog or form for project name appears | | |
| 4 | Enter project name: "Quantum Research" | Name field accepts text | | |
| 5 | Complete project creation | Project appears in list | | |
| 6 | (If available) Assign current session to project | Session linked to project | | |
| 7 | Reload page | Project and session assignment persist | | |

**Acceptance**: Projects can be created; sessions can be tagged; persist through reload.

---

## Part 3: Regression Tests — Known Prior Fixes

### Test R1: Top-Bar Panels Close on Navigation
| Step | Action | Expected |
|------|--------|----------|
| 1 | Click Quick Reference button (top bar) | Panel opens |
| 2 | Click Talk to AI in left nav | Panel closes; navigation succeeds |
| **Acceptance** | Panel dismissed on primary nav | PASS/FAIL |

### Test R2: All Tools Dialog Routes Correctly
| Step | Action | Expected |
|------|--------|----------|
| 1 | Click All Tools (top bar) | Dialog opens |
| 2 | Click "AI Connections" option | Routes to Settings > Connections (no 404) |
| 3 | Click All Tools again | Dialog closes |
| **Acceptance** | All entries route without error | PASS/FAIL |

### Test R3: Template Load Applies Starter Question
| Step | Action | Expected |
|------|--------|----------|
| 1 | Create template with draft text: "Ask me about X" | Template saves |
| 2 | Clear draft; load that template | Draft field auto-fills with "Ask me about X" |
| **Acceptance** | Starter question loads and pre-populates draft | PASS/FAIL |

### Test R4: Imported Response Not Inert
| Step | Action | Expected |
|------|--------|----------|
| 1 | Prepare a response to import (copy/paste format) | Preparation shown |
| 2 | Click Import → select prepared response | Import succeeds; response appears in conversation |
| **Acceptance** | Import is functional, not placeholder | PASS/FAIL |

---

## Part 4: Error Scenario Tests (Optional, High Priority)

### Test E1: Provider Timeout Handling
**Condition**: Simulate or trigger a provider timeout
- **Expected**: Error message distinct from "network error"
- **Evidence**: Message names "timeout" and suggests retry

### Test E2: Oversized File Rejection
**Condition**: Attempt to attach 100+ MB file
- **Expected**: Specific error about size limit, not generic error
- **Evidence**: User can try different file or reduce size

### Test E3: Multi-AI Partial Failure
**Condition**: Start debate with 3 providers; one fails mid-response
- **Expected**: Partial results show; successful sides preserved; can retry only failed one
- **Evidence**: Debate view shows statuses (✓ ok, ✗ error)

---

## Part 5: Recording Results

### Pass/Fail Template for Each Test
```
Test Name: [A1, A2, etc.]
Deployed SHA: 80ed82b
Timestamp: [YYYY-MM-DD HH:MM:SS UTC]
Browser: [Chrome/Firefox/Safari + version]

Result: PASS / FAIL / BLOCKED

Evidence:
- [Step number]: [What you observed]
- Screenshots attached: [y/n, filenames if yes]

Notes: [Any deviations from expected; error messages if failed]
```

### Summary Scorecard
```
Total tests: 14 core + 4 regression + 3 optional error scenarios = 21
Passed: ___
Failed: ___
Blocked (provider unavailable): ___

Showstopper failures (deploy must be rejected): ___
Minor issues (note and continue): ___
```

---

## Part 6: Deployment Decision Criteria

### ✅ Deploy to Production IF:
- [ ] All 14 core acceptance tests pass (A1–A7)
- [ ] All 4 regression tests pass (R1–R4)
- [ ] No showstopper failures
- [ ] Core workflows (template, Multi-AI, file attach, provider status, session save) are functional

### ⚠️ Deploy with Caveats IF:
- [ ] Core tests pass but 1–2 optional error scenarios fail
- [ ] Known limitation does not affect primary user journeys
- [ ] Issue documented for follow-up fix

### ❌ Reject IF:
- [ ] Any core test fails (A1–A7)
- [ ] Session data loss occurs
- [ ] Provider integration broken
- [ ] Build/deployment issue prevents access

---

## Verification Completion Checklist

- [ ] Deployment successful; SHA `80ed82b` live
- [ ] Browser smoke test run; results recorded above
- [ ] Pass/fail counts tallied
- [ ] Screenshots/logs captured
- [ ] Deployment decision made (DEPLOY / REJECT / CAVEAT)
- [ ] Decision documented with evidence
- [ ] Next action identified (merge / rollback / changes needed)
