import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseArgs, renderReport, usage } from '../src/cli.mjs';

const tokens = JSON.parse(fs.readFileSync(new URL('../demos/sample_tokens.json', import.meta.url), 'utf8'));

test('parseArgs supports selector overrides, summary-only mode, and export options', () => {
  const args = parseArgs(['demos/sample_tokens.json', '--selector', '[data-theme="dark"]', '--summary-only', '--format', 'json', '--output', 'demos/report.json']);
  assert.equal(args.inputPath, 'demos/sample_tokens.json');
  assert.equal(args.selector, '[data-theme="dark"]');
  assert.equal(args.summaryOnly, true);
  assert.equal(args.format, 'json');
  assert.equal(args.outputPath, 'demos/report.json');
});

test('parseArgs rejects unknown flags', () => {
  assert.throws(() => parseArgs(['demos/sample_tokens.json', '--json']), /Unknown option: --json/);
});

test('parseArgs rejects unsupported formats', () => {
  assert.throws(() => parseArgs(['demos/sample_tokens.json', '--format', 'html']), /Unsupported format: html/);
});

test('renderReport can omit CSS output for quick review', () => {
  const output = renderReport(tokens, { summaryOnly: true });
  assert.doesNotMatch(output, /# CSS Variables/);
  assert.match(output, /# Contrast Audit/);
  assert.match(output, /# Summary:/);
});

test('renderReport supports markdown exports', () => {
  const output = renderReport(tokens, { format: 'markdown' });
  assert.match(output, /# Design Token Report/);
  assert.match(output, /```css/);
  assert.match(output, /## Summary/);
});

test('renderReport supports json exports', () => {
  const output = renderReport(tokens, { format: 'json', summaryOnly: true, selector: '[data-theme="light"]' });
  const parsed = JSON.parse(output);
  assert.equal(parsed.selector, '[data-theme="light"]');
  assert.equal(parsed.summary.counts.fail, 1);
  assert.equal(parsed.css, undefined);
});

test('usage documents the new CLI flags', () => {
  assert.match(usage(), /--selector <css-selector>/);
  assert.match(usage(), /--summary-only/);
  assert.match(usage(), /--format <text\|markdown\|json>/);
  assert.match(usage(), /--output <path>/);
});
