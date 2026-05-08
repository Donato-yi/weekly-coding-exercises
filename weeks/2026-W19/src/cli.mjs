#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildJsonReport, evaluateTrace, parseTrace, renderMarkdownReport } from './analyze.mjs';
import { buildComparisonJsonReport, compareTraces, renderComparisonMarkdownReport } from './compare.mjs';

const args = process.argv.slice(2);
const compareMode = args.includes('--compare');
const positionalArgs = args.filter((arg, index) => {
  if (arg.startsWith('--')) {
    return false;
  }

  const previous = index > 0 ? args[index - 1] : null;
  return !['--format', '--out-dir', '--output-name'].includes(previous);
});

const inputPath = positionalArgs[0];
const compareInputPath = compareMode ? positionalArgs[1] : null;
const format = getFlagValue(args, '--format') ?? 'markdown';
const outDirArg = getFlagValue(args, '--out-dir');
const outputNameArg = getFlagValue(args, '--output-name');

if (!inputPath) {
  fail('Usage: node src/cli.mjs <trace.json> [second-trace.json --compare] [--format markdown|json|both] [--out-dir <dir>] [--output-name <name>]');
}

if (!['markdown', 'json', 'both'].includes(format)) {
  fail(`Unsupported format: ${format}`);
}

if (format === 'both' && !outDirArg) {
  fail('The "both" format requires --out-dir so the markdown and JSON reports can be written as separate files.');
}

if (compareMode && !compareInputPath) {
  fail('Comparison mode requires a second trace path.');
}

const fullPath = path.resolve(process.cwd(), inputPath);
const raw = fs.readFileSync(fullPath, 'utf8');

let markdown;
let json;

if (compareMode) {
  const comparePath = path.resolve(process.cwd(), compareInputPath);
  const compareRaw = fs.readFileSync(comparePath, 'utf8');
  const comparison = compareTraces(parseTrace(raw), parseTrace(compareRaw));
  markdown = renderComparisonMarkdownReport(comparison);
  json = JSON.stringify(buildComparisonJsonReport(comparison), null, 2);
} else {
  const parsed = parseTrace(raw);
  const evaluation = evaluateTrace(parsed);
  markdown = renderMarkdownReport(parsed, evaluation);
  json = JSON.stringify(buildJsonReport(parsed, evaluation), null, 2);
}

const outputs = format === 'both'
  ? [
      { extension: 'md', content: markdown },
      { extension: 'json', content: json },
    ]
  : [
      {
        extension: format === 'json' ? 'json' : 'md',
        content: format === 'json' ? json : markdown,
      },
    ];

if (outDirArg) {
  const outDir = path.resolve(process.cwd(), outDirArg);
  const outputName = sanitizeFileName(outputNameArg ?? path.basename(inputPath, path.extname(inputPath)));
  fs.mkdirSync(outDir, { recursive: true });

  const written = outputs.map(({ extension, content }) => {
    const destination = path.join(outDir, `${outputName}.${extension}`);
    fs.writeFileSync(destination, content, 'utf8');
    return destination;
  });

  console.log(written.join('\n'));
} else {
  console.log(outputs[0].content);
}

function getFlagValue(argv, flagName) {
  const index = argv.indexOf(flagName);
  if (index === -1 || index === argv.length - 1) {
    return null;
  }

  return argv[index + 1];
}

function sanitizeFileName(value) {
  return value.replace(/[<>:"/\\|?*]/g, '-');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
