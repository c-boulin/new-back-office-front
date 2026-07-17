import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeHtml } from "@/lib/sanitize";

describe("sanitizeText", () => {
  it("strips all tags leaving plain text", () => {
    expect(sanitizeText("<b>bold</b>")).toBe("bold");
  });

  it("removes script tags", () => {
    expect(sanitizeText("<script>alert(1)</script>hi")).toBe("hi");
  });

  it("removes event handler content", () => {
    const cleaned = sanitizeText("<img src=x onerror=alert(1)>");
    expect(cleaned).not.toContain("onerror");
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  padded  ")).toBe("padded");
  });

  it("returns empty string for empty input", () => {
    expect(sanitizeText("")).toBe("");
  });
});

describe("sanitizeHtml", () => {
  it("keeps whitelisted tags", () => {
    expect(sanitizeHtml("<b>bold</b>")).toBe("<b>bold</b>");
  });

  it("keeps anchor href but strips scripts", () => {
    const cleaned = sanitizeHtml('<a href="/x">go</a><script>bad()</script>');
    expect(cleaned).toContain('href="/x"');
    expect(cleaned).not.toContain("script");
  });

  it("drops non-allowed tags", () => {
    const cleaned = sanitizeHtml("<div>x</div><b>y</b>");
    expect(cleaned).not.toContain("<div>");
    expect(cleaned).toContain("<b>y</b>");
  });

  it("blocks javascript: URLs", () => {
    const cleaned = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(cleaned).not.toContain("javascript:");
  });
});
