import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCssVariables, buildSummary } from './tokenKit.mjs';

export function usage() {
  return [
    'Usage: node src/cli.mjs <path-to-tokens.json> [--selector <css-selector>] [--summary-only]',
    '',
    'Options:',
    '  --selector <css-selector>  Override the CSS selector used for generated variables',
    '  --summary-only             Print the audit summary without the CSS variable block',
    '  --help                     Show this message',
  ].join('\n');
}

export function parseArgs(argv) {
  const options = {
    inputPath: null,
    selector: ':root',
    summaryOnly: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    if (arg === '--summary-only') {
      options.summaryOnly = true;
      continue;
    }
    if (arg === '--selector') {
      const selector = argv[index + 1];
      if (!selector) {
        throw new Error('Missing value for --selector');
      }
      options.selector = selector;
      index += 1;
      continue;
    }
    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (options.inputPath) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    options.inputPath = arg;
  }

  return options;
}

export function renderReport(tokens, { selector = ':root', summaryOnly = false } = {}) {
  const css = buildCssVariables(tokens, selector);
  const summary = buildSummary(tokens);
  const lines = [];

  if (!summaryOnly) {
    lines.push('# CSS Variables');
    lines.push(css);
    lines.push('');
  }

  lines.push('# Contrast Audit');
  for (const check of summary.checks) {
    lines.push(`- ${check.name}: ${check.status.toUpperCase()} (${check.ratio}:1) ${check.message}`);
  }
  lines.push('');
  lines.push('# Token Warnings');
  if (summary.warnings.length === 0) {
    lines.push('- none');
  } else {
    for (const warning of summary.warnings) {
      lines.push(`- ${warning.type}: ${warning.message}`);
    }
  }
  lines.push('');
  lines.push(`# Summary: ${summary.tokenCount} tokens, ${summary.counts.pass} pass, ${summary.counts.warn} warn, ${summary.counts.fail} fail, ${summary.warningCount} token warnings`);

  return lines.join('\n');
}

export function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    console.error('');
    console.error(usage());
    process.exit(1);
  }

  if (options.help || !options.inputPath) {
    console.log(usage());
    process.exit(options.help ? 0 : 1);
  }

  const tokens = JSON.parse(fs.readFileSync(options.inputPath, 'utf8'));
  console.log(renderReport(tokens, options));
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const modulePath = fileURLToPath(import.meta.url);

if (entryPath === modulePath) {
  main();
}
