import test from "node:test";
import assert from "node:assert/strict";
import {
  baseTokens,
  createPresetTheme,
  createTheme,
  themePresets,
  toCssVarMap,
  toCssVars
} from "../src/tokens.js";

test("createTheme merges overrides", () => {
  const theme = createTheme({ color: { primary: "#111111" } });
  assert.equal(theme.color.primary, "#111111");
  assert.equal(theme.color.surface, baseTokens.color.surface);
});

test("createTheme with no overrides returns base tokens", () => {
  const theme = createTheme();
  assert.deepEqual(theme, baseTokens);
});

test("createPresetTheme applies preset + overrides", () => {
  const theme = createPresetTheme("light", { color: { primary: "#0ea5e9" } });
  assert.equal(theme.color.primary, "#0ea5e9");
  assert.equal(theme.color.surface, themePresets.light.color?.surface);
});

test("toCssVars emits expected keys and selector", () => {
  const css = toCssVars(baseTokens, "[data-theme=\"ocean\"]");
  assert.match(css, /--color-primary:/);
  assert.match(css, /--space-md:/);
  assert.match(css, /\[data-theme=\"ocean\"\] \{/);
});

test("toCssVarMap exposes all token keys", () => {
  const map = toCssVarMap(baseTokens);
  assert.equal(map["--color-primary"], baseTokens.color.primary);
  assert.equal(map["--radius-md"], baseTokens.radius.md);
  assert.equal(map["--type-fontFamily"], baseTokens.typography.fontFamily);
});
