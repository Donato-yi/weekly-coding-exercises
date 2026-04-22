import fs from 'node:fs';
import { buildCssVariables, buildSummary } from './tokenKit.mjs';

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node src/cli.mjs <path-to-tokens.json>');
    process.exit(1);
  }

  const tokens = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const css = buildCssVariables(tokens);
  const summary = buildSummary(tokens);

  console.log('# CSS Variables');
  console.log(css);
  console.log('');
  console.log('# Contrast Audit');
  for (const check of summary.checks) {
    console.log(`- ${check.name}: ${check.status.toUpperCase()} (${check.ratio}:1) ${check.message}`);
  }
  console.log('');
  console.log('# Token Warnings');
  if (summary.warnings.length === 0) {
    console.log('- none');
  } else {
    for (const warning of summary.warnings) {
      console.log(`- ${warning.type}: ${warning.message}`);
    }
  }
  console.log('');
  console.log(`# Summary: ${summary.tokenCount} tokens, ${summary.counts.pass} pass, ${summary.counts.warn} warn, ${summary.counts.fail} fail, ${summary.warningCount} token warnings`);
}

main();
