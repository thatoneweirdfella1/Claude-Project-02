import { describe, expect, it } from "vitest";
import { evaluatePaidRoutePolicy, type PaidRoutePolicy } from "./paidRoutePolicy";

const BASE_POLICY: PaidRoutePolicy = {
  maximum: 0.25,
  paidFallbackEnabled: false,
  requiresPaidFallback: false,
  routeLabel: "Managed translator · Anthropic · Claude",
  payerLabel: "Your Divergence credits",
  reasonLabel: "This request uses a connected paid AI.",
  freeAlternativeLabel: "Prepare a no-new-charge handoff",
};

describe("evaluatePaidRoutePolicy", () => {
  it("allows an explicitly selected paid route within the cap", () => {
    expect(evaluatePaidRoutePolicy(0.1, BASE_POLICY)).toBeNull();
  });

  it("blocks an automatic paid fallback until fallback consent is enabled", () => {
    expect(
      evaluatePaidRoutePolicy(0.1, { ...BASE_POLICY, requiresPaidFallback: true }),
    ).toBe("paid-fallback-disabled");
  });

  it("allows a consented fallback within the cap", () => {
    expect(
      evaluatePaidRoutePolicy(0.1, {
        ...BASE_POLICY,
        requiresPaidFallback: true,
        paidFallbackEnabled: true,
      }),
    ).toBeNull();
  });

  it("blocks every route above the hard per-request maximum", () => {
    expect(evaluatePaidRoutePolicy(0.2501, BASE_POLICY)).toBe("request-cap-exceeded");
  });

  it("allows an estimate exactly equal to the hard maximum", () => {
    expect(evaluatePaidRoutePolicy(0.25, BASE_POLICY)).toBeNull();
  });

  it("treats a zero cap as no permission to make a paid call", () => {
    expect(evaluatePaidRoutePolicy(0.01, { ...BASE_POLICY, maximum: 0 })).toBe(
      "request-cap-exceeded",
    );
  });

  it("fails closed for invalid estimates and invalid caps", () => {
    expect(evaluatePaidRoutePolicy(Number.NaN, BASE_POLICY)).toBe("invalid-estimate");
    expect(evaluatePaidRoutePolicy(0.01, { ...BASE_POLICY, maximum: Number.NaN })).toBe(
      "invalid-request-cap",
    );
  });
});
