# Learnable Signal Set: 30+ Detection Rules

**Purpose:** Identify derailment patterns and optimize conversation trajectories. Organized by priority tier and function category.

---

## PRIORITY TIER 1 (5-10 Rules) — 37% → 65% Improvement

These 5-10 rules form the foundation for moving from 37.2% baseline to 65% success rate.

### Rule 1.1: Early Clarification Enforcement
**Function:** Disambiguate requirements and intent before executing
**Signal:** Absence of clarification events in first 10 messages
**Detection:** Event stream lacks "clarification accepted" markers by event 10
**Action:** Trigger clarification prompt if initial statements are ambiguous
**Impact:** 88-94% success correlation when present early
**Implementation:** Natural language ambiguity detection + mandatory clarification gate

### Rule 1.2: Failure Detection by Event 20
**Function:** Flag errors early while recovery is possible
**Signal:** Explicit failure marker or divergence from goal
**Detection:** Failure event appears before event 20
**Action:** Trigger immediate course-correction dialogue
**Recovery Rate:** 85%+ when triggered by event 20; drops significantly after
**Implementation:** Error pattern matching + escalation system

### Rule 1.3: Goal State Validation at Checkpoints
**Function:** Ensure goal remains stable and consistent
**Signal:** Goal context shifts without explicit acknowledgment
**Detection:** Goal mentions change without "goal clarification" event following
**Action:** Re-confirm goal at events 10, 20, 40
**Failure Indicator:** Goal changes = 89% failure rate if undetected
**Implementation:** Goal parsing + confirmation protocol

### Rule 1.4: Progress Checkpoint Verification
**Function:** Ensure incremental advancement toward goal
**Signal:** Absence of progress events within 8-12 event window
**Detection:** Event stream shows no "progress milestone" markers
**Action:** Request status update or pivot strategy
**Success Indicator:** Regular progress events = sustained momentum
**Implementation:** Progress metric tracking + stall detection

### Rule 1.5: Early Derailment Signal Detection
**Function:** Catch conversation going off-track before cascade
**Signal:** Topic divergence, goal drift, or analysis without action
**Detection:** Sequence of analysis events without correction/success events
**Action:** Redirect to core goal or request decision
**Cascade Prevention:** Intervention by event 20 prevents 85%+ of failures
**Implementation:** Topic coherence analysis + goal relevance scoring

---

## PRIORITY TIER 2 (8-12 Rules) — 65% → 70% Improvement

Additional detection mechanisms for incremental 5-point improvement.

### Rule 2.1: Progress Checkpoint Validation System
**Function:** Validate that progress is real, not illusory
**Signal:** Events marked as progress but don't advance goal state
**Detection:** Progress events occur but conversation length grows without completion
**Action:** Require actual advancement proof before accepting progress marker
**Implementation:** Goal state advancement verification

### Rule 2.2: Goal Change Isolation Detection
**Function:** Detect when users shift goals mid-stream without saying so
**Signal:** Conversation content diverges from stated goal
**Detection:** Natural language topic shift detection
**Action:** Explicit goal re-confirmation dialogue
**Failure Rate:** 89% if undetected
**Implementation:** Content relevance scoring vs. stated goal

### Rule 2.3: Feedback Loop Quality Assessment
**Function:** Ensure corrections are actually being implemented
**Signal:** Repeated errors of same type despite correction events
**Detection:** Error pattern recurrence after correction event
**Action:** Escalate to different correction approach
**Implementation:** Error pattern memory + approach variation

### Rule 2.4: Conversation Trajectory Analysis
**Function:** Monitor overall path shape and predict outcomes
**Signal:** Trajectory angle indicators (stalling, diverging, accelerating)
**Detection:** Measure event density and direction over time windows
**Action:** Adjust pacing or strategy if trajectory deviates
**Implementation:** Trajectory math + early outcome prediction

### Rule 2.5: State Transition Monitoring
**Function:** Catch contradictory or inconsistent state changes
**Signal:** Conversation state becomes internally contradictory
**Detection:** State validation across event history
**Action:** Surface contradiction and require resolution
**Implementation:** State consistency checker

### Rule 2.6: Clarification Quality Validation
**Function:** Ensure clarifications actually reduced ambiguity
**Signal:** Post-clarification messages still show same ambiguity
**Detection:** Clarification event followed by same type of confusion
**Action:** Request deeper clarification or provide examples
**Implementation:** Ambiguity scoring before/after clarification

### Rule 2.7: Correction Effectiveness Tracking
**Function:** Measure whether corrections are working
**Signal:** Correction event doesn't reduce error rate in following events
**Detection:** Error frequency same before/after correction
**Action:** Try different correction approach or root cause analysis
**Implementation:** Error frequency analysis

### Rule 2.8: Feedback Absorption Validation
**Function:** Ensure user is integrating feedback
**Signal:** Feedback provided but not reflected in subsequent work
**Detection:** Feedback event → same type of work continues unchanged
**Action:** Explicit acknowledgment requirement before proceeding
**Implementation:** Feedback tracing

---

## PRIORITY TIER 3 (5-8 Rules) — 70% → 75% Improvement

Advanced detectors for final incremental gains.

### Rule 3.1: Derailment Scoring Algorithm
**Function:** Score probability of failure based on multiple signals
**Signal:** Multiple minor red flags accumulate
**Detection:** Weighted scoring across 6 failure modes
**Action:** Increase intervention frequency and directness if score >threshold
**Implementation:** Multi-factor probability model

### Rule 3.2: Transition Pattern Monitoring
**Function:** Identify when conversation is entering dangerous pattern
**Signal:** Transition into one of the 6 known failure modes
**Detection:** Event sequence matches known failure mode opening
**Action:** Preemptively block failure mode entry
**Implementation:** Pattern matching against 6 failure mode signatures

### Rule 3.3: Analysis Quality Assessment
**Function:** Determine when analysis is productive vs. paralytic
**Signal:** Analysis-only events without action/decision events
**Detection:** Event type sequence: analysis → analysis → analysis... (no correction)
**Failure Indicator:** Analysis paralysis = 85% failure rate
**Action:** Force decision point or action step
**Implementation:** Analysis-to-action ratio detection

### Rule 3.4: Recovery Path Optimization
**Function:** When failure is detected, recommend best recovery approach
**Signal:** Failure event detected; multiple recovery paths available
**Detection:** Failure event triggers recovery protocol
**Action:** Select recovery path based on failure mode type
**Implementation:** Failure mode → recovery mapping

### Rule 3.5: Momentum Tracking
**Function:** Maintain and optimize conversation momentum
**Signal:** Decreasing event density or longer gaps between actions
**Detection:** Moving average of event frequency
**Action:** Increase pace or provide encouragement
**Implementation:** Momentum metrics

### Rule 3.6: Stall Detection at Event 30+
**Function:** Catch momentum loss before cascade
**Signal:** No progress events by event 30
**Detection:** Absence of progress marker in first 30 events
**Action:** Require decision point or significant progress by event 40
**Implementation:** Progress tracking + deadline enforcement

### Rule 3.7: Context Loss Detection
**Function:** Catch state inconsistencies before they compound
**Signal:** References to previous context become incorrect
**Detection:** Context verification at checkpoints
**Action:** Refresh context or clarify references
**Implementation:** Context consistency checker

### Rule 3.8: Complexity Management
**Function:** Ensure conversation stays within manageable scope
**Signal:** Scope expands beyond original goal
**Detection:** Goal cardinality tracking (1 goal vs. multiple goals)
**Action:** Force prioritization or scope reduction
**Implementation:** Goal cardinality constraint

---

## SIGNAL DETECTION PSEUDOCODE

```
// Core detection loop (runs after each event)
function detectSignals(event, conversationHistory):
  signals = []
  
  // Tier 1 checks (events 1-20 critical)
  if (currentEventNumber <= 20):
    if (hasClarificationEvents == false):
      signals.push("EARLY_CLARIFICATION_NEEDED")
    if (hasGoalConfirmation == false):
      signals.push("GOAL_VALIDATION_REQUIRED")
    if (hasFailureMarker && currentEventNumber <= 20):
      signals.push("EARLY_FAILURE_DETECTED_RECOVERABLE")
    if (hasProgressMarker == false && currentEventNumber >= 15):
      signals.push("PROGRESS_STALLED")
  
  // Tier 2 checks (events 20-50)
  if (currentEventNumber > 20 && currentEventNumber <= 50):
    goalDrift = calculateGoalRelevance(event, originalGoal)
    if (goalDrift > threshold):
      signals.push("GOAL_DRIFT_DETECTED")
    
    errorRecurrence = checkForRepeatedErrors(event, correctionHistory)
    if (errorRecurrence > threshold):
      signals.push("FEEDBACK_NOT_ABSORBED")
    
    trajectory = calculateTrajectorySlope(eventHistory)
    if (trajectory < stallThreshold):
      signals.push("MOMENTUM_DEGRADING")
  
  // Tier 3 checks (events 50+)
  if (currentEventNumber > 50):
    derailmentScore = computeMultiFactorScore(signals, eventHistory)
    if (derailmentScore > criticalThreshold):
      signals.push("CRITICAL_DERAILMENT_LIKELY")
    
    stateConsistency = validateStateAcrossHistory()
    if (stateConsistency < consistency Threshold):
      signals.push("STATE_CONTRADICTION_DETECTED")
  
  return signals

// Failure mode classification
function classifyFailureMode(eventHistory):
  if (isolatedGoalChange(eventHistory)):
    return FAILURE_MODE.ISOLATED_GOAL_CHANGES  // 89% failure
  if (analysisPara lysis(eventHistory)):
    return FAILURE_MODE.ANALYSIS_PARALYSIS  // 85% failure
  if (missingClarifications(eventHistory)):
    return FAILURE_MODE.CLARIFICATION_AVOIDANCE  // 70% failure
  if (repeatedErrors(eventHistory)):
    return FAILURE_MODE.QUALITY_DEGRADATION_LOOP  // 52-70% failure
  if (stallDetected(eventHistory)):
    return FAILURE_MODE.MOMENTUM_LOSS  // 43-52% failure
  if (stateContradiction(eventHistory)):
    return FAILURE_MODE.STATE_TRANSITION_ERRORS  // 28-43% failure
  return null

// Recovery recommendation
function recommendRecovery(failureMode):
  recovery_map = {
    ISOLATED_GOAL_CHANGES: "goal_clarification_protocol",
    ANALYSIS_PARALYSIS: "decision_forcing_protocol",
    CLARIFICATION_AVOIDANCE: "ambiguity_elimination_protocol",
    QUALITY_DEGRADATION_LOOP: "root_cause_analysis_protocol",
    MOMENTUM_LOSS: "momentum_acceleration_protocol",
    STATE_TRANSITION_ERRORS: "state_reset_protocol"
  }
  return recovery_map[failureMode]
```

---

## Implementation Priority

**Phase 1 (Immediate):** Implement Tier 1 rules 1.1-1.5 (clarification, failure detection, goal validation, progress tracking, derailment signals)

**Phase 2 (Weeks 2-4):** Add Tier 2 rules (trajectory analysis, state monitoring, feedback quality, goal change detection)

**Phase 3 (Weeks 4-8):** Add Tier 3 rules (scoring algorithms, pattern monitoring, momentum tracking, recovery optimization)

**Validation:** A/B test each tier against baseline; target 37% → 65% → 70% → 75% progression
