# Divergence.AI Comprehensive Specification v1.1

## Provider-Neutral, Free-First Amendment

Status: **PROPOSED**  
Supersedes only the clauses named below.  
All unnamed clauses in `DIVERGENCE-AI-COMPREHENSIVE-SPECIFICATION.md` v1.0 remain authoritative.

---

# 1. Authority and conflict rules

## 1.1 Authority order

1. This v1.1 amendment controls provider selection, prompt compilation, account/API connections, model routing, cost/credits, and provider status.
2. The v1.0 Comprehensive Specification controls all visual geometry and every behavior not explicitly changed here.
3. `LIGHT GOLD LAYOUT - MAIN LAYOUT DIVERGENCE FROZEN(2).png` remains the frozen visual authority.
4. `GOLD Light Version(1).jpg` remains the conversation/composer interaction reference, corrected by the approved GREEN decisions.
5. The approved Colored Decision & Behavior Map remains the product-decision authority except where “Model” meant a Claude-only list; this amendment replaces only that meaning.

If two statements conflict, the narrower and newer normative clause wins. Research snapshots describe current provider facts but do not override frozen UI geometry.

## 1.2 Invariants

- Logical canvas: `1600 × 1024 px`.
- The document must not scroll at the logical canvas size.
- Conversation history scrolls only inside its existing thread viewport.
- The composer remains fixed and fully visible.
- Popups open inside the canvas and may scroll internally.
- Exactly one competing composer overlay and one right-rail card may be expanded at a time.
- No provider, model, connection, or payment state changes layout coordinates.
- Model-list growth never widens MC-03; search and internal scrolling absorb it.
- All material, color, radius, border, typography, icon, focus, hover, disabled, loading, and motion tokens remain those in v1.0 unless this amendment supplies semantic text.

## 1.3 Language rules

- UI copy says **AI** or **provider**, never “Claude” when the behavior is universal.
- A provider name is shown only after the user chooses it or when an explanation identifies a route.
- “Free” is never displayed alone. Use one of the four exact cost badges in Section 5.
- The interface never claims a provider account subscription includes API use unless the provider explicitly documents that relationship.
- “Auto” means the app chooses within permissions and cost limits; it never means silent paid routing.

---

# 2. Superseded v1.0 components

The following entries are replaced: MC-03, MC-08 single-click route resolution, MC-09 contents, RR-08, RR-09, SE-06, SE-08, the “AI Model Preference” row in Part 4.2, and any state-matrix entry whose label is `Model Status`.

## 2.1 MC-03 — Destination AI

- **Frozen location/size:** `(334,770)`, `242 × 32 px`.
- **Type:** searchable, nested single-select popover.
- **Visible label:** `DESTINATION AI`.
- **New-install default:** `Any AI — Universal`.
- **Collapsed text:** selected destination and, only when explicitly pinned, its model. Truncate with an ellipsis after 28 visible characters; tooltip contains the full selection.
- **Initial cost badge:** `No Divergence credits` in the option explanation; no badge is added outside the frozen field.
- **Single click:** opens a `360 × 356 px` popover upward, aligned to the field's left edge.
- **Top row:** search input, `Search AIs and models…`.
- **Sections, in order:** Recommended; Connected; All destinations; Local & custom.
- **Canonical destinations, in order:**
  1. `Any AI — Universal`
  2. `ChatGPT / OpenAI`
  3. `Claude / Anthropic`
  4. `Gemini / Google`
  5. `Grok / xAI`
  6. `Copilot / Microsoft`
  7. `Perplexity`
  8. `DeepSeek`
  9. `Mistral`
  10. `Local AI / Ollama`
  11. `Custom / Other`
- **Destination row:** provider icon, plain name, connection status, cost badge, right chevron.
- **Selecting `Any AI — Universal`:** applies immediately and closes. The primary action creates a provider-neutral AI-ready request and follows the Universal handoff flow in Section 4.1.
- **Selecting a named destination:** opens that destination's second-level panel without closing the popover.
- **Second-level rows:** `Recommended model`, available models, `Use my account`, `Use my API key`, and `Connection settings`. Rows not supported by that provider are absent, not disabled fiction.
- **Recommended model:** a task-fit alias resolved at send time; exact resolution appears in Transparency Details.
- **Model pin:** selecting a concrete model pins it to the session. It never changes Translator Engine.
- **Unavailable/deprecated model:** visible only when already pinned or used in an imported session. It is marked unavailable, explains why, and offers a current replacement. It cannot be selected for a new request.
- **Close:** Escape, click outside, or select a terminal row.
- **Keyboard:** Up/Down moves; Right opens a provider; Left returns; Enter selects; Escape closes unchanged.
- **Double click:** no additional behavior.
- **Loading:** cached list remains usable; a 12-pixel status glyph shows refresh. If no cache exists, Universal remains selectable.
- **Error:** `Provider list unavailable. Universal still works.` Retry is available; no task text is lost.
- **Persistence:** destination and pinned model are session-scoped. Settings defines the new-session default.
- **Accessibility name:** `Destination AI, [current selection], [cost category]`.

## 2.2 Translator Engine — advanced implementation setting

Translator Engine is not a fourth permanent composer dropdown.

- **Location:** inside MC-09 Show advanced controls.
- **Type:** single-select dropdown.
- **Default:** `Auto — free first`.
- **Options:**
  1. `Auto — free first`
  2. `Local Rules — always free`
  3. `Local AI — if available`
  4. `Destination AI — one-pass`
  5. `Managed Translator — paid`
- **Auto resolution order:** Local Rules → eligible Local AI → Destination AI one-pass → stop and ask. Managed paid translation is not part of Auto unless the user separately enables paid fallback.
- **Local Rules:** creates a Meaning Packet and deterministic prompt wrapper without an AI call.
- **Local AI:** uses an explicitly detected local runtime such as Ollama.
- **Destination AI one-pass:** asks the destination AI to interpret the Meaning Packet and answer in one provider call; this prevents a separate translator charge.
- **Managed Translator:** invokes a managed API model and therefore requires the Section 5 paid preflight.
- **Persistence:** global default plus optional session override.
- **Transparency:** every request records the resolved translator route, whether an AI translator ran, model ID if any, and its cost category.

## 2.3 MC-08 — Translate & Ask route resolution

The frozen location, dimensions, visual states, loading labels, keyboard shortcut, debouncing, recovery behavior, and review preference remain v1.0.

Replace the single-click sequence with:

1. Validate that message text or eligible context exists.
2. Recovery-save the complete draft.
3. Run State Detection locally when possible; otherwise use the selected allowed route.
4. Present any non-silent state recommendation and wait for the user's choice.
5. Build and validate the neutral Meaning Packet.
6. Resolve Destination AI, Translator Engine, connection method, tools, and model.
7. Resolve cost category and calculate the maximum possible charge.
8. If any new charge is possible, show the Cost Preflight. Do not continue without explicit confirmation.
9. Compile the provider-specific request.
10. Follow the remembered Review-first preference.
11. Execute exactly one of these terminal routes:
    - Copy/open handoff;
    - local runtime;
    - user-provided API;
    - licensed official account API;
    - managed paid API.
12. Insert the accepted request into the thread. Insert the response only when it is returned or deliberately imported.
13. Reconcile actual cost, release unused reservation, and show the receipt in Transparency Details.

Additional button states, all within the existing button width:

- `Checking state…`
- `Preparing…`
- `Review request`
- `Confirm cost`
- `Copy & Open`
- `Sending…`
- `Waiting for response…`
- `Import response`
- `Retry`

The label shown is route-dependent. Universal/manual handoff uses `Copy & Open`; API routes use `Sending…`.

## 2.4 MC-09 — Show advanced controls contents

Keep MC-09's frozen `372 × 26 px` closed bar, frozen `372 × 188 px` upward panel, and one-open rule. The panel is not enlarged. Its contents scroll internally when necessary; no component moves.

Contents, in order:

1. Methodology.
2. Review before sending.
3. Translator Engine.
4. Connection method summary and `Manage` link.
5. Paid fallback toggle, default off.
6. Per-request maximum-cost field, default from Settings.
7. `Set as defaults` link.

## 2.5 RR-08 — Usage & Cost

- **Frozen geometry:** replaces Token Usage without moving or resizing its right-rail header or body.
- **Default:** enabled but closed if the user's recommended rail capacity permits; otherwise available in Customize.
- **Closed summary:** session total and route badge, for example `$0.00 · No Divergence credits`.
- **Expanded rows:** Divergence credits; provider-billed estimate/actual when known; external-plan route; input/output units; session cap; monthly cap; `Cost details`.
- **Unknown provider cost:** show `Provider cost not reported`; never display `$0.00` as an invented value.
- **Warning:** 80% of a cap; offers Use free route, Reduce context, or Change cap.
- **Reached cap:** managed and BYOK sends are blocked. Local/manual routes remain available.

## 2.6 RR-09 — AI Status

- **Frozen geometry:** replaces Model Status without moving or resizing it.
- **Expanded:** configured destinations and connections, health, selected route, registry freshness, and plain-language error.
- **Healthy:** `Ready · Universal handoff available` is always valid even when no API is connected.
- **Provider outage:** affected API row is unavailable; Universal/manual and unaffected local routes remain selectable.
- **Registry stale:** names last refresh date and offers Refresh; it does not block Universal.
- **Terminology:** never says `All models available` unless every listed, configured model was actually checked.

## 2.7 SE-06 — AI behavior defaults

Controls, in order:

1. Destination AI: `Any AI — Universal`.
2. Model behavior: `Recommended for task`; no fixed model pinned.
3. Translator Engine: `Auto — free first`.
4. Directness: `Balanced — clear and human`.
5. Technique Auto recommendation: on.
6. Methodology: Standard.
7. Review before sending: Review first.
8. Paid fallback: off.
9. Maximum managed cost per request: `$0.25` recommended new-install value.
10. Maximum managed cost per session: `$1.00` recommended new-install value.
11. Maximum managed cost per month: `$5.00` recommended new-install value.

`Restore recommended` applies exactly those values. Existing sessions remain unchanged unless `Apply to current session` is explicitly checked.

## 2.8 SE-08 — AI connections

SE-08 becomes an `AI Connections` group, not one Anthropic key field.

- **Rows:** one per destination, ordered by Connected then alphabetical.
- **Row states:** Not connected; Account handoff ready; API key saved; Licensed API connected; Local ready; Needs attention; Disabled.
- **Row action:** `Set up`, `Manage`, or `Repair`.
- **Connection methods:** manual account handoff; user-provided API key; official OAuth/licensed API where supported; local runtime; managed Divergence route.
- **Credential rule:** Divergence.AI never requests or stores a provider website password, session cookie, or MFA code.
- **API-key save:** validates using the provider's official API, masks the key, stores it with operating-system protection, and never writes it to logs.
- **Removal:** confirmation identifies affected features and preserves sessions.
- **External login:** opens the provider's official site in the system browser. Login does not occur inside an Electron webview.
- **Browser companion:** separate optional installation; requests minimum host permission only after user action; availability is provider-policy controlled.

---

# 3. Destination, connection, and route model

## 3.1 Independent dimensions

These values must not be collapsed into one field:

| Dimension | Question answered | Example |
|---|---|---|
| Destination AI | Who should answer? | Claude |
| Destination model | Which model should answer? | Fable 5 |
| Translator Engine | How is the raw thought converted? | Local Rules |
| Connection method | How is the request delivered? | Manual account handoff |
| Directness | How should the answer communicate? | Balanced |
| Technique | What response method should it use? | Examples + Step-by-step |
| Methodology | How should the task be structured? | 3-State |
| Cost policy | What may be spent? | No new charge only |

Changing one dimension cannot silently change another. A recommendation is visible, explained, and reversible.

## 3.2 Route precedence

For a new installation, route resolution is:

1. Local deterministic compiler + Universal handoff.
2. Local deterministic compiler + chosen provider account handoff.
3. Local AI if installed and explicitly enabled.
4. Eligible provider free-tier API if connected and its data terms were accepted.
5. User-provided API if explicitly selected and within the user's provider-cost cap.
6. Managed paid API only after explicit preflight confirmation.

At each level, a failure advances only to another no-new-charge route. Crossing into a paid category always stops for consent.

## 3.3 Recommended model logic

The app recommends by capability tags, not brand prestige:

- modality required;
- context required;
- structured-output reliability;
- tool/search requirement;
- task complexity;
- latency target;
- privacy route;
- user-set maximum cost;
- model health/deprecation state;
- prior adapter evaluation score for the same task class.

The recommendation card states three facts in one sentence: why it fits, expected delay, and cost category. `Best` is prohibited unless tied to a named evaluation and date.

---

# 4. Exact core flows

## 4.1 Universal free-first flow

**Start:** message is present; Destination AI is `Any AI — Universal`.

1. User activates Translate & Ask.
2. System saves the draft and checks state.
3. System resolves any state recommendation with the user.
4. System creates and schema-validates the Meaning Packet locally.
5. Local Rules compiles a universal prompt.
6. Review-first screen shows the original intent, AI-ready request, included context, and `No Divergence credits`.
7. User chooses Copy only or Copy & Choose AI.
8. Copy only places plain text and a sanitized Markdown version on the clipboard.
9. Copy & Choose AI opens a small provider chooser; selecting one copies then opens its official site.
10. Divergence.AI marks the request `Handed off`, not `Answered`.
11. The composer remains usable. An `Import response` action is available.
12. User pastes a response or uses a permitted companion import.
13. Imported text is previewed, sanitized, and confirmed.
14. The response enters the thread with source `Imported from [provider/user]`.

**End:** complete conversation exists without a Divergence-credit charge.

## 4.2 Named-provider account handoff

Same as 4.1, except the chosen provider and provider-specific prompt wrapper are already resolved. The app opens only the official provider URL. It does not detect, bypass, or capture login credentials.

## 4.3 Direct API flow

1. User activates Translate & Ask.
2. System completes steps 2–6 of 4.1.
3. Route preflight identifies Provider free tier, Billed by provider, or Uses Divergence credits.
4. If any charge is possible, user must confirm the exact maximum.
5. System reserves only the maximum Divergence credit amount when applicable.
6. Request is sent with an idempotency key and provider timeout.
7. Streaming output appears in one response card; Cancel stops display and requests cancellation where supported.
8. Provider usage is recorded.
9. System reconciles actual cost and releases unused reservation.
10. A receipt is added to Transparency Details.
11. On error, draft and compiled request remain; Retry states whether another charge may occur.

## 4.4 Paid fallback flow

Paid fallback begins off. Enabling it requires a panel that states the per-request, session, and monthly caps. Even when enabled, the first use of each newly priced route requires confirmation. A retry that might duplicate charges requires a second confirmation.

## 4.5 Provider/model deprecation flow

1. Registry refresh marks a pinned model deprecated or removed.
2. Existing session preserves the historical model name.
3. MC-03 shows `Unavailable` and a recommended replacement.
4. User may accept replacement or choose another destination/model.
5. Nothing is sent until a current route is selected.
6. Imported historical records are never rewritten.

---

# 5. Cost semantics and mandatory UI

## 5.1 Exact badges

| Badge | Color role | Meaning |
|---|---|---|
| `No Divergence credits` | success/green | No managed API charge; external account limits may apply |
| `Provider free tier` | informational/blue | Provider currently reports an eligible free API tier; limits/data terms apply |
| `Billed by provider` | warning/gold | User's own API account will be billed by that provider |
| `Uses Divergence credits` | warning/gold | Managed route deducts Divergence credits after confirmation |

Red is reserved for insufficient funds, cap reached, rejected charge, or cost reconciliation error.

## 5.2 Cost Preflight

The preflight is a fixed modal/overlay, not a new page. It must show:

- destination/provider and exact model;
- translator route and whether it adds a second AI call;
- tools/search likely to add fees;
- estimated input/output range;
- estimated charge;
- hard maximum charge for this action;
- payer: no one, provider account, or Divergence balance;
- current relevant balance/cap;
- no-charge alternative;
- `Continue for up to $X.XX` and `Use free route` actions.

No checkbox is preselected. Escape and Cancel close without sending or charging.

## 5.3 Developer Mode

User/Developer Mode remains superseded. Developer terminology may exist in diagnostics for maintainers, but it cannot:

- unlock ordinary features;
- bypass credit limits in production;
- be required to approve credit purchases;
- hide provider or cost settings;
- turn a paid route into the default.

## 5.4 Credit meaning

Recommended rule: **$1.00 Divergence credit equals $1.00 of user-facing managed-AI spend.** Provider cost and disclosed platform margin are incorporated into the preflight price. The existing 70%-of-payment conversion is superseded because it makes the purchase value harder to understand. If business policy retains any conversion, the checkout must show paid amount, received credit, fee/margin, and effective rate before payment.

---

# 6. Component state amendments

| Component | Required states |
|---|---|
| Destination AI | Universal; provider chosen; model recommended; model pinned; loading registry; stale registry; provider unavailable; pinned model deprecated; connection missing; disabled during send |
| Translator Engine | Auto unresolved; Local Rules; Local AI ready; Local AI unavailable; Destination one-pass; Managed paid; resolution loading; resolution failed |
| Connection | Not configured; manual ready; API validating; API ready; licensed ready; local ready; needs repair; revoked; temporarily unavailable |
| Cost route | No Divergence credits; provider free tier; provider billed; Divergence credits; estimate loading; confirmation required; cap warning; blocked by cap; reconciliation pending; reconciled; disputed/error |
| Translate & Ask | idle; disabled-empty; checking state; awaiting state choice; preparing; reviewing; awaiting cost; copying/opening; sending; streaming; awaiting import; success; cancelled; retryable error; nonretryable error |
| AI Status | healthy; partial outage; provider outage; registry stale; authentication expired; rate limited; quota/cap reached; offline with Universal available |

All state changes must be announced to assistive technology without moving keyboard focus unexpectedly.

---

# 7. Superseded pictured and textual concepts

| Old concept | Replacement |
|---|---|
| `AI Model Preference` | Destination AI plus optional provider/model drill-down |
| Claude-only Auto/Haiku/Sonnet/Fable/Opus top-level list | Claude models inside the Claude provider; other providers have their own current models |
| One Anthropic API key | AI Connections manager |
| Claude-only Model Status | AI Status |
| Token Usage only | Usage & Cost with payer and cap |
| Developer Mode billing approval | Ordinary user-controlled Cost Preflight and caps |
| Managed translator before every answer | Local deterministic compiler by default; one-pass destination interpretation when useful |
| `Free` without qualification | One exact cost badge |

Fable remains supported as a Claude model when present in the live registry. It is not removed; it is placed in the correct provider hierarchy.

---

# 8. Amendment acceptance tests

- [ ] At `1600 × 1024`, no frozen rectangle moved or resized.
- [ ] Destination AI occupies exactly MC-03's existing rectangle.
- [ ] A new installation can complete Universal copy/open without an API key, credit, or Developer Mode.
- [ ] No managed paid call can occur without visible payer, estimate, maximum, and explicit consent.
- [ ] Paid fallback and auto top-up begin off.
- [ ] Every paid option also presents a no-new-charge route when functionally possible.
- [ ] Provider/API subscription distinctions use exact cost badges.
- [ ] Model data comes from the registry/cache, not a Claude-only enum.
- [ ] A registry failure never disables Universal/local deterministic compilation.
- [ ] Deprecated models cannot be silently substituted.
- [ ] Translator Engine and Destination AI can be changed independently.
- [ ] Manual account handoff never collects passwords, cookies, or MFA codes.
- [ ] External login opens in the system browser.
- [ ] A BYOK call never deducts Divergence credits unless a separately disclosed service fee was explicitly confirmed.
- [ ] Retry cannot create an unconfirmed second charge.
- [ ] Cap exhaustion leaves local/manual routes usable.
- [ ] Transparency Details names destination, model, translator, connection, cost category, estimate, actual, and any fallback.
- [ ] All interactive states are keyboard reachable and screen-reader announced.
- [ ] No document scrollbar appears; bounded panels scroll internally.
