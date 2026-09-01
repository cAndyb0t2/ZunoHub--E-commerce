import { describe, expect, it } from "vitest";
import { getAccountDestination, getAccountLabel } from "../../shared/account";

describe("zunoApp account navigation", () => {
  it("routes signed-in shoppers to their profile", () => {
    expect(getAccountDestination(true)).toBe("/profile");
    expect(getAccountLabel(true)).toBe("Profile");
  });

  it("routes guests to the secure login entry", () => {
    expect(getAccountDestination(false)).toBe("/login");
    expect(getAccountLabel(false)).toBe("Sign in");
  });
});
