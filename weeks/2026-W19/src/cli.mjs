#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildJsonReport, evaluateTrace, parseTrace, renderMarkdownReport } from './analyze.mjs';

const args = process.argv.slice(2);
const inputPath = args[0];
const format = getFlagValue(args, '--format') ?? 'markdown';

if (!inputPath) {
  console.error('Usage: node src/cli.mjs <trace.json> [--format markdown|json]');
  process.exit(1);
}

const fullPath = path.resolve(process.cwd(), inputPath);
const raw = fs.readFileSync(fullPath, 'utf8');
const parsed = parseTrace(raw);
const evaluation = evaluateTrace(parsed);

if (format === 'json') {
  console.log(JSON.stringify(buildJsonReport(parsed, evaluation), null, 2));
} else {
  console.log(renderMarkdownReport(parsed, evaluation));
}

function getFlagValue(argv, flagName) {
  const index = argv.indexOf(flagName);
  if (index === -1 || index === argv.length - 1) {
    return null;
  }

  return argv[index + 1];
}
