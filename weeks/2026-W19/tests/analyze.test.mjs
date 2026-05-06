import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildJsonReport, evaluateTrace, parseTrace, renderMarkdownReport } from '../src/analyze.mjs';

const samplePath = path.resolve(process.cwd(), 'demos/sample_trace.json');
const riskyPath = path.resolve(process.cwd(), 'demos/prompt_risky_trace.json');
const sampleTrace = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
const riskyTrace = JSON.parse(fs.readFileSync(riskyPath, 'utf8'));

test('parseTrace summarizes steps, tools, and prompt signals', () => {
  const parsed = parseTrace(sampleTrace);
  assert.equal(parsed.summary.stepCount, 5);
  assert.equal(parsed.summary.toolCallCount, 4);
  assert.deepEqual(parsed.summary.uniqueTools, ['web_search', 'shell', 'write']);
  assert.equal(parsed.summary.failureCount, 1);
  assert.equal(parsed.summary.retryCount, 2);
  assert.equal(parsed.summary.approvalCount, 1);
  assert.equal(parsed.summary.riskyCommandCount, 2);
  assert.equal(parsed.summary.riskyPromptCount, 0);
  assert.equal(parsed.promptSignals.length, 0);
});

test('evaluateTrace returns categorized warnings and recommendations', () => {
  const parsed = parseTrace(sampleTrace);
  const evaluation = evaluateTrace(parsed);
  assert.equal(evaluation.severity, 'high');
  assert.ok(evaluation.warnings.some((item) => item.includes('failed')));
  assert.ok(evaluation.warnings.some((item) => item.includes('network command risk')));
  assert.ok(evaluation.warnings.some((item) => item.includes('destructive command risk')));
  assert.ok(evaluation.recommendations.some((item) => item.includes('human review')));
  assert.ok(evaluation.ruleHits.some((item) => item.id === 'cmd-network'));
});

test('prompt heuristics flag bypass and secret-exposure language', () => {
  const parsed = parseTrace(riskyTrace);
  const evaluation = evaluateTrace(parsed);
  assert.equal(parsed.summary.riskyPromptCount, 3);
  assert.ok(evaluation.ruleHits.some((item) => item.id === 'prompt-ignore-prior'));
  assert.ok(evaluation.ruleHits.some((item) => item.id === 'prompt-bypass-approval'));
  assert.ok(evaluation.ruleHits.some((item) => item.id === 'prompt-secrets'));
  assert.ok(evaluation.recommendations.some((item) => item.includes('policy violation')));
});

test('report builders expose markdown and JSON views', () => {
  const parsed = parseTrace(riskyTrace);
  const evaluation = evaluateTrace(parsed);
  const markdown = renderMarkdownReport(parsed, evaluation);
  const json = buildJsonReport(parsed, evaluation);

  assert.match(markdown, /# Trace Review Report/);
  assert.match(markdown, /## Rule Hits/);
  assert.equal(json.summary.riskyPromptCount, 3);
  assert.equal(json.evaluation.score, evaluation.score);
});
