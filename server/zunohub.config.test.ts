import { describe, expect, it } from "vitest";

describe("ZunoHub project configuration", () => {
  it("uses the configured ZunoHub title and serves the app shell", async () => {
    expect(process.env.VITE_APP_TITLE ?? "ZunoHub").toBe("ZunoHub");
    const response = await fetch("http://localhost:3000/");
    expect(response.ok).toBe(true);
    expect(await response.text()).toContain("ZunoHub");
  });
});
