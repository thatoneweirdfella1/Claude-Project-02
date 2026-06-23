# ADHD-AI translation  Curriculum 01

**Created:** 6/19/2026 10:04:08  
**Updated:** 6/22/2026 14:02:32  
**Exported:** 6/22/2026 14:03:27  
**Link:** [https://claude.ai/chat/d312a3d6-13d7-41ff-b5df-523fed8562a7](https://claude.ai/chat/d312a3d6-13d7-41ff-b5df-523fed8562a7)  

## Prompt:
6/22/2026, 1:59:15 PM

That's a clean result, and Claude Code handled the missing-file situation exactly right — it didn't block, it built a complete self-contained 50-case file, and it flagged the gap transparently instead of pretending the original 10 were merged in.

Two things to note:

**1. The branch changed.** It pushed to `claude/exciting-hypatia-fn1ha6` (the new session spun up a different branch than the old `claude/affectionate-einstein-m4ujni`). Not a problem, but worth tracking — your work is now spread across two branches. At some point you'll want to merge them or pick one as the main. Nothing breaks in the meantime.

**2. It confirmed something important** — the `conversation_examples_rambling.md` file with your original 10, and `1.3_gap_categories.md`, aren't in the repo. Earlier sessions referenced them as if they existed. They may live only in an older session's context that didn't actually get committed. Since the new 50-case file is self-contained and traceable (every case lists its source filename), this doesn't block anything — but if you ever find those originals locally, they're easy to reconcile.

**31.0 is done.** 50 real test cases, evenly spread across all 4 gap categories, pulled from 560 real conversations.

Next Phase 8 item is **32.0 Routing Testing** (100+ questions). This one reuses the benchmark data we already built in 3.4/3.10/3.13 — so it's less "generate from scratch" and more "expand what exists." Want to keep going, or pause here?



## Response:
6/22/2026, 2:00:10 PM

go



## Prompt:
6/22/2026, 2:01:23 PM

````plaintext
Thought process: Evaluated routing test requirements and sought clarification on approach.

The user wants to continue. Phase 8, item 32.0 Routing Testing is next.

Looking at the MASTER_PROJECT_BLUEPRINT I just created:
- Phase 8 needs 100+ routing test cases
- The routing algorithm and decision tree are fully designed (3.14, 7.12)
- We have real benchmark data from 3.4, 3.5, 3.10, 3.13 (5 test questions run through all 3 model tiers with documented results)

The routing tests need to verify that:
1. The 20-rule routing decision tree actually works
2. Confidence scoring produces correct model assignments
3. The gate/modifier rules catch edge cases

What we already have:
- 7.12 has "validated examples" (referenced in the documents) showing the routing decision tree working against real test cases
- 3.13 specifically covers "When Opus-Fast is sufficient vs. when Opus-Thinking is needed"
- The model × question-type matrix from 13.1-13.7

For 32.0, we probably need:
1. A larger test set (50-100 questions) with expected model assignments already decided
2. Run the questions through the routing algorithm and confirm it assigns the right model tier
3. Validate the confidence scoring

Since we already have 5 good test cases from the benchmark work, we could:
- Pull more questions from the archive (like we did for translation testing)
- Use the model × question-type matrix to synthetically generate test cases with known right answers
- Or some combination

The key thing is: routing tests are different from translation tests. They don't care about the original rambling input — they care about whether a *translated, clarified question* gets routed to the right model.

So the test cases for 32.0 would be:
- Take the 50 translated test cases we just got (or pull more)
- For each one, determine what model tier should handle it
- Execute the routing algorithm and verify it produces the expected assignments

I notice the master blueprint already documents that 3.14's data-driven routing rules were validated against those 5 worked examples with actual model outcomes. So the core question becomes whether 32.0 requires a full 100+ case expansion or if a smaller, carefully selected set would suffice. I should check with Devan on whether he wants to manually assign expected models to 50+ additional questions, leverage the matrix to generate synthetic test cases, or take a hybrid approach.
````

32.0 — Routing Testing. Need to validate that the 20-rule routing decision tree (item 3.14) actually works across diverse question types.

Key difference from translation testing: routing tests don't care about the original rambling — they care about whether a *translated, clarified question* gets routed to the right model.

**What we already have:**
- The routing algorithm is deterministic (set of 20 rules) — already validated against 5 real test cases with documented model outcomes in 3.13
- The model × question-type matrix (13.1-13.7) tells us what *should* handle what
- The 50 translation test cases we just pulled

**What we need to decide:**

Routing is different from translation. Translation needs 50+ because there are endless ways input can be unclear. Routing is rule-based — 20 deterministic rules applied consistently. Once we verify it works on 15-20 diverse cases across all the matrix's question types, we've basically proven it works. 100+ tests would be overkill.

````plaintext
Tool: Generating ask_user_input_v0...
````



## Response:
6/22/2026, 2:02:26 PM

im carrying this over to ADHD-AI translation  Curriculum 02



## Prompt:
6/22/2026, 2:02:32 PM

````plaintext
Thought process: Recognized session transition and prepared handoff completion.

The user is saying they're moving this work to a different session/context called "ADHD-AI translation Curriculum 02". This is their project workspace change, not a continuation instruction to me.

I should acknowledge this, confirm the handoff package is complete, and make sure they have everything they need to continue in the new session.
````

Good — take the master blueprint with you. Here's your complete handoff package:

**Essential files for Curriculum 02:**
1. `MASTER_PROJECT_BLUEPRINT.md` — the index of everything
2. `ADHD_AI_Translator_App_Specification.md` — the full vision
3. `ALL_YELLOW_ITEMS_COMPLETE.md` + `ALL_RED_ITEMS_COMPLETE.md` — the detailed answers
4. `Phase_7_UI_Specification.md` + `translator_ui_microsoft.html` — UI locked in
5. `31.0_translation_test_cases.md` — the 50 test cases Claude Code just generated (in the repo, branch `claude/exciting-hypatia-fn1ha6`)

**Status heading into Curriculum 02:**
- Phases 1-7: ✅ Complete (~85% of total blueprint work)
- Phase 8 (Testing): 🟢 31.0 done (50 translation test cases), 32.0 pending (routing tests) — need to decide approach
- Phases 9-10: ❌ Not started

**Next decision:** You were about to pick an approach for 32.0 Routing Testing. The three options are still on the table — pick whichever feels right in the new session.

The blueprint is complete and self-contained. Nothing is lost.





---
Powered by [Claude Exporter](https://www.ai-chat-exporter.net)