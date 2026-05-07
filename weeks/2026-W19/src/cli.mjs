#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildJsonReport, evaluateTrace, parseTrace, renderMarkdownReport } from './analyze.mjs';

const args = process.argv.slice(2);
const inputPath = args[0];
const format = getFlagValue(args, '--format') ?? 'markdown';
const outDirArg = getFlagValue(args, '--out-dir');
const outputNameArg = getFlagValue(args, '--output-name');

if (!inputPath) {
  fail('Usage: node src/cli.mjs <trace.json> [--format markdown|json|both] [--out-dir <dir>] [--output-name <name>]');
}

if (!['markdown', 'json', 'both'].includes(format)) {
  fail(`Unsupported format: ${format}`);
}

if (format === 'both' && !outDirArg) {
  fail('The "both" format requires --out-dir so the markdown and JSON reports can be written as separate files.');
}

const fullPath = path.resolve(process.cwd(), inputPath);
const raw = fs.readFileSync(fullPath, 'utf8');
const parsed = parseTrace(raw);
const evaluation = evaluateTrace(parsed);
const markdown = renderMarkdownReport(parsed, evaluation);
const json = JSON.stringify(buildJsonReport(parsed, evaluation), null, 2);

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
