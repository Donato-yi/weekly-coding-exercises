import { readFile } from "node:fs/promises";
import { auditTokenSet } from "./tokens.js";

async function main(): Promise<void> {
  const filePath = process.argv[2];
  if (!filePath) {
    throw new Error("Usage: npm run audit -- <tokens.json>");
  }

  const input = JSON.parse(await readFile(filePath, "utf8")) as unknown;
  const report = auditTokenSet(input);
  console.log(JSON.stringify(report, null, 2));

  if (report.summary.fail > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

