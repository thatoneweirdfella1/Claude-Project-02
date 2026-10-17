import { describe, expect, it } from "vitest";
import { TIER_OFFERS, usableCreditsForPayment } from "./payment";

describe("M4 owner-specified prices after 30% markup", () => {
  it.each([
    ["plus", 15, 10.5], ["pro", 75, 52.5], ["insane", 200, 140],
  ] as const)("%s retains the purchase price and grants the specified credits", (id, paid, credits) => {
    const offer = TIER_OFFERS.find((tier) => tier.id === id);
    expect(offer?.monthlyPrice).toBe(paid);
    expect(offer?.usableCredits).toBe(credits);
  });

  it.each([[5, 3.5], [10, 7], [25, 17.5], [50, 35]])("a $%s top-up grants $%s", (paid, credits) => {
    expect(usableCreditsForPayment(paid)).toBe(credits);
  });

  it("keeps Free at zero paid and usable credits", () => {
    expect(TIER_OFFERS.find((tier) => tier.id === "free")).toMatchObject({ monthlyPrice: 0, usableCredits: 0 });
  });

  it("rounds to cents without ever granting more than a valid payment", () => {
    expect(usableCreditsForPayment(5.37)).toBe(3.76);
    for (const paid of [0, 0.001, 0.009, 0.01, 0.014, 0.99, 1.005, 5.37, 25]) {
      const credits = usableCreditsForPayment(paid);
      expect(credits).toBeGreaterThanOrEqual(0);
      expect(credits).toBeLessThanOrEqual(paid);
      expect(credits).toBe(Number(credits.toFixed(2)));
    }
  });

  it("grants no credits for invalid payment amounts", () => {
    for (const paid of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(usableCreditsForPayment(paid)).toBe(0);
    }
  });
});
