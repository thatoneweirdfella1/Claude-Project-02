import { describe, expect, it } from "vitest";
import {
  DeterministicMoneyAuthority,
  type MoneyPreflightRequest,
} from "./moneySafety";

function request(overrides: Partial<MoneyPreflightRequest> = {}): MoneyPreflightRequest {
  return {
    idempotencyKey: "request-1",
    route: "divergence-credits",
    estimatedCents: 5,
    hardMaximumCents: 10,
    sessionId: "session-1",
    monthId: "2026-08",
    provider: "sandbox-provider",
    model: "sandbox-model",
    translator: "deterministic-lab",
    payerLabel: "Your Divergence credits",
    reasonLabel: "Deterministic Layer 5 verification",
    freeAlternativeLabel: "Use the local no-charge route",
    priceVersion: "sandbox-v1",
    explicitConsent: true,
    ...overrides,
  };
}

describe("DeterministicMoneyAuthority defaults", () => {
  it("starts free-first with every paid automation disabled", () => {
    const snapshot = new DeterministicMoneyAuthority().snapshot();
    expect(snapshot.managedApiEnabled).toBe(false);
    expect(snapshot.paidFallbackEnabled).toBe(false);
    expect(snapshot.autoTopUp.enabled).toBe(false);
    expect(snapshot.liveProviderEnabled).toBe(false);
    expect(snapshot.caps).toEqual({ requestCents: 25, sessionCents: 100, monthCents: 500 });
  });

  it("fails closed when the price is unknown instead of treating it as zero", () => {
    const authority = new DeterministicMoneyAuthority({ balanceCents: 100 });
    expect(authority.preflight(request({ estimatedCents: null })).reason).toBe("unknown-price");
    expect(authority.preflight(request({ estimatedCents: Number.NaN })).reason).toBe("unknown-price");
  });

  it("requires explicit consent and always exposes a free alternative", () => {
    const authority = new DeterministicMoneyAuthority({ balanceCents: 100 });
    const result = authority.preflight(request({ explicitConsent: false }));
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("consent-required");
    expect(result.freeAlternativeLabel).toBe("Use the local no-charge route");
  });

  it("never enables a live provider in this implementation", () => {
    const authority = new DeterministicMoneyAuthority({ balanceCents: 100 });
    expect(authority.preflight(request({ route: "provider-billed" })).reason).toBe("live-provider-disabled");
  });
});

describe("caps and reservations", () => {
  it("enforces request, session, and month caps independently", async () => {
    const requestAuthority = new DeterministicMoneyAuthority({ balanceCents: 1000 });
    expect(requestAuthority.preflight(request({ hardMaximumCents: 26 })).reason).toBe("request-cap-exceeded");

    const sessionAuthority = new DeterministicMoneyAuthority({ balanceCents: 1000, caps: { requestCents: 60, sessionCents: 75 } });
    await sessionAuthority.reserve(request({ idempotencyKey: "s1", hardMaximumCents: 50 }));
    expect(sessionAuthority.preflight(request({ idempotencyKey: "s2", hardMaximumCents: 30 })).reason).toBe("session-cap-exceeded");

    const monthAuthority = new DeterministicMoneyAuthority({ balanceCents: 1000, caps: { requestCents: 60, sessionCents: 200, monthCents: 70 } });
    await monthAuthority.reserve(request({ idempotencyKey: "m1", hardMaximumCents: 50, sessionId: "one" }));
    expect(monthAuthority.preflight(request({ idempotencyKey: "m2", hardMaximumCents: 25, sessionId: "two" })).reason).toBe("monthly-cap-exceeded");
  });

  it("atomically prevents concurrent reservations from making the ledger negative", async () => {
    const authority = new DeterministicMoneyAuthority({ balanceCents: 10 });
    const results = await Promise.all([
      authority.reserve(request({ idempotencyKey: "a", hardMaximumCents: 10 })),
      authority.reserve(request({ idempotencyKey: "b", hardMaximumCents: 10 })),
    ]);
    expect(results.filter((value) => value.ok)).toHaveLength(1);
    expect(authority.snapshot().balanceCents).toBe(0);
    expect(authority.snapshot().balanceCents).toBeGreaterThanOrEqual(0);
  });

  it("returns the same reservation for duplicate click and retry keys", async () => {
    const authority = new DeterministicMoneyAuthority({ balanceCents: 100 });
    const first = await authority.reserve(request({ idempotencyKey: "same" }));
    const retry = await authority.reserve(request({ idempotencyKey: "same" }));
    expect(retry.reservation?.id).toBe(first.reservation?.id);
    expect(authority.snapshot().ledger.filter((value) => value.kind === "reservation")).toHaveLength(1);
    expect(authority.snapshot().balanceCents).toBe(90);
  });

  it("does not let Developer mode bypass consent, caps, or funds", async () => {
    const empty = new DeterministicMoneyAuthority();
    const noFunds = await empty.reserve(request({ developerMode: true }));
    expect(noFunds.ok).toBe(false);
    expect(noFunds.reason).toBe("insufficient-funds");

    const funded = new DeterministicMoneyAuthority({ balanceCents: 100 });
    expect(funded.preflight(request({ developerMode: true, explicitConsent: false })).reason).toBe("consent-required");
    expect(funded.preflight(request({ developerMode: true, hardMaximumCents: 30 })).reason).toBe("request-cap-exceeded");
  });
});

describe("reconciliation, failure, and receipts", () => {
  it("settles actual usage and releases the unused hold with a readable receipt", async () => {
    let time = 100;
    const authority = new DeterministicMoneyAuthority({ balanceCents: 100, now: () => time++ });
    const reserved = await authority.reserve(request({ hardMaximumCents: 10, estimatedCents: 6 }));
    const receipt = authority.settle(reserved.reservation!.id, 4, "settle-1");
    expect(receipt).toMatchObject({
      status: "settled",
      provider: "sandbox-provider",
      model: "sandbox-model",
      translator: "deterministic-lab",
      payerLabel: "Your Divergence credits",
      priceVersion: "sandbox-v1",
      estimatedCents: 6,
      hardMaximumCents: 10,
      actualCents: 4,
      releasedCents: 6,
      balanceAfterCents: 96,
      requestCapCents: 25,
    });
    expect(authority.snapshot().ledger.map((value) => value.kind)).toEqual(["reservation", "charge", "release"]);
  });

  it("keeps unknown usage pending and never retries or guesses a charge", async () => {
    const authority = new DeterministicMoneyAuthority({ balanceCents: 20 });
    const reserved = await authority.reserve(request({ hardMaximumCents: 10 }));
    const receipt = authority.markUsageUnknown(reserved.reservation!.id, "unknown-1");
    const retry = authority.markUsageUnknown(reserved.reservation!.id, "unknown-2");
    expect(receipt?.status).toBe("pending-unknown");
    expect(receipt?.actualCents).toBeNull();
    expect(retry).toBeNull();
    expect(authority.snapshot().balanceCents).toBe(10);
    expect(authority.snapshot().ledger.filter((value) => value.kind === "charge")).toHaveLength(0);
  });

  it("releases the full reservation on cancellation", async () => {
    const authority = new DeterministicMoneyAuthority({ balanceCents: 20 });
    const reserved = await authority.reserve(request({ hardMaximumCents: 10 }));
    const receipt = authority.release(reserved.reservation!.id, "cancel-1");
    expect(receipt?.status).toBe("released");
    expect(receipt?.releasedCents).toBe(10);
    expect(authority.snapshot().balanceCents).toBe(20);
  });

  it("makes settlement callbacks idempotent", async () => {
    const authority = new DeterministicMoneyAuthority({ balanceCents: 20 });
    const reserved = await authority.reserve(request({ hardMaximumCents: 10 }));
    const first = authority.settle(reserved.reservation!.id, 6, "callback-1");
    const duplicate = authority.settle(reserved.reservation!.id, 9, "callback-1");
    expect(duplicate?.id).toBe(first?.id);
    expect(duplicate?.actualCents).toBe(6);
    expect(authority.snapshot().balanceCents).toBe(14);
  });

  it("holds the reservation pending if actual usage exceeds the hard maximum", async () => {
    const authority = new DeterministicMoneyAuthority({ balanceCents: 20 });
    const reserved = await authority.reserve(request({ hardMaximumCents: 10 }));
    const receipt = authority.settle(reserved.reservation!.id, 11, "over-max");
    expect(receipt?.status).toBe("pending-unknown");
    expect(receipt?.actualCents).toBeNull();
    expect(authority.snapshot().ledger.some((value) => value.kind === "charge")).toBe(false);
  });
});

describe("managed allowance and paid fallback", () => {
  it("keeps managed allowance separate and blocks it by default", () => {
    const authority = new DeterministicMoneyAuthority({ allowanceCents: 50, balanceCents: 50 });
    expect(authority.preflight(request({ route: "managed-allowance" })).reason).toBe("managed-api-disabled");
  });

  it("uses allowance first and requires explicit paid fallback for an overage", async () => {
    const authority = new DeterministicMoneyAuthority({ allowanceCents: 5, balanceCents: 20 });
    authority.setManagedApiEnabled(true);
    expect(authority.preflight(request({ route: "managed-allowance", hardMaximumCents: 10 })).reason).toBe("paid-fallback-disabled");
    authority.setPaidFallbackEnabled(true);
    const reserved = await authority.reserve(request({ route: "managed-allowance", hardMaximumCents: 10 }));
    expect(reserved.reservation).toMatchObject({ allowanceHeldCents: 5, creditsHeldCents: 5 });
  });
});

describe("deterministic checkout and top-up safety", () => {
  it("does not grant credits until a verified sandbox callback", () => {
    const authority = new DeterministicMoneyAuthority();
    const checkout = authority.createSandboxCheckout({
      idempotencyKey: "top-up-1",
      kind: "credit-top-up",
      paidAmountCents: 500,
      creditAmountCents: 500,
    });
    expect(authority.snapshot().balanceCents).toBe(0);
    expect(authority.applyVerifiedSandboxCallback(checkout.id, "bad", "wrong").reason).toBe("invalid-proof");
    expect(authority.snapshot().balanceCents).toBe(0);
    expect(authority.applyVerifiedSandboxCallback(checkout.id, "verified-1", checkout.verificationToken).ok).toBe(true);
    expect(authority.snapshot().balanceCents).toBe(500);
  });

  it("makes checkout creation and verified callbacks idempotent", () => {
    const authority = new DeterministicMoneyAuthority();
    const first = authority.createSandboxCheckout({ idempotencyKey: "same", kind: "credit-top-up", paidAmountCents: 500, creditAmountCents: 500 });
    const duplicateClick = authority.createSandboxCheckout({ idempotencyKey: "same", kind: "credit-top-up", paidAmountCents: 500, creditAmountCents: 500 });
    expect(duplicateClick.id).toBe(first.id);
    authority.applyVerifiedSandboxCallback(first.id, "callback", first.verificationToken);
    authority.applyVerifiedSandboxCallback(first.id, "callback", first.verificationToken);
    expect(authority.snapshot().balanceCents).toBe(500);
    expect(authority.snapshot().ledger.filter((value) => value.kind === "credit-purchase")).toHaveLength(1);
  });

  it("keeps subscription entitlement and credits as separate ledger events", () => {
    const authority = new DeterministicMoneyAuthority();
    const checkout = authority.createSandboxCheckout({
      idempotencyKey: "plan-1",
      kind: "subscription",
      paidAmountCents: 1500,
      creditAmountCents: 1500,
      tier: "plus",
    });
    authority.applyVerifiedSandboxCallback(checkout.id, "plan-callback", checkout.verificationToken);
    const snapshot = authority.snapshot();
    expect(snapshot.subscriptionTier).toBe("plus");
    expect(snapshot.balanceCents).toBe(1500);
    expect(snapshot.ledger.map((value) => value.kind)).toEqual(["subscription-entitlement", "credit-purchase"]);
  });

  it("keeps automatic top-up off and fails closed without a payment method", () => {
    const authority = new DeterministicMoneyAuthority();
    expect(authority.configureAutoTopUp({
      enabled: true,
      thresholdCents: 200,
      amountCents: 500,
      monthlyMaximumCents: 2000,
      paymentMethodAvailable: false,
      notificationsEnabled: true,
    })).toBe(true);
    expect(authority.preflight(request()).reason).toBe("auto-top-up-unavailable");
    expect(authority.configureAutoTopUp({
      enabled: true,
      thresholdCents: 200,
      amountCents: 2500,
      monthlyMaximumCents: 2000,
      paymentMethodAvailable: true,
      notificationsEnabled: true,
    })).toBe(false);
  });
});

