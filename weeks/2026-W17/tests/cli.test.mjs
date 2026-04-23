import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseArgs, renderReport, usage } from '../src/cli.mjs';

const tokens = JSON.parse(fs.readFileSync(new URL('../demos/sample_tokens.json', import.meta.url), 'utf8'));

test('parseArgs supports selector overrides and summary-only mode', () => {
  const args = parseArgs(['demos/sample_tokens.json', '--selector', '[data-theme="dark"]', '--summary-only']);
  assert.equal(args.inputPath, 'demos/sample_tokens.json');
  assert.equal(args.selector, '[data-theme="dark"]');
  assert.equal(args.summaryOnly, true);
});

test('parseArgs rejects unknown flags', () => {
  assert.throws(() => parseArgs(['demos/sample_tokens.json', '--json']), /Unknown option: --json/);
});

test('renderReport can omit CSS output for quick review', () => {
  const output = renderReport(tokens, { summaryOnly: true });
  assert.doesNotMatch(output, /# CSS Variables/);
  assert.match(output, /# Contrast Audit/);
  assert.match(output, /# Summary:/);
});

test('usage documents the new CLI flags', () => {
  assert.match(usage(), /--selector <css-selector>/);
  assert.match(usage(), /--summary-only/);
});
