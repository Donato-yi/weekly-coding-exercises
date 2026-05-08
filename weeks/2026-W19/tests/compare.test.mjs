import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseTrace } from '../src/analyze.mjs';
import { buildComparisonJsonReport, compareTraces, renderComparisonMarkdownReport } from '../src/compare.mjs';

const samplePath = path.resolve(process.cwd(), 'demos/sample_trace.json');
const riskyPath = path.resolve(process.cwd(), 'demos/prompt_risky_trace.json');
const sampleTrace = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
const riskyTrace = JSON.parse(fs.readFileSync(riskyPath, 'utf8'));

test('compareTraces highlights score deltas and new rule hits', () => {
  const comparison = compareTraces(parseTrace(sampleTrace), parseTrace(riskyTrace));
  assert.equal(comparison.diff.betterRunLabel, 'Right run');
  assert.equal(comparison.diff.riskyPromptDelta, 3);
  assert.ok(comparison.diff.newRuleHits.includes('prompt-bypass-approval'));
});

test('comparison report builders expose markdown and JSON views', () => {
  const comparison = compareTraces(parseTrace(sampleTrace), parseTrace(riskyTrace));
  const markdown = renderComparisonMarkdownReport(comparison);
  const json = buildComparisonJsonReport(comparison);

  assert.match(markdown, /# Trace Comparison Report/);
  assert.match(markdown, /## Better Run/);
  assert.equal(json.diff.failureDelta, -1);
});
