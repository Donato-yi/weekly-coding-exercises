import type { AuditIssue, AuditReport, Severity } from "./tokens.js";

export type ReportFormat = "json" | "markdown";

export interface ReportIssue extends AuditIssue {
  suggestion: string;
}

export interface ExportableAuditReport extends AuditReport {
  generatedAt: string;
  issues: ReportIssue[];
}

const severityOrder: Array<Exclude<Severity, "pass">> = ["fail", "warning"];

export function buildExportableReport(report: AuditReport, generatedAt = new Date().toISOString()): ExportableAuditReport {
  return {
    ...report,
    generatedAt,
    issues: report.issues.map((issue) => ({
      ...issue,
      suggestion: suggestFix(issue)
    }))
  };
}

export function renderAuditReport(report: AuditReport, format: ReportFormat, generatedAt?: string): string {
  const exportable = buildExportableReport(report, generatedAt);
  if (format === "json") {
    return JSON.stringify(exportable, null, 2);
  }
  return renderMarkdownReport(exportable);
}

export function parseReportFormat(value: string | undefined): ReportFormat {
  if (value === undefined || value === "json" || value === "markdown") {
    return value ?? "json";
  }
  throw new Error("Report format must be json or markdown.");
}

function renderMarkdownReport(report: ExportableAuditReport): string {
  const sections = [
    "# Token Audit Report",
    "",
    "- Token set: " + report.name,
    "- Generated: " + report.generatedAt,
    "- Tokens audited: " + report.tokenCount,
    "- Summary: " + report.summary.fail + " fail, " + report.summary.warning + " warning, " + report.summary.pass + " pass",
    ""
  ];

  if (report.issues.length === 0) {
    sections.push("## Result", "", "No issues found.", "");
    return sections.join("\n");
  }

  for (const severity of severityOrder) {
    const issues = report.issues.filter((issue) => issue.severity === severity);
    if (issues.length === 0) {
      continue;
    }

    sections.push("## " + titleCase(severity) + "s", "");
    for (const issue of issues) {
      sections.push(
        "### " + issue.code,
        "",
        "- Path: `" + issue.path + "`",
        "- Message: " + issue.message,
        "- Suggested fix: " + issue.suggestion,
        ""
      );
    }
  }

  return sections.join("\n");
}

function suggestFix(issue: AuditIssue): string {
  switch (issue.code) {
    case "duplicate-token-name":
      return "Rename or remove the duplicate token so every token path resolves to one value.";
    case "category-prefix-mismatch":
      return "Align the first token-name segment with the declared category.";
    case "token-name-format":
      return "Use lowercase dot-separated kebab-case segments, for example color.text-primary.";
    case "invalid-color-value":
      return "Replace the value with a 3, 6, or 8 digit hex color.";
    case "empty-token-value":
      return "Provide the concrete CSS value that downstream components should consume.";
    case "ambiguous-token-name":
      return "Replace vague segments with the role, component, or scale purpose the token supports.";
    case "duplicate-alias":
      return "Keep each alias owned by one canonical token or remove the alias from the less-specific token.";
    case "missing-contrast-token":
      return "Add the missing foreground/background token or remove the stale contrast pair.";
    case "contrast-token-category":
      return "Point the contrast pair at color tokens only.";
    case "contrast-ratio-fail":
      return "Darken the foreground, lighten the background, or raise the pair minimum only when the usage is not normal text.";
    case "contrast-ratio-aa-only":
      return "Consider increasing contrast for small text, long-form reading, or accessibility-sensitive surfaces.";
    default:
      return "Review the token definition and update it so the audit can resolve the intended UI role.";
  }
}

function titleCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
