export type MoneyRoute =
  | "free"
  | "managed-allowance"
  | "divergence-credits"
  | "provider-billed";

export type MoneyBlockReason =
  | "unknown-price"
  | "invalid-hard-maximum"
  | "consent-required"
  | "managed-api-disabled"
  | "paid-fallback-disabled"
  | "live-provider-disabled"
  | "request-cap-exceeded"
  | "session-cap-exceeded"
  | "monthly-cap-exceeded"
  | "insufficient-funds"
  | "auto-top-up-unavailable";

export interface MoneyCaps {
  requestCents: number;
  sessionCents: number;
  monthCents: number;
}

export interface AutoTopUpConfig {
  enabled: boolean;
  thresholdCents: number;
  amountCents: number;
  monthlyMaximumCents: number;
  paymentMethodAvailable: boolean;
  notificationsEnabled: boolean;
}

export interface MoneyPreflightRequest {
  idempotencyKey: string;
  route: MoneyRoute;
  estimatedCents: number | null;
  hardMaximumCents: number | null;
  sessionId: string;
  monthId: string;
  provider: string;
  model: string;
  translator: string;
  payerLabel: string;
  reasonLabel: string;
  freeAlternativeLabel: string;
  priceVersion: string;
  explicitConsent: boolean;
  developerMode?: boolean;
}

export interface MoneyPreflight {
  allowed: boolean;
  reason: MoneyBlockReason | null;
  route: MoneyRoute;
  payerLabel: string;
  estimatedCents: number | null;
  hardMaximumCents: number | null;
  availableCents: number;
  allowanceCents: number;
  caps: MoneyCaps;
  sessionCommittedCents: number;
  monthCommittedCents: number;
  freeAlternativeLabel: string;
}

export type ReservationStatus = "reserved" | "settled" | "released" | "pending-unknown";

export interface MoneyReservation {
  id: string;
  idempotencyKey: string;
  status: ReservationStatus;
  route: MoneyRoute;
  estimatedCents: number;
  hardMaximumCents: number;
  allowanceHeldCents: number;
  creditsHeldCents: number;
  sessionId: string;
  monthId: string;
  provider: string;
  model: string;
  translator: string;
  payerLabel: string;
  reasonLabel: string;
  freeAlternativeLabel: string;
  priceVersion: string;
  createdAt: number;
  updatedAt: number;
  actualCents: number | null;
}

export interface MoneyReceipt {
  id: string;
  reservationId: string;
  status: "settled" | "released" | "pending-unknown";
  timestamp: number;
  provider: string;
  model: string;
  translator: string;
  payerLabel: string;
  priceVersion: string;
  estimatedCents: number;
  hardMaximumCents: number;
  actualCents: number | null;
  releasedCents: number;
  balanceAfterCents: number;
  allowanceAfterCents: number;
  requestCapCents: number;
  sessionCapCents: number;
  monthCapCents: number;
  sessionSpentCents: number;
  monthSpentCents: number;
  note: string;
}

export interface MoneyLedgerEntry {
  id: string;
  timestamp: number;
  kind:
    | "reservation"
    | "charge"
    | "release"
    | "pending-unknown"
    | "credit-purchase"
    | "subscription-entitlement";
  amountCents: number;
  balanceAfterCents: number;
  allowanceAfterCents: number;
  referenceId: string;
  note: string;
}

export type SandboxCheckoutKind = "credit-top-up" | "subscription";

export interface SandboxCheckout {
  id: string;
  idempotencyKey: string;
  kind: SandboxCheckoutKind;
  status: "pending" | "completed";
  paidAmountCents: number;
  creditAmountCents: number;
  tier: string | null;
  verificationToken: string;
  createdAt: number;
  completedAt: number | null;
}

export interface MoneySnapshot {
  balanceCents: number;
  allowanceCents: number;
  subscriptionTier: string;
  subscriptionBenefits: string[];
  managedApiEnabled: boolean;
  paidFallbackEnabled: boolean;
  liveProviderEnabled: false;
  caps: MoneyCaps;
  autoTopUp: AutoTopUpConfig;
  reservations: MoneyReservation[];
  receipts: MoneyReceipt[];
  ledger: MoneyLedgerEntry[];
  checkouts: SandboxCheckout[];
}

export interface MoneyAuthorityOptions {
  balanceCents?: number;
  allowanceCents?: number;
  caps?: Partial<MoneyCaps>;
  now?: () => number;
}

export interface ReservationResult {
  ok: boolean;
  reason: MoneyBlockReason | null;
  reservation: MoneyReservation | null;
  preflight: MoneyPreflight;
}

export interface CheckoutCallbackResult {
  ok: boolean;
  reason: "invalid-proof" | "unknown-checkout" | null;
  checkout: SandboxCheckout | null;
}

const DEFAULT_CAPS: MoneyCaps = {
  requestCents: 25,
  sessionCents: 100,
  monthCents: 500,
};

const DEFAULT_AUTO_TOP_UP: AutoTopUpConfig = {
  enabled: false,
  thresholdCents: 200,
  amountCents: 500,
  monthlyMaximumCents: 2000,
  paymentMethodAvailable: false,
  notificationsEnabled: true,
};

function validCents(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function cloneReservation(value: MoneyReservation): MoneyReservation {
  return { ...value };
}

function cloneCheckout(value: SandboxCheckout): SandboxCheckout {
  return { ...value };
}

/**
 * In-memory reference authority for Layer 5. It models the permanent money
 * contract without making a network call. Real providers remain fail-closed;
 * checkout completion requires a deterministic sandbox callback token.
 */
export class DeterministicMoneyAuthority {
  private balanceCents: number;
  private allowanceCents: number;
  private subscriptionTier = "free";
  private subscriptionBenefits: string[] = ["Local interface and free tools"];
  private managedApiEnabled = false;
  private paidFallbackEnabled = false;
  private caps: MoneyCaps;
  private autoTopUp: AutoTopUpConfig = { ...DEFAULT_AUTO_TOP_UP };
  private readonly now: () => number;
  private readonly reservations = new Map<string, MoneyReservation>();
  private readonly reservationKeys = new Map<string, string>();
  private readonly receipts: MoneyReceipt[] = [];
  private readonly ledger: MoneyLedgerEntry[] = [];
  private readonly checkouts = new Map<string, SandboxCheckout>();
  private readonly checkoutKeys = new Map<string, string>();
  private readonly callbackKeys = new Map<string, string>();
  private readonly settlementKeys = new Map<string, MoneyReceipt>();
  private readonly sessionSpent = new Map<string, number>();
  private readonly monthSpent = new Map<string, number>();
  private sequence = 0;

  constructor(options: MoneyAuthorityOptions = {}) {
    const balance = options.balanceCents ?? 0;
    const allowance = options.allowanceCents ?? 0;
    if (!validCents(balance) || !validCents(allowance)) throw new Error("Money values must be nonnegative integer cents.");
    this.balanceCents = balance;
    this.allowanceCents = allowance;
    this.caps = { ...DEFAULT_CAPS, ...options.caps };
    if (!this.validCaps(this.caps)) throw new Error("Cost caps must be positive integer cents.");
    this.now = options.now ?? (() => Date.now());
  }

  snapshot(): MoneySnapshot {
    return {
      balanceCents: this.balanceCents,
      allowanceCents: this.allowanceCents,
      subscriptionTier: this.subscriptionTier,
      subscriptionBenefits: [...this.subscriptionBenefits],
      managedApiEnabled: this.managedApiEnabled,
      paidFallbackEnabled: this.paidFallbackEnabled,
      liveProviderEnabled: false,
      caps: { ...this.caps },
      autoTopUp: { ...this.autoTopUp },
      reservations: [...this.reservations.values()].map(cloneReservation),
      receipts: this.receipts.map((value) => ({ ...value })),
      ledger: this.ledger.map((value) => ({ ...value })),
      checkouts: [...this.checkouts.values()].map(cloneCheckout),
    };
  }

  setManagedApiEnabled(enabled: boolean): void {
    this.managedApiEnabled = enabled;
  }

  setPaidFallbackEnabled(enabled: boolean): void {
    this.paidFallbackEnabled = enabled;
  }

  setCaps(caps: MoneyCaps): boolean {
    if (!this.validCaps(caps)) return false;
    this.caps = { ...caps };
    return true;
  }

  configureAutoTopUp(config: AutoTopUpConfig): boolean {
    const valid = validCents(config.thresholdCents)
      && validCents(config.amountCents)
      && validCents(config.monthlyMaximumCents)
      && config.amountCents > 0
      && config.monthlyMaximumCents > 0
      && config.amountCents <= config.monthlyMaximumCents;
    if (!valid) return false;
    this.autoTopUp = { ...config };
    return true;
  }

  preflight(request: MoneyPreflightRequest): MoneyPreflight {
    const hardMaximum = request.hardMaximumCents;
    const estimate = request.estimatedCents;
    const sessionCommitted = this.committedForSession(request.sessionId);
    const monthCommitted = this.committedForMonth(request.monthId);
    let reason: MoneyBlockReason | null = null;

    if (estimate === null || !validCents(estimate) || estimate <= 0) reason = "unknown-price";
    else if (hardMaximum === null || !validCents(hardMaximum) || hardMaximum < estimate) reason = "invalid-hard-maximum";
    else if (!request.explicitConsent) reason = "consent-required";
    else if (request.route === "provider-billed") reason = "live-provider-disabled";
    else if (request.route === "managed-allowance" && !this.managedApiEnabled) reason = "managed-api-disabled";
    else if (hardMaximum > this.caps.requestCents) reason = "request-cap-exceeded";
    else if (sessionCommitted + hardMaximum > this.caps.sessionCents) reason = "session-cap-exceeded";
    else if (monthCommitted + hardMaximum > this.caps.monthCents) reason = "monthly-cap-exceeded";
    else if (request.route !== "free" && hardMaximum > this.availableFor(request.route)) {
      reason = this.autoTopUp.enabled && !this.autoTopUp.paymentMethodAvailable
        ? "auto-top-up-unavailable"
        : request.route === "managed-allowance" && !this.paidFallbackEnabled
          ? "paid-fallback-disabled"
          : "insufficient-funds";
    }

    return {
      allowed: reason === null,
      reason,
      route: request.route,
      payerLabel: request.payerLabel,
      estimatedCents: estimate,
      hardMaximumCents: hardMaximum,
      availableCents: this.balanceCents,
      allowanceCents: this.allowanceCents,
      caps: { ...this.caps },
      sessionCommittedCents: sessionCommitted,
      monthCommittedCents: monthCommitted,
      freeAlternativeLabel: request.freeAlternativeLabel,
    };
  }

  async reserve(request: MoneyPreflightRequest): Promise<ReservationResult> {
    const existingId = this.reservationKeys.get(request.idempotencyKey);
    if (existingId) {
      const existing = this.reservations.get(existingId) ?? null;
      return { ok: existing !== null, reason: null, reservation: existing ? cloneReservation(existing) : null, preflight: this.preflight({ ...request, explicitConsent: true }) };
    }

    const preflight = this.preflight(request);
    if (!preflight.allowed || request.hardMaximumCents === null || request.estimatedCents === null) {
      return { ok: false, reason: preflight.reason, reservation: null, preflight };
    }

    const hardMaximum = request.route === "free" ? 0 : request.hardMaximumCents;
    let allowanceHeld = 0;
    let creditsHeld = 0;
    if (request.route === "managed-allowance") {
      allowanceHeld = Math.min(this.allowanceCents, hardMaximum);
      creditsHeld = hardMaximum - allowanceHeld;
    } else if (request.route === "divergence-credits") {
      creditsHeld = hardMaximum;
    }
    this.allowanceCents -= allowanceHeld;
    this.balanceCents -= creditsHeld;

    const timestamp = this.now();
    const id = this.nextId("reservation");
    const reservation: MoneyReservation = {
      id,
      idempotencyKey: request.idempotencyKey,
      status: "reserved",
      route: request.route,
      estimatedCents: request.estimatedCents,
      hardMaximumCents: hardMaximum,
      allowanceHeldCents: allowanceHeld,
      creditsHeldCents: creditsHeld,
      sessionId: request.sessionId,
      monthId: request.monthId,
      provider: request.provider,
      model: request.model,
      translator: request.translator,
      payerLabel: request.payerLabel,
      reasonLabel: request.reasonLabel,
      freeAlternativeLabel: request.freeAlternativeLabel,
      priceVersion: request.priceVersion,
      createdAt: timestamp,
      updatedAt: timestamp,
      actualCents: null,
    };
    this.reservations.set(id, reservation);
    this.reservationKeys.set(request.idempotencyKey, id);
    this.appendLedger("reservation", -hardMaximum, id, `Reserved hard maximum: ${request.reasonLabel}`);
    return { ok: true, reason: null, reservation: cloneReservation(reservation), preflight };
  }

  settle(reservationId: string, actualCents: number, idempotencyKey: string): MoneyReceipt | null {
    const prior = this.settlementKeys.get(idempotencyKey);
    if (prior) return { ...prior };
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status === "released") return null;
    if (reservation.status === "settled" || reservation.status === "pending-unknown") {
      return this.receipts.find((value) => value.reservationId === reservationId) ?? null;
    }
    if (!validCents(actualCents) || actualCents > reservation.hardMaximumCents) {
      return this.markUsageUnknown(reservationId, idempotencyKey, "Usage exceeded or could not be reconciled safely.");
    }

    const totalHeld = reservation.allowanceHeldCents + reservation.creditsHeldCents;
    const chargedFromAllowance = Math.min(actualCents, reservation.allowanceHeldCents);
    const chargedFromCredits = actualCents - chargedFromAllowance;
    this.allowanceCents += reservation.allowanceHeldCents - chargedFromAllowance;
    this.balanceCents += reservation.creditsHeldCents - chargedFromCredits;
    this.sessionSpent.set(reservation.sessionId, (this.sessionSpent.get(reservation.sessionId) ?? 0) + actualCents);
    this.monthSpent.set(reservation.monthId, (this.monthSpent.get(reservation.monthId) ?? 0) + actualCents);
    reservation.status = "settled";
    reservation.actualCents = actualCents;
    reservation.updatedAt = this.now();
    const released = totalHeld - actualCents;
    this.appendLedger("charge", -actualCents, reservationId, "Reconciled deterministic usage.");
    if (released > 0) this.appendLedger("release", released, reservationId, "Released unused reservation.");
    const receipt = this.makeReceipt(reservation, "settled", actualCents, released, "Charge reconciled; unused hold released.");
    this.receipts.push(receipt);
    this.settlementKeys.set(idempotencyKey, receipt);
    return { ...receipt };
  }

  release(reservationId: string, idempotencyKey: string, note = "Cancelled before execution."): MoneyReceipt | null {
    const prior = this.settlementKeys.get(idempotencyKey);
    if (prior) return { ...prior };
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status !== "reserved") return null;
    const released = reservation.allowanceHeldCents + reservation.creditsHeldCents;
    this.allowanceCents += reservation.allowanceHeldCents;
    this.balanceCents += reservation.creditsHeldCents;
    reservation.status = "released";
    reservation.actualCents = 0;
    reservation.updatedAt = this.now();
    this.appendLedger("release", released, reservationId, note);
    const receipt = this.makeReceipt(reservation, "released", 0, released, note);
    this.receipts.push(receipt);
    this.settlementKeys.set(idempotencyKey, receipt);
    return { ...receipt };
  }

  markUsageUnknown(reservationId: string, idempotencyKey: string, note = "Provider usage is unknown; hold remains pending."): MoneyReceipt | null {
    const prior = this.settlementKeys.get(idempotencyKey);
    if (prior) return { ...prior };
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status !== "reserved") return null;
    reservation.status = "pending-unknown";
    reservation.updatedAt = this.now();
    this.appendLedger("pending-unknown", 0, reservationId, note);
    const receipt = this.makeReceipt(reservation, "pending-unknown", null, 0, note);
    this.receipts.push(receipt);
    this.settlementKeys.set(idempotencyKey, receipt);
    return { ...receipt };
  }

  createSandboxCheckout(input: {
    idempotencyKey: string;
    kind: SandboxCheckoutKind;
    paidAmountCents: number;
    creditAmountCents: number;
    tier?: string;
  }): SandboxCheckout {
    if (!validCents(input.paidAmountCents) || input.paidAmountCents <= 0 || !validCents(input.creditAmountCents)) {
      throw new Error("Checkout amounts must use nonnegative integer cents.");
    }
    const existingId = this.checkoutKeys.get(input.idempotencyKey);
    if (existingId) return cloneCheckout(this.checkouts.get(existingId)!);
    const id = this.nextId("sandbox-checkout");
    const checkout: SandboxCheckout = {
      id,
      idempotencyKey: input.idempotencyKey,
      kind: input.kind,
      status: "pending",
      paidAmountCents: input.paidAmountCents,
      creditAmountCents: input.creditAmountCents,
      tier: input.tier ?? null,
      verificationToken: `verified-sandbox:${id}`,
      createdAt: this.now(),
      completedAt: null,
    };
    this.checkouts.set(id, checkout);
    this.checkoutKeys.set(input.idempotencyKey, id);
    return cloneCheckout(checkout);
  }

  applyVerifiedSandboxCallback(checkoutId: string, callbackKey: string, proof: string): CheckoutCallbackResult {
    const priorId = this.callbackKeys.get(callbackKey);
    if (priorId) {
      const prior = this.checkouts.get(priorId) ?? null;
      return { ok: prior?.status === "completed", reason: prior ? null : "unknown-checkout", checkout: prior ? cloneCheckout(prior) : null };
    }
    const checkout = this.checkouts.get(checkoutId);
    if (!checkout) return { ok: false, reason: "unknown-checkout", checkout: null };
    if (proof !== checkout.verificationToken) return { ok: false, reason: "invalid-proof", checkout: cloneCheckout(checkout) };
    this.callbackKeys.set(callbackKey, checkoutId);
    if (checkout.status === "completed") return { ok: true, reason: null, checkout: cloneCheckout(checkout) };

    checkout.status = "completed";
    checkout.completedAt = this.now();
    if (checkout.kind === "subscription") {
      this.subscriptionTier = checkout.tier ?? "sandbox-plan";
      this.subscriptionBenefits = ["Subscription interface features", "Managed allowance remains separately metered"];
      this.appendLedger("subscription-entitlement", 0, checkoutId, `Activated ${this.subscriptionTier} sandbox entitlement.`);
    }
    if (checkout.creditAmountCents > 0) {
      this.balanceCents += checkout.creditAmountCents;
      this.appendLedger("credit-purchase", checkout.creditAmountCents, checkoutId, "Verified sandbox callback credited the ledger.");
    }
    return { ok: true, reason: null, checkout: cloneCheckout(checkout) };
  }

  private availableFor(route: MoneyRoute): number {
    if (route === "free") return Number.MAX_SAFE_INTEGER;
    if (route === "managed-allowance") return this.allowanceCents + (this.paidFallbackEnabled ? this.balanceCents : 0);
    if (route === "divergence-credits") return this.balanceCents;
    return 0;
  }

  private committedForSession(sessionId: string): number {
    return (this.sessionSpent.get(sessionId) ?? 0) + [...this.reservations.values()]
      .filter((value) => value.sessionId === sessionId && (value.status === "reserved" || value.status === "pending-unknown"))
      .reduce((sum, value) => sum + value.hardMaximumCents, 0);
  }

  private committedForMonth(monthId: string): number {
    return (this.monthSpent.get(monthId) ?? 0) + [...this.reservations.values()]
      .filter((value) => value.monthId === monthId && (value.status === "reserved" || value.status === "pending-unknown"))
      .reduce((sum, value) => sum + value.hardMaximumCents, 0);
  }

  private validCaps(caps: MoneyCaps): boolean {
    return validCents(caps.requestCents) && caps.requestCents > 0
      && validCents(caps.sessionCents) && caps.sessionCents > 0
      && validCents(caps.monthCents) && caps.monthCents > 0;
  }

  private appendLedger(kind: MoneyLedgerEntry["kind"], amountCents: number, referenceId: string, note: string): void {
    this.ledger.push({
      id: this.nextId("ledger"),
      timestamp: this.now(),
      kind,
      amountCents,
      balanceAfterCents: this.balanceCents,
      allowanceAfterCents: this.allowanceCents,
      referenceId,
      note,
    });
  }

  private makeReceipt(
    reservation: MoneyReservation,
    status: MoneyReceipt["status"],
    actualCents: number | null,
    releasedCents: number,
    note: string,
  ): MoneyReceipt {
    return {
      id: this.nextId("receipt"),
      reservationId: reservation.id,
      status,
      timestamp: this.now(),
      provider: reservation.provider,
      model: reservation.model,
      translator: reservation.translator,
      payerLabel: reservation.payerLabel,
      priceVersion: reservation.priceVersion,
      estimatedCents: reservation.estimatedCents,
      hardMaximumCents: reservation.hardMaximumCents,
      actualCents,
      releasedCents,
      balanceAfterCents: this.balanceCents,
      allowanceAfterCents: this.allowanceCents,
      requestCapCents: this.caps.requestCents,
      sessionCapCents: this.caps.sessionCents,
      monthCapCents: this.caps.monthCents,
      sessionSpentCents: this.sessionSpent.get(reservation.sessionId) ?? 0,
      monthSpentCents: this.monthSpent.get(reservation.monthId) ?? 0,
      note,
    };
  }

  private nextId(prefix: string): string {
    this.sequence += 1;
    return `${prefix}-${this.sequence}`;
  }
}

