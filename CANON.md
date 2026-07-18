# DIVERGENCE.AI — CANON
**The single source of product truth. This file replaces CANONICAL-AUTHORITY.md, DIVERGENCE-APP-REQUIREMENTS.md, and the product half of MASTER-REFERENCE.md. Those files contained contradictions and are retired. Where anything ever disagrees with this file, this file wins. Where this file disagrees with the V3 screenshot, the screenshot wins.**

---

## WHAT IT IS

DIVERGENCE.AI is an ADHD-friendly AI communication bridge. The user types scattered, emotional, tangential thoughts. The app finds the real question buried in there, reframes it clearly, routes it to the right AI model, adapts tone to the user's emotional state, and explains every decision it made. It removes the work of "translating yourself before you can ask."

Web first. One browser codebase. Windows and Android come later by wrapping this same code, not rebuilding.

---

## LOCKED DECISIONS (settled, do not reopen)

1. **Visual truth is the V3 screenshot** (Divergence_AI_App_Screenshot_V3.png). If a file disagrees with the image, the image wins.
2. **Three marble surfaces, not seven.** Black Marble background, Smoked Glass cards, Blue Marble buttons. The seven-name system (Graphite, Slate, Mist, Pearl, Obsidian, Onyx, Luminescence) is dead. "Light" is lighting rules, not a material. Full detail in MATERIALS.md.
3. **Model strings:** Haiku 4.5 is claude-haiku-4-5, Balanced is claude-sonnet-5, Opus 4.8 is claude-opus-4-8. Extended thinking is a toggle on a model, not a model. Ignore any "Opus Fast" or "Opus Thinking" naming.
4. **State detection fires on the TRANSLATE & ASK button, not while typing.** No live-as-you-type detection.
5. **Autosave every 5 seconds**, quiet background save. Crash and close protection.
6. **Logged in by default**, persistence on, logout button bottom-left under System Status.
7. **Purple is allowed on state pills** (the screenshot shows a purple Emotion pill), not logo-only.
8. **Include every technique**, do not agonize over the count, prune later.
9. **Quick Tools panel defaults to hidden (OFF).**
10. **Routing engine is already built and tested** (routing.js, tests.js). It is wired in, not rebuilt. See ROUTING.md.

---

## THE 12 FEATURES

**1. Translation Engine.** Raw ADHD input in, the real question reframed clearly out, with a confidence score. Detects gap types (tangential preamble, emotional intensity distortion, compound buried request, typo/pronoun/wrapper corruption, scope ambiguity, unstated assumptions). Confidence 0 to 100 means "did I identify the right request." Detail in PIPELINE.md.

**2. Routing Engine.** Picks the model for the question. Already built. Free tier auto-routes Haiku and Sonnet. Paid adds Opus and extended thinking. User override always wins. Detail in ROUTING.md.

**3. Directness Control.** Three tone levels. Level 1 supportive with scaffolding, Level 2 balanced (default), Level 3 blunt and concise. Persists in session. State detection can auto-recommend a level (Overwhelmed recommends Level 1).

**4. Technique Selection.** The user picks how the AI answers, or Auto-detect chooses. Include every technique: Socratic (default), Quote-First, Chain-of-Thought, Role-Prime, Verify, Examples, Simplify, Detailed, Step-by-step, Comparative, Metaphor, Auto-detect. Auto-detect scores techniques, respects conflicts and dependencies, stacks at most 4. Persists in session.

**5. State Detection.** On the button press, classify the input across four dimensions and show colored pills. Emotion (Overwhelmed, Frustrated, Calm, Excited, Anxious), RSD Level (Low, Medium, High), Interest (Low, Medium, High), Cognitive Mode (Analytical, Creative, Processing, Racing, Stuck). Pills are dismissible and correctable. After 15+ corrections for a state, detection adapts for that user. Detail in PIPELINE.md.

**6. Context Management.** Load external info into the session: upload files (PDF, TXT, JSON, CSV, images with OCR), paste text, paste URL (fetched through the proxy), create variables ($name). Context persists across questions in the session. Limits: 10MB per file, 50MB per session. A Context Snapshot panel shows loaded items with remove buttons.

**7. Feedback and Rating.** 5-star rating under each answer with an optional "What could be better?" field. Saves immediately. Feedback is always optional and neutral in tone, never required, never judgmental. Feeds the learning loop.

**8. Transparency Details.** An expandable card with three sub-cards: Routing (model, complexity score, domain, scope), Techniques (which applied and why), Confidence (translation, routing, technique, overall). The user always sees what the app decided and why. Never a black box.

**9. Multi-AI Actions.** After an answer: Debate (two AIs argue opposite sides, two-column view), Consensus (common ground after a debate), Synthesis (combine perspectives into one refined answer the user can use to replace or merge).

Debate mode uses two DIFFERENT AI providers, never two Claude calls arguing with itself — same-model debate is known to converge into agreement-theater rather than surfacing real disagreement. Claude is always one side. The user picks the second side from a roster: GPT-5.5 (agentic generalist, strong practical reasoning), Gemini 3.1 Pro (abstract/reframing reasoning, best multimodal), Grok 4.3 (real-time grounded, blunt/unfiltered counterpoint), DeepSeek V4 Pro (near-frontier reasoning at low cost, for high-frequency debate use). If no side is picked, default to GPT-5.5 as the counterpart.

Consensus and Synthesis run on Opus at runtime, reading both sides' transcripts regardless of which two providers argued.

**10. Download and Export.** Download modal: pick content (answer text, confidence, rating, transparency, state pills) and format (Markdown default, HTML, JSON, PDF), then download or copy to clipboard.

**11. Session Management.** New Session (fresh conversation, keeps settings, clears history and context), Duplicate Session (copy conversation, context, and settings), Load Template (pre-populate settings and a starter question), Saved Prompts (reuse questions), Import (from file, URL, previous conversation, variables, context snapshot, saved prompts, template settings), Close Session (save and archive, discard, or archive tagged).

**12. Visibility Toggle and Sidebar Management.** A gear dropdown (top right) with 7 checkboxes: Recent Sessions (ON), Context Snapshot (ON), Recent Activity (ON), Token Usage (ON), Model Status (ON), Quick Tools (OFF), Active Session (OFF), plus Reset to defaults. Quick Tools is a 2x3 grid: Router (click to view detailed routing decision), Techniques (click to view applied techniques in detail), Prompt Library (click to save/load prompt templates), Variables (click to manage context variables), Checkpoints (click to save/restore conversation states), Dashboard (click to view session statistics — same destination as the left-nav Dashboard item, see LEFT NAVIGATION). Sidebar accordions are revolving-door: only one panel expanded at a time.

---

## LAYOUT (matches the V3 screenshot)

Three columns over the marble slab. Left column 200px: nav (Home, Dashboard, Messages, Archive, Resources, Projects, Integrations, Tasks, Customize, Translate), with Trash, a green System Status dot, and a logout control at the bottom. Center column flex: conversation area, the input box ("What's on your mind?"), state detection panel, the Model/Directness/Technique dropdowns, Attach and Context controls, TRANSLATE & ASK button, transparency and multi-AI expanders, quick actions. Right column 300px: Quick Tools grid (hidden by default) and the accordion stack (Recent Sessions, Context Snapshot, Recent Activity, Token Usage, Model Status, Active Session). Top bar 60px: logo, Search, Templates, Quick Reference, gear, bell, help, user chip.

---

## LEFT NAVIGATION (the ten items named in LAYOUT)

**Home.** Landing/overview screen: a recent activity feed plus quick stats. Distinct from Translate — Translate is the active composer view; Home is the "what's been happening" view.

**Dashboard.** Session statistics. Same destination as the Quick Tools "Dashboard" tile (Feature 12) — one screen, not two. Both the left-nav item and the Quick Tools tile link here.

**Messages.** List of ongoing and past conversation threads, inbox-style. Distinct from Archive — Messages is live/browsable sessions, Archive is closed ones.

**Archive.** View of closed sessions. This is the screen Feature 11's "Close Session... save and archive" writes to — Archive shows what landed there.

**Resources.** Saved links, files, and notes for reuse across conversations. A "+ Add Resource" button creates a new entry.

**Projects.** Organizes conversations by project. A "+ New Project" button creates a new one.

**Integrations.** NOT YET DEFINED. No real spec exists for this build — decorative placeholder until a future decision names what it actually does. Do not invent behavior for it.

**Tasks.** Action items extracted from conversations. A "+ New Task" button creates a new one.

**Customize.** A layout control panel: lets the user choose which panels/widgets exist and where they're positioned — e.g. which right-sidebar accordion sections show, the Quick Actions row's order/contents, possibly left-nav item visibility itself. A real feature-and-layout picker, not a generic settings/theme panel — theme itself already lives under the gear-icon Settings (Feature 12 / the screenshot's gear dropdown).

**Translate.** The default/main view — the composer, conversation area, and everything Features 1–10 render into. No further definition needed; it's already the app's primary screen.

---

## STORES AND PERSISTENCE

Two stores. **Session store**, cleared when a session closes: model selection, directness level, technique selection, loaded context, conversation history, current state pills. **Account store**, persists across browser closes: archived question/answer pairs, feedback ratings, saved prompts, explicitly-saved variables, visibility settings, learned routing and technique preferences. Autosave writes both to IndexedDB every 5 seconds. On load, both rehydrate so the user returns exactly where they were.

---

## ADHD HARD RULES (non-negotiable, audited in Phase 11)

**Cognitive load.** No dense info walls (max 3 paragraphs, break into sections). No hidden info. Never require remembering earlier context mid-flow. Never more than 5 to 7 simultaneous choices per view.

**Time.** Every visual interaction responds under 300ms. Show an indicator for any wait over 1 second. No countdowns, no forced timeouts.

**Sensory.** No excessive auto-animation. No competing visual stimuli. No conflicting color meanings.

**Decisions.** Every control has a sensible default. Only confirm destructive actions. Never a black box, transparency is always available.

**Persistence.** Never lose work on refresh (5-second autosave). Input is visible immediately, no forced setup before starting. No account friction (logged in by default).

**Feedback.** Never judgmental, always neutral and learning-toned. Always optional.

**Accessibility.** 100% usable by Tab, Enter, Escape. The user controls scroll pace, no time-limited reading.

---

## THE LOGO

A clean brain outline with synapses, colored in an aurora-borealis mix (neon green, purple, pink blended). "DIVERGENCE" in white, "AI" in the aurora mix. Nothing else inside the brain. Subtle synapse animation, not distracting. Top-left of the top bar.
