import { describe, expect, it } from "vitest";
import { catalogSeed, slugify } from "./catalog";
import { calculateCoupon, makeOrderNumber, withUniqueOrderNumber } from "./orders";
import { estimateDelivery } from "./delivery";
import { calculateCartTotals } from "./cart";
import { authorizeMockPayment } from "./payments";

describe("DMart catalog helpers", () => {
  it("creates stable product slugs from attached catalogue names", () => {
    expect(slugify("Fruits & Vegetables")).toBe("fruits-vegetables");
    expect(slugify("Airtight Storage Containers")).toBe("airtight-storage-containers");
  });

  it("includes the expanded everyday assortment without duplicate slugs", () => {
    const names = catalogSeed.map(([name]) => name);
    expect(names).toEqual(expect.arrayContaining(["Moong Dal", "Poha", "Plain Curd", "Masala Oats", "Kitchen Tissue Roll"]));
    expect(new Set(names.map(slugify)).size).toBe(names.length);
  });
});

describe("DMart order IDs", () => {
  it("generates distinct readable IDs for successive orders", () => {
    const first = makeOrderNumber();
    const second = makeOrderNumber();
    expect(first).toMatch(/^DM[A-Z0-9]{16}$/);
    expect(second).toMatch(/^DM[A-Z0-9]{16}$/);
    expect(first).not.toBe(second);
  });

  it("retries only when the database reports a duplicate order number", async () => {
    const generated: string[] = [];
    let attempts = 0;
    const result = await withUniqueOrderNumber(async orderNumber => {
      generated.push(orderNumber);
      attempts += 1;
      if (attempts === 1) throw { code: "ER_DUP_ENTRY" };
      return orderNumber;
    });
    expect(result).toBe(generated[1]);
    expect(generated).toHaveLength(2);
    expect(generated[0]).not.toBe(generated[1]);
  });
});

describe("DMart checkout coupons", () => {
  it("applies DMART10 only above the minimum subtotal and caps the saving", () => {
    expect(calculateCoupon(50000, 0, "DMART10")).toEqual({ code: "DMART10", discount: 5000 });
    expect(calculateCoupon(250000, 0, "DMART10").discount).toBe(15000);
  });

  it("rejects invalid or ineligible coupon codes", () => {
    expect(() => calculateCoupon(39800, 0, "DMART10")).toThrow("not valid");
    expect(() => calculateCoupon(10000, 0, "UNKNOWN")).toThrow("not valid");
    expect(calculateCoupon(10000, 4000)).toEqual({ code: null, discount: 0 });
  });
});

describe("ZunoHub delivery estimates", () => {
  it("returns a business-day window for a serviceable pin code", () => {
    const result = estimateDelivery("400001", new Date("2026-08-31T09:00:00Z"));
    expect(result.eligible).toBe(true);
    expect(result.minDate).toBeDefined();
    expect(result.maxDate).toBeDefined();
    expect(result.maxDate as number).toBeGreaterThan(result.minDate as number);
  });

  it("rejects malformed and unsupported pin codes", () => {
    expect(estimateDelivery("123").eligible).toBe(false);
    expect(estimateDelivery("900001").eligible).toBe(false);
  });
});

describe("ZunoHub mock payments", () => {
  it("approves demo UPI and card credentials without charging money", () => {
    expect(authorizeMockPayment({ method: "upi", upiId: "demo@zunobank" }).status).toBe("success");
    const card = authorizeMockPayment({ method: "card", cardNumber: "4242424242424242", expiry: "12/30", cvv: "123" });
    expect(card.status).toBe("success");
    expect(card.transactionId).toMatch(/^ZUNO-CARD-/);
  });

  it("returns a safe failure for invalid demo credentials", () => {
    expect(authorizeMockPayment({ method: "upi", upiId: "not-valid" }).status).toBe("failed");
    expect(authorizeMockPayment({ method: "card", cardNumber: "123", expiry: "1/20", cvv: "1" }).status).toBe("failed");
  });
});

describe("ZunoHub live cart totals", () => {
  it("recalculates the server-side total when quantity or price changes", () => {
    const item = { quantity: 1, price: 250, originalPrice: 300, lineTotal: 250 };
    expect(calculateCartTotals([item])).toMatchObject({ itemCount: 1, subtotal: 250, discount: 50, delivery: 40, total: 240 });
    expect(calculateCartTotals([{ ...item, quantity: 2, lineTotal: 500 }])).toMatchObject({ itemCount: 2, subtotal: 500, discount: 100, delivery: 0, total: 400 });
    expect(calculateCartTotals([{ ...item, price: 275, lineTotal: 275 }])).toMatchObject({ subtotal: 275, discount: 25, delivery: 40, total: 290 });
  });
});


describe("ZunoHub account feedback and payment inputs", () => {
  it("shows the login welcome only once per account session", async () => {
    const { shouldShowWelcomeToast, welcomeToastKey } = await import("../../shared/feedback");
    expect(welcomeToastKey("user-1")).toBe("zunohub-welcomed-user-1");
    expect(shouldShowWelcomeToast(true, "user-1", false)).toBe(true);
    expect(shouldShowWelcomeToast(true, "user-1", true)).toBe(false);
    expect(shouldShowWelcomeToast(false, "user-1", false)).toBe(false);
  });

  it("normalizes profile names and demo card fields", async () => {
    const { normalizeProfileName, formatMockCardNumber, formatMockExpiry, profileUpdateFeedback, canStartMockPayment, mockPaymentButtonLabel } = await import("../../shared/feedback");
    expect(normalizeProfileName("  Zuno Shopper  ")).toBe("Zuno Shopper");
    expect(() => normalizeProfileName(" ")).toThrow("at least 2 characters");
    expect(formatMockCardNumber("4242 4242 4242 4242")).toBe("4242 4242 4242 4242");
    expect(formatMockExpiry("1230")).toBe("12/30");
    expect(profileUpdateFeedback("success")).toEqual({ title: "Profile details updated", description: "Your ZunoHub account is up to date." });
    expect(profileUpdateFeedback("error", "Name already used").title).toBe("Name already used");
    expect(canStartMockPayment("upi", "idle")).toBe(true);
    expect(canStartMockPayment("card", "processing")).toBe(false);
    expect(canStartMockPayment("cod", "idle")).toBe(false);
    expect(mockPaymentButtonLabel("processing", "card")).toBe("Authorising securely…");
    expect(mockPaymentButtonLabel("idle", "upi")).toBe("Simulate UPI payment");
  });
});
