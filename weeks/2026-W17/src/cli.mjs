import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCssVariables, buildSummary } from './tokenKit.mjs';

const VALID_FORMATS = new Set(['text', 'markdown', 'json']);

export function usage() {
  return [
    'Usage: node src/cli.mjs <path-to-tokens.json> [--selector <css-selector>] [--summary-only] [--format <text|markdown|json>] [--output <path>]',
    '',
    'Options:',
    '  --selector <css-selector>  Override the CSS selector used for generated variables',
    '  --summary-only             Print the audit summary without the CSS variable block',
    '  --format <type>            Choose text, markdown, or json output',
    '  --output <path>            Write the rendered report to a file',
    '  --help                     Show this message',
  ].join('\n');
}

export function parseArgs(argv) {
  const options = {
    inputPath: null,
    selector: ':root',
    summaryOnly: false,
    format: 'text',
    outputPath: null,
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
    if (arg === '--format') {
      const format = argv[index + 1];
      if (!format) {
        throw new Error('Missing value for --format');
      }
      if (!VALID_FORMATS.has(format)) {
        throw new Error(`Unsupported format: ${format}`);
      }
      options.format = format;
      index += 1;
      continue;
    }
    if (arg === '--output') {
      const outputPath = argv[index + 1];
      if (!outputPath) {
        throw new Error('Missing value for --output');
      }
      options.outputPath = outputPath;
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

function buildReportPayload(tokens, selector = ':root') {
  return {
    selector,
    css: buildCssVariables(tokens, selector),
    summary: buildSummary(tokens),
  };
}

function renderTextReport(payload, summaryOnly = false) {
  const lines = [];

  if (!summaryOnly) {
    lines.push('# CSS Variables');
    lines.push(payload.css);
    lines.push('');
  }

  lines.push('# Contrast Audit');
  for (const check of payload.summary.checks) {
    lines.push(`- ${check.name}: ${check.status.toUpperCase()} (${check.ratio}:1) ${check.message}`);
  }
  lines.push('');
  lines.push('# Token Warnings');
  if (payload.summary.warnings.length === 0) {
    lines.push('- none');
  } else {
    for (const warning of payload.summary.warnings) {
      lines.push(`- ${warning.type}: ${warning.message}`);
    }
  }
  lines.push('');
  lines.push(`# Summary: ${payload.summary.tokenCount} tokens, ${payload.summary.counts.pass} pass, ${payload.summary.counts.warn} warn, ${payload.summary.counts.fail} fail, ${payload.summary.warningCount} token warnings`);

  return lines.join('\n');
}

function renderMarkdownReport(payload, summaryOnly = false) {
  const lines = ['# Design Token Report', ''];

  if (!summaryOnly) {
    lines.push('## CSS Variables');
    lines.push('```css');
    lines.push(payload.css);
    lines.push('```');
    lines.push('');
  }

  lines.push('## Contrast Audit');
  for (const check of payload.summary.checks) {
    lines.push(`- **${check.name}**: ${check.status.toUpperCase()} (${check.ratio}:1), ${check.message}`);
  }
  lines.push('');
  lines.push('## Token Warnings');
  if (payload.summary.warnings.length === 0) {
    lines.push('- none');
  } else {
    for (const warning of payload.summary.warnings) {
      lines.push(`- **${warning.type}**: ${warning.message}`);
    }
  }
  lines.push('');
  lines.push(`## Summary\n- Selector: \`${payload.selector}\`\n- Tokens: ${payload.summary.tokenCount}\n- Checks: ${payload.summary.counts.pass} pass, ${payload.summary.counts.warn} warn, ${payload.summary.counts.fail} fail\n- Token warnings: ${payload.summary.warningCount}`);

  return lines.join('\n');
}

export function renderReport(tokens, { selector = ':root', summaryOnly = false, format = 'text' } = {}) {
  const payload = buildReportPayload(tokens, selector);

  if (format === 'json') {
    const jsonPayload = summaryOnly
      ? { selector: payload.selector, summary: payload.summary }
      : payload;
    return JSON.stringify(jsonPayload, null, 2);
  }

  if (format === 'markdown') {
    return renderMarkdownReport(payload, summaryOnly);
  }

  return renderTextReport(payload, summaryOnly);
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
  const output = renderReport(tokens, options);

  if (options.outputPath) {
    fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
    fs.writeFileSync(options.outputPath, output);
  }

  console.log(output);
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const modulePath = fileURLToPath(import.meta.url);

if (entryPath === modulePath) {
  main();
}
