# Dialogue Layout Reference (Visual)
## Chat-Box Top-to-Bottom Display

**Status: CONFIRMED (Chat-box vertical, like texting)**

---

## ASCII MOCKUP: MULTI-AI DIALOGUE FLOW

```
═══════════════════════════════════════════════════════════════
                     MULTI-AI DIALOGUE SCREEN
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ GOAL: Improve your idea                    [×] Close Dialog  │
│ Mode: Devil's Advocate (Critique & Refine)                  │
└─────────────────────────────────────────────────────────────┘

Your Idea:
┌─────────────────────────────────────────────────────────────┐
│ "I should launch this new product feature next quarter      │
│  because early user testing shows strong demand."          │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

ROUND 1

┌─────────────────────────────────────────────────────────────┐
│ Model A (Claude A) - PROPOSER                     [Copy]    │
├─────────────────────────────────────────────────────────────┤
│ Your proposal is good, but let me highlight some            │
│ considerations:                                             │
│                                                             │
│ 1. Early testing with self-selected users often has        │
│    bias toward positive feedback                           │
│ 2. "Strong demand" in tests doesn't always translate       │
│    to launch success when you open to all users            │
│ 3. Next quarter is tight for resource planning             │
│                                                             │
│ Before committing, have you validated:                     │
│ - Statistical significance of the early results?           │
│ - Revenue impact model?                                    │
│ - Resource availability?                                   │
│                                                             │
│ [Copy]     [Regenerate]                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Model B (GPT A) - CRITIC                          [Copy]    │
├─────────────────────────────────────────────────────────────┤
│ I'd strengthen that critique. The proposal assumes:        │
│                                                             │
│ 1. User testing data is representative (often isn't)       │
│ 2. Next quarter has capacity (does it?)                    │
│ 3. Launch timeline is realistic (rarely is)                │
│                                                             │
│ Questions to ask before proceeding:                        │
│ - Who participated in testing? (selection bias?)           │
│ - What's our definition of "strong"? (% users, revenue?)   │
│ - Can we launch iteratively if not ready next quarter?     │
│                                                             │
│ [Copy]     [Regenerate]                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Dialogue Quality: 82%  [📊 Feedback]                        │
│                                                             │
│ [✅ Accept]              [🔄 Continue Refining]            │
│ [⏸ Pause]              [❌ Stop Dialogue]                   │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

ROUND 2

┌─────────────────────────────────────────────────────────────┐
│ Model A (Claude B) - REFINED       [Swapped 🔄]  [Copy]    │
├─────────────────────────────────────────────────────────────┤
│ Good catch. Let me refine based on that feedback:          │
│                                                             │
│ Updated proposal:                                          │
│ 1. Statistical validation: p<0.05 on conversion rate      │
│ 2. Revenue impact: +$50K/month projected (conservative)   │
│ 3. Phased rollout: 10% → 50% → 100% over 6 weeks         │
│    (doesn't require all-or-nothing next quarter)          │
│ 4. Resource check: confirmed with engineering lead        │
│                                                             │
│ With these guardrails, proposal is stronger.              │
│                                                             │
│ ← Claude B joins (Claude A tokens depleted)                │
│ [Copy]     [Regenerate]                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Model B (GPT A) - FINAL CHECK                    [Copy]     │
├─────────────────────────────────────────────────────────────┤
│ Much better. Phased rollout addresses launch risk.        │
│                                                             │
│ One remaining question: Market timing.                     │
│ - Are competitors launching similar features?              │
│ - Is this the right window, or should we wait?             │
│                                                             │
│ If you've validated market timing too, this is ready.     │
│                                                             │
│ [Copy]     [Regenerate]                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Dialogue Quality: 91%                                       │
│                                                             │
│ [✅ Accept - Idea is Solid]     [🔄 Continue Refining]     │
│ [⏸ Pause]                       [❌ Stop]                   │
└─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

✅ DIALOGUE COMPLETE (Idea Refined & Solid)

Mode: Devil's Advocate (Critique & Refine)
Rounds: 2
Stop Reason: Proposal refined to strong state

[📋 Summary]  [⤴️ Export]  [💾 Save]

═══════════════════════════════════════════════════════════════

Rate this dialogue:
⭐⭐⭐⭐⭐ (5 stars)

What did it do well?
☐ Found weakness
☐ Improved my idea
☐ Explored thoroughly
☐ Clear reasoning
☐ Other

Comment (optional):
[The phased rollout suggestion was key insight]

[Submit]  [Skip]

═══════════════════════════════════════════════════════════════
```

---

## KEY VISUAL ELEMENTS

### Layout Principles
- **Vertical flow** (top-to-bottom, like texting)
- **Cards per turn** (each model response = one card)
- **Clear speaker labels** (Model A / Model B with role)
- **Account swap visible** (inline notation when swap happens)
- **Buttons under each response** (Copy, Regenerate)
- **Unified action buttons** (✅ Accept, 🔄 Continue - context-aware)
- **Unobtrusive quality score** (81% at bottom-right)
- **Full scrollable history** (nothing hidden or truncated)

### Visual Hierarchy
1. **Dialogue mode header** (goal + mode name)
2. **User's original input** (what they asked)
3. **Model responses** (stacked vertically)
4. **Per-response buttons** (Copy, Regenerate)
5. **Dialogue-level buttons** (✅ Accept, 🔄 Continue, etc.)
6. **Quality score** (small, unobtrusive)
7. **Swap notifications** (banner + inline)

### Colors & Contrast
- Model A responses: One color scheme
- Model B responses: Different color scheme (but same family)
- Swap notifications: Highlight color (not jarring)
- Buttons: Action colors (clear but not overwhelming)
- Quality score: Dim text (informational, not prominent)

### Responsive Behavior
- Desktop: Full width cards
- Tablet: Narrower cards, readable
- Mobile: Full screen per card, swipe to scroll

---

## DIALOGUE BUTTONS (Context-Aware)

For **Devil's Advocate mode** shown above:
- **✅ Accept** = "Idea is good" (ends with acceptance)
- **🔄 Continue** = "Refine based on feedback" (loop again)

For **Consensus mode**:
- **✅ Accept** = "We agree" (agreement reached)
- **🔄 Continue** = "Counter that point" (push back)

For **Adversarial mode**:
- **✅ Accept** = "Good point, move on" (acknowledge)
- **🔄 Continue** = "Attack again" (find more flaws)

For **Socratic mode**:
- **✅ Accept** = "I understand" (learning complete)
- **🔄 Continue** = "Ask another question" (explore more)

For **Synthesis mode**:
- **✅ Accept** = "Accept this view" (integration works)
- **🔄 Continue** = "Propose alternative" (try different angle)

---

## SWAP NOTIFICATION EXAMPLES

### Banner (at top)
```
🔄 Claude A tokens depleted. Claude B continuing.
```

### Inline (in dialogue)
```
← Claude B joins (Claude A tokens depleted)
```

### Both visible (clearest)
```
[Banner at top: 🔄 Claude A tokens depleted...]
[Inline in card: ← Claude B joins (Claude A tokens depleted)]
```

---

## IMPLEMENTATION NOTES

- No side-by-side layout (too hard to follow)
- No truncation of responses (full text always visible)
- No "read more" links (user can scroll)
- Scrolling is natural and expected
- Cards stack vertically forever (no hiding of history)
- Buttons minimal but always visible
- Quality score doesn't interfere with reading

---

**Status: READY FOR DESIGN/IMPLEMENTATION**
