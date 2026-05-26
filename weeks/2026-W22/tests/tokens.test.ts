import { describe, expect, it } from "vitest";
import { auditTokenSet, parseTokenSet } from "../src/tokens.js";

describe("parseTokenSet", () => {
  it("normalizes valid token input into deterministic paths", () => {
    const parsed = parseTokenSet({
      name: "clean-system",
      tokens: [
        { name: "color.text.primary", category: "color", value: "#111827" },
        { name: "spacing.scale-2", category: "spacing", value: "0.5rem" }
      ]
    });

    expect(parsed.tokens.map((token) => token.path)).toEqual([
      ["color", "text", "primary"],
      ["spacing", "scale-2"]
    ]);
  });

  it("throws clear errors for malformed token sets", () => {
    expect(() => parseTokenSet({ name: "broken" })).toThrow("tokens array");
    expect(() =>
      parseTokenSet({
        tokens: [{ name: "color.text.primary", category: "unknown", value: "#111827" }]
      })
    ).toThrow("must be one of");
  });
});

describe("auditTokenSet", () => {
  it("returns a passing summary for clean tokens", () => {
    const report = auditTokenSet({
      name: "clean-system",
      tokens: [
        { name: "color.text.primary", category: "color", value: "#111827", aliases: ["body-text"] },
        { name: "typography.body-md", category: "typography", value: "16px/1.5 Inter" },
        { name: "radius.card-sm", category: "radius", value: "6px" }
      ]
    });

    expect(report.summary).toEqual({ pass: 1, warning: 0, fail: 0 });
    expect(report.tokenCount).toBe(3);
  });

  it("flags naming, category, color, and alias problems", () => {
    const report = auditTokenSet({
      name: "problematic-system",
      tokens: [
        { name: "Color.text.Primary", category: "color", value: "blue", aliases: ["copy"] },
        { name: "spacing.misc-gap", category: "spacing", value: "8px", aliases: ["copy"] },
        { name: "color.surface.card", category: "radius", value: "4px" }
      ]
    });

    expect(report.summary.fail).toBeGreaterThanOrEqual(4);
    expect(report.summary.warning).toBe(1);
    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "token-name-format",
        "invalid-color-value",
        "duplicate-alias",
        "category-prefix-mismatch",
        "ambiguous-token-name"
      ])
    );
  });
});

