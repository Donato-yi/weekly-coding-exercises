import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildJsonReport, evaluateTrace, parseTrace, renderMarkdownReport } from '../src/analyze.mjs';

const fixturePath = path.resolve(process.cwd(), 'demos/sample_trace.json');
const trace = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

test('parseTrace summarizes steps and tools', () => {
  const parsed = parseTrace(trace);
  assert.equal(parsed.summary.stepCount, 5);
  assert.equal(parsed.summary.toolCallCount, 4);
  assert.deepEqual(parsed.summary.uniqueTools, ['web_search', 'shell', 'write']);
  assert.equal(parsed.summary.failureCount, 1);
  assert.equal(parsed.summary.retryCount, 2);
  assert.equal(parsed.summary.approvalCount, 1);
});

test('evaluateTrace returns warnings and recommendations', () => {
  const parsed = parseTrace(trace);
  const evaluation = evaluateTrace(parsed);
  assert.equal(evaluation.severity, 'high');
  assert.ok(evaluation.warnings.some((item) => item.includes('failed')));
  assert.ok(evaluation.warnings.some((item) => item.includes('risky command')));
  assert.ok(evaluation.recommendations.some((item) => item.includes('human review')));
});

test('report builders expose markdown and JSON views', () => {
  const parsed = parseTrace(trace);
  const evaluation = evaluateTrace(parsed);
  const markdown = renderMarkdownReport(parsed, evaluation);
  const json = buildJsonReport(parsed, evaluation);

  assert.match(markdown, /# Trace Review Report/);
  assert.equal(json.summary.toolCallCount, 4);
  assert.equal(json.evaluation.score, evaluation.score);
});
