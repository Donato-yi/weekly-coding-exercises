import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCssVariables, buildSummary, buildTokenDiff, contrastRatio, flattenTokens, resolveToken } from '../src/tokenKit.mjs';

const tokens = JSON.parse(fs.readFileSync(new URL('../demos/sample_tokens.json', import.meta.url), 'utf8'));
const baselineTokens = JSON.parse(fs.readFileSync(new URL('../demos/baseline_tokens.json', import.meta.url), 'utf8'));

test('flattenTokens produces stable dot paths', () => {
  const flat = flattenTokens(tokens);
  assert.equal(flat['colors.text.primary'], '#0f172a');
  assert.equal(flat['spacing.md'], '16px');
  assert.equal(flat['typography.fontSize.hero'], '32px');
});

test('buildCssVariables emits sorted CSS custom properties', () => {
  const css = buildCssVariables(tokens);
  assert.match(css, /--colors-surface-base: #ffffff;/);
  assert.match(css, /--radius-pill: 999px;/);
  assert.match(css, /:root \{/);
});

test('contrastRatio distinguishes strong and weak pairs', () => {
  assert.equal(contrastRatio('#0f172a', '#ffffff') > 10, true);
  assert.equal(contrastRatio('#d97706', '#f5f7fb') < 4.5, true);
});

test('semantic aliases resolve to raw token values', () => {
  const flat = flattenTokens(tokens);
  assert.equal(resolveToken(flat, 'semantic.button.primary.bg'), '#4f46e5');
  assert.equal(resolveToken(flat, 'semantic.button.primary.fg'), '#f8fafc');
});

test('buildSummary reports pass and fail counts from checks', () => {
  const summary = buildSummary(tokens);
  assert.equal(summary.tokenCount > 15, true);
  assert.equal(summary.counts.pass, 4);
  assert.equal(summary.counts.fail, 1);
  assert.equal(summary.checks.find((item) => item.name === 'warning-on-muted')?.status, 'fail');
});

test('buildSummary surfaces dangling alias warnings', () => {
  const summary = buildSummary(tokens);
  assert.equal(summary.warningCount, 1);
  assert.match(summary.warnings[0].message, /missing token colors\.accent\.info/);
  assert.equal(summary.reviewChecklist.length, 2);
  assert.match(summary.reviewChecklist[0].action, /Adjust warning-on-muted before release/);
  assert.match(buildCssVariables(tokens), /--semantic-button-primary-bg: var\(--colors-accent-brand\);/);
});

test('buildTokenDiff reports added and changed token paths', () => {
  const diff = buildTokenDiff(baselineTokens, tokens);
  assert.equal(diff.counts.added > 0, true);
  assert.equal(diff.counts.changed > 0, true);
  assert.equal(diff.changed.some((item) => item.path === 'colors.accent.brand'), true);
  assert.equal(diff.added.some((item) => item.path === 'semantic.badge.info.bg'), true);
});
