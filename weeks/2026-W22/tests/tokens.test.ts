import { describe, expect, it } from "vitest";
import { auditTokenSet, contrastRatio, parseTokenSet } from "../src/tokens.js";

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
    expect(parsed.contrastPairs).toEqual([]);
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
      contrastPairs: [
        {
          name: "body",
          foreground: "color.text.primary",
          background: "color.surface.canvas"
        }
      ],
      tokens: [
        { name: "color.text.primary", category: "color", value: "#111827", aliases: ["body-text"] },
        { name: "color.surface.canvas", category: "color", value: "#ffffff" },
        { name: "color.status.success.foreground", category: "color", value: "#052e16" },
        { name: "color.status.success.background", category: "color", value: "#f0fdf4" },
        { name: "typography.body-md", category: "typography", value: "16px/1.5 Inter" },
        { name: "radius.card-sm", category: "radius", value: "6px" }
      ]
    });

    expect(report.summary).toEqual({ pass: 1, warning: 0, fail: 0 });
    expect(report.tokenCount).toBe(6);
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

  it("checks explicit and inferred foreground/background contrast pairs", () => {
    const report = auditTokenSet({
      name: "contrast-system",
      contrastPairs: [
        {
          name: "muted-copy",
          foreground: "color.text.muted",
          background: "color.surface.card"
        }
      ],
      tokens: [
        { name: "color.text.muted", category: "color", value: "#9ca3af" },
        { name: "color.surface.card", category: "color", value: "#f9fafb" },
        { name: "color.status.danger.foreground", category: "color", value: "#ef4444" },
        { name: "color.status.danger.background", category: "color", value: "#fee2e2" }
      ]
    });

    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["contrast-ratio-fail"])
    );
    expect(report.issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining(["contrast.muted-copy", "contrast.color.status.danger"])
    );
  });

  it("calculates WCAG contrast ratios for hex colors", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#fff", "#fff")).toBeCloseTo(1, 1);
    expect(contrastRatio("blue", "#fff")).toBeNull();
  });
});
