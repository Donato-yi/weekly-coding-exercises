import { readFile } from "node:fs/promises";
import { parseReportFormat, renderAuditReport } from "./report.js";
import { auditTokenSet } from "./tokens.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const filePath = args.find((arg) => !arg.startsWith("--") && arg !== "json" && arg !== "markdown");
  const formatArg = readFlag(args, "--format");
  const format = parseReportFormat(formatArg ?? args.find((arg) => arg === "json" || arg === "markdown"));
  if (!filePath) {
    throw new Error("Usage: npm run audit -- <tokens.json> [--format json|markdown]");
  }

  const input = JSON.parse(await readFile(filePath, "utf8")) as unknown;
  const report = auditTokenSet(input);
  console.log(renderAuditReport(report, format));

  if (report.summary.fail > 0) {
    process.exitCode = 1;
  }
}

function readFlag(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
