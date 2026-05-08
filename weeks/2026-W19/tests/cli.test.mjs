import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const cliPath = path.resolve(process.cwd(), 'src/cli.mjs');

function runCli(args) {
  return execFileSync(process.execPath, [cliPath, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  }).trim();
}

test('cli renders markdown to stdout by default', () => {
  const output = runCli(['demos/sample_trace.json']);
  assert.match(output, /# Trace Review Report/);
  assert.match(output, /## Summary/);
});

test('cli renders JSON to stdout when requested', () => {
  const output = runCli(['demos/sample_trace.json', '--format', 'json']);
  const parsed = JSON.parse(output);
  assert.equal(parsed.summary.toolCallCount, 4);
  assert.equal(parsed.evaluation.severity, 'high');
});

test('cli writes both report formats to an output directory', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trace-cli-'));
  const stdout = runCli([
    'demos/prompt_risky_trace.json',
    '--format',
    'both',
    '--out-dir',
    outDir,
    '--output-name',
    'prompt-review',
  ]);

  const markdownPath = path.join(outDir, 'prompt-review.md');
  const jsonPath = path.join(outDir, 'prompt-review.json');

  assert.match(stdout, /prompt-review\.md/);
  assert.match(stdout, /prompt-review\.json/);
  assert.ok(fs.existsSync(markdownPath));
  assert.ok(fs.existsSync(jsonPath));
  assert.match(fs.readFileSync(markdownPath, 'utf8'), /Prompt Risks: 3/);
  assert.equal(JSON.parse(fs.readFileSync(jsonPath, 'utf8')).summary.riskyPromptCount, 3);
});

test('cli compares two traces and writes comparison artifacts', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trace-compare-'));
  const stdout = runCli([
    'demos/sample_trace.json',
    'demos/prompt_risky_trace.json',
    '--compare',
    '--format',
    'both',
    '--out-dir',
    outDir,
    '--output-name',
    'comparison',
  ]);

  const markdownPath = path.join(outDir, 'comparison.md');
  const jsonPath = path.join(outDir, 'comparison.json');

  assert.match(stdout, /comparison\.md/);
  assert.match(stdout, /comparison\.json/);
  assert.match(fs.readFileSync(markdownPath, 'utf8'), /# Trace Comparison Report/);
  assert.equal(JSON.parse(fs.readFileSync(jsonPath, 'utf8')).diff.betterRunLabel, 'Right run');
});
