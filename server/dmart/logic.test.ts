import { describe, expect, it } from "vitest";
import { slugify } from "./catalog";
import { calculateCoupon } from "./orders";

describe("DMart catalog helpers", () => {
  it("creates stable product slugs from attached catalogue names", () => {
    expect(slugify("Fruits & Vegetables")).toBe("fruits-vegetables");
    expect(slugify("Airtight Storage Containers")).toBe("airtight-storage-containers");
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
