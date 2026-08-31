import { describe, expect, it } from "vitest";
import { slugify } from "./catalog";
import { calculateCoupon, makeOrderNumber, withUniqueOrderNumber } from "./orders";

describe("DMart catalog helpers", () => {
  it("creates stable product slugs from attached catalogue names", () => {
    expect(slugify("Fruits & Vegetables")).toBe("fruits-vegetables");
    expect(slugify("Airtight Storage Containers")).toBe("airtight-storage-containers");
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
