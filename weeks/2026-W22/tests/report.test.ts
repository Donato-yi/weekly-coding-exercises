import { describe, expect, it } from "vitest";
import { buildExportableReport, parseReportFormat, renderAuditReport } from "../src/report.js";
import { auditTokenSet } from "../src/tokens.js";

describe("report exports", () => {
  it("adds suggested fixes to JSON-ready audit reports", () => {
    const report = buildExportableReport(
      auditTokenSet({
        name: "problematic-system",
        tokens: [{ name: "Color.text.Primary", category: "color", value: "blue" }]
      }),
      "2026-05-29T07:00:00.000Z"
    );

    expect(report.generatedAt).toBe("2026-05-29T07:00:00.000Z");
    expect(report.issues.map((issue) => issue.suggestion).join(" ")).toContain("lowercase");
    expect(report.issues.map((issue) => issue.suggestion).join(" ")).toContain("hex color");
  });

  it("renders markdown with failures before warnings for review comments", () => {
    const markdown = renderAuditReport(
      auditTokenSet({
        name: "review-system",
        tokens: [
          { name: "Color.text.Primary", category: "color", value: "blue", aliases: ["copy"] },
          { name: "spacing.misc-gap", category: "spacing", value: "8px", aliases: ["copy"] }
        ]
      }),
      "markdown",
      "2026-05-29T07:00:00.000Z"
    );

    expect(markdown).toContain("# Token Audit Report");
    expect(markdown.indexOf("## Fails")).toBeLessThan(markdown.indexOf("## Warnings"));
    expect(markdown).toContain("Suggested fix");
    expect(markdown).toContain("spacing.misc-gap");
  });

  it("validates report format flags", () => {
    expect(parseReportFormat(undefined)).toBe("json");
    expect(parseReportFormat("json")).toBe("json");
    expect(parseReportFormat("markdown")).toBe("markdown");
    expect(() => parseReportFormat("html")).toThrow("json or markdown");
  });
});
