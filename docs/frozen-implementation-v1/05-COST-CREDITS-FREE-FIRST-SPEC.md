# Divergence.AI Cost, Credits & Free-First Specification

Status: **PROPOSED IMPLEMENTATION SPECIFICATION**

---

# 1. Non-negotiable cost principles

1. **Free/no-new-charge is the default route for every new task.**
2. **No surprise charges.** A route that might cost money cannot be selected or retried silently.
3. **Fail closed.** Missing price, missing balance, stale authorization, or cap uncertainty blocks paid execution.
4. **A useful free path remains available.** Local Rules plus copy/open is the baseline.
5. **Payer is explicit.** Provider-billed, externally subscribed, and Divergence-credit routes are distinct.
6. **Developer Mode is irrelevant to user billing.** Normal users can see, limit, approve, and audit all costs.
7. **No negative balance.** Reserve before managed execution; reconcile after.
8. **No automatic top-up by default.** It is off until separately and knowingly enabled.
9. **Retries are costed actions.** A retry with possible new cost needs explicit approval.
10. **Cost optimization cannot silently reduce required quality.** A cheaper route must still meet the request contract or ask the user.

---

# 2. Exact cost categories

## 2.1 No Divergence credits

Examples:

- deterministic Local Rules translation;
- copy/open account handoff;
- local Ollama execution;
- using an externally licensed account route that has no per-call Divergence fee.

Required copy:

> No Divergence credits. Your external service may have its own plan limits or usage rules.

## 2.2 Provider free tier

Use only when the provider currently reports that the connected API request is eligible for its free tier. Required disclosure includes quota/limit if known, data-use distinction, and what happens after exhaustion. Exhaustion stops or returns to handoff; it cannot automatically cross into paid use.

## 2.3 Billed by provider

The user supplied an API key or account whose provider bills usage. Divergence.AI shows an estimate from current official pricing but states the provider's invoice is authoritative. Divergence credits are not deducted.

## 2.4 Uses Divergence credits

Divergence.AI's managed backend pays the provider and deducts a confirmed amount from the user's credit ledger. Requires reservation, signed authorization, reconciliation, and receipt.

---

# 3. Default route resolution

```text
Can Local Rules + manual handoff fulfill the task?
  yes → use it (default)
  no  → is an eligible user-enabled local model available?
          yes → use local
          no  → is a verified provider free-tier route connected and accepted?
                  yes → use only within its free quota
                  no  → stop and present:
                        A. manual handoff
                        B. BYOK/provider-billed route
                        C. managed-credit route
```

Paid fallback is not part of default Auto. “Auto — free first” may optimize among no-new-charge routes without interruption. Crossing payer categories always interrupts for consent.

---

# 4. New-install settings

| Setting | Default | Reason |
|---|---:|---|
| Destination | Any AI — Universal | Works without account/API setup |
| Translator Engine | Auto — free first | Local Rules first |
| Managed API | Off | Prevent accidental spend |
| Paid fallback | Off | No silent category crossing |
| Automatic top-up | Off | No unattended purchase |
| Maximum managed cost/request | $0.25 | Protective starting cap; user-adjustable |
| Maximum managed cost/session | $1.00 | Bounds repeated interactions |
| Maximum managed cost/month | $5.00 | Prevents runaway spend |
| BYOK request cap | $0.25 estimated | Provider-billed warning/cap |
| Cost confirmation | Every paid route first use and every over-cap change | Explicit consent |
| Retry confirmation | On when another charge may occur | Prevent duplicate costs |

The values are recommended defaults, not a claim that every user wants to spend them. Managed API being off means the caps do not authorize spend until the user enables it.

---

# 5. Cost envelope

Before execution, calculate:

```text
estimated_min = known fixed fees
              + estimated input units
              + conservative expected output units
              + selected tool/search fees
              + translator call if separately enabled

hard_max = known fixed fees
         + exact or safely upper-bounded input units
         + user/provider max output units
         + maximum approved tool/search calls
         + approved retry count (normally zero)
         + rounding reserve
```

## 5.1 Included cost lines

- translator input/output;
- destination input/output;
- cached-input/read/write fees;
- long-context multipliers;
- request fees;
- web/search/citation/tool fees;
- image/audio/video units;
- batch/flex/priority modifiers;
- currency conversion/tax where known;
- disclosed Divergence service margin.

Unknown variable fees make `hard_max` unknown. Managed execution is blocked until bounded. BYOK may proceed only after an explicit `Provider may bill more than this estimate` confirmation and the provider-side limit is shown where possible.

## 5.2 Token estimate confidence

- `Exact`: provider tokenizer and complete serialized request.
- `High`: compatible tokenizer and bounded output.
- `Estimated`: heuristic input or variable tools.
- `Unknown`: insufficient data; never rendered as `$0.00`.

---

# 6. Cost Preflight interaction

## 6.1 Trigger

Opens immediately before any request that may be provider-billed or use Divergence credits, and before a retry that could create a second charge.

## 6.2 Visible content

```text
[Cost category badge]
Answer with: [provider · exact model]
Translator: [route · model or Local Rules]
Likely cost: $min–$expected
Maximum for this action: $hard_max
Paid by: [provider account | Divergence balance]
Balance / cap after maximum: [value]

Why this route: [one sentence]
Free option: [exact alternative]

[Use free route] [Continue for up to $X.XX]
```

If no charge is possible, do not create a confirmation modal. Show the green badge in Review/Transparency and continue.

## 6.3 Rules

- `Continue` contains the maximum amount.
- No confirmation checkbox starts checked.
- Escape/Cancel spends nothing and preserves the request.
- If price changes between preflight and authorization, invalidate consent and show the new amount.
- Consent is request-specific unless the user knowingly defines a capped rule in Settings.
- A capped rule never authorizes a different provider, tool class, or higher privacy exposure than approved.

---

# 7. Managed-credit ledger

## 7.1 User-facing credit unit

Recommended: **$1.00 Divergence credit = $1.00 of displayed managed-AI purchasing power.**

The existing design in which only 70% of a payment becomes usable credit should be retired because it obscures value and increases calculation friction. Provider cost and a platform margin may still exist, but the preflight price must already include them.

If the 70% policy is retained contrary to this recommendation, checkout must state, before purchase:

- Amount paid.
- Credits received.
- Dollar amount not converted to credits.
- Why.
- Effective conversion rate.
- Refund/expiration terms.

## 7.2 Append-only events

```ts
type LedgerEvent =
  | "credit_granted"
  | "credit_purchased"
  | "credit_refunded"
  | "reservation_created"
  | "reservation_released"
  | "usage_settled"
  | "adjustment_added"
  | "charge_disputed";
```

An event is immutable and includes event ID, user ID, request/payment ID, amount, currency/credit unit, timestamp, actor, reason code, idempotency key, and cryptographic/server audit metadata. Corrections are new reversing/adjusting events.

## 7.3 Reservation flow

1. Server validates authenticated user, price version, balance, request/session/month caps, and duplicate idempotency key.
2. Reserve `hard_max` atomically.
3. Return short-lived signed execution authorization.
4. Execute provider call.
5. Obtain actual usage or conservative documented fallback.
6. Settle actual amount.
7. Release unused reservation.
8. Return signed receipt.

Provider timeouts with unknown execution state keep a temporary pending reservation and investigate provider request ID. They do not immediately charge maximum or silently retry.

## 7.4 Balance formula

```text
available = granted + purchased + refunds + adjustments
          - settled_usage - active_reservations
```

`available` cannot fall below zero in a valid ledger transaction.

---

# 8. Checkout and top-up

## 8.1 Checkout

- Server creates Stripe PaymentIntent/Checkout Session.
- Client never receives secret keys.
- Credit is granted only after verified server webhook, not a client success screen.
- Webhook signatures and event idempotency are mandatory.
- Payment success page says `Payment received; adding credits…` until the ledger event exists.
- Duplicate webhooks cannot duplicate credit.

## 8.2 Packs

Credit packs may exist, but the purchase card must show a simple one-to-one credit value. No plan should hide that AI usage is metered. Subscription benefits and spend credits are separate line items.

## 8.3 Automatic top-up

Default off. If the user enables it:

- choose threshold;
- choose exact top-up amount;
- choose maximum top-ups/month;
- display payment method ending digits;
- require payment-provider authentication when applicable;
- notify before and after top-up;
- allow immediate disable;
- top-up failure blocks managed calls and offers free route.

An “unlimited” top-up option is prohibited.

---

# 9. Subscription and credit separation

If Divergence.AI later offers subscriptions:

- subscription price and included product features are explicit;
- included managed credits are explicit and ledgered;
- overage is blocked by default, not silently billed;
- user must opt into metered overage with caps;
- external ChatGPT/Claude/Gemini/etc. subscriptions are never treated as Divergence-managed API credit;
- cancellation and remaining-credit terms are visible before purchase.

---

# 10. Usage & Cost interface

## 10.1 Composer/review

- Cost badge always visible in Review.
- Estimate appears only when relevant.
- A change to destination/model/tools recomputes estimate before send.

## 10.2 Right rail

Usage & Cost expanded card shows:

- `$0.00 Divergence credits this session` or actual total;
- provider-billed estimate/actual separately;
- current balance;
- request/session/month caps;
- pending reservation if any;
- `View receipts`.

## 10.3 Receipt

Each receipt contains:

- request ID/time;
- provider/model;
- translator route/model;
- cost category/payer;
- price version;
- usage units by meter;
- estimate and hard maximum;
- actual charged amount;
- reservation released;
- remaining relevant balance/caps;
- uncertain/provider-reported fields clearly marked.

---

# 11. Error and retry policy

| Failure | Required behavior |
|---|---|
| Insufficient Divergence balance | Block managed route; offer handoff/BYOK/top-up |
| Request/session/month cap reached | Block paid route; offer no-charge route or Edit cap |
| Provider rate limit | Show retry time; do not charge/retry silently |
| Provider free tier exhausted | Stop; do not cross to provider paid or managed paid automatically |
| Price changed | Invalidate confirmation and re-open preflight |
| Usage missing | Mark reconciliation pending; do not invent zero |
| Timeout before provider acceptance | Release reservation if non-execution is proven |
| Timeout after unknown acceptance | Keep bounded pending reservation; no silent retry |
| Duplicate click | Same idempotency key; one authorization and one execution |
| Checkout webhook delayed | Credits pending; managed use remains limited to existing balance |
| Top-up failed | No retry loop; notify and offer free route |

---

# 12. Cost optimization without quality loss

1. Deterministic compiler before any AI translator.
2. One-pass destination interpretation where appropriate.
3. Reuse stable prompt prefixes for caching.
4. Summarize only with provenance and user-visible truncation.
5. Use batch/flex routes for nonurgent approved workloads.
6. Use cheap models only for narrow, schema-tested worker jobs.
7. Escalate exceptions, not every item.
8. Set output limits from the requested deliverable, not provider maximum.
9. Disable tools/search unless needed and permitted.
10. Show a cost/quality explanation for recommendations.

Cost optimization never deletes selected context, weakens Verify, or changes the deliverable silently.

---

# 13. Cost acceptance gates

- [ ] New installation can use the app with zero Divergence credits.
- [ ] Every task begins on a no-new-charge route.
- [ ] `Free` never appears without an exact category explanation.
- [ ] Managed API, paid fallback, and auto top-up begin off.
- [ ] Every potentially paid request shows payer, estimate, hard maximum, cap, and free alternative.
- [ ] No paid call occurs without explicit valid authorization.
- [ ] No negative balance is possible under concurrent requests.
- [ ] Duplicate clicks/webhooks/retries cannot duplicate charges or credits.
- [ ] BYOK usage does not consume Divergence credits.
- [ ] Unknown prices/usages never display as zero.
- [ ] Reservation and reconciliation release unused credit.
- [ ] Developer Mode is unnecessary and cannot bypass production billing.
- [ ] Secret payment/provider keys remain server-side or OS-protected.
- [ ] A cap/free-tier exhaustion never silently crosses into paid use.
- [ ] Every receipt is intelligible without token-pricing expertise.

