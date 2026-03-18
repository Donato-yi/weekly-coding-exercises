import test from "node:test";
import assert from "node:assert/strict";
import { baseTokens, createTheme, toCssVars } from "../src/tokens.js";

test("createTheme merges overrides", () => {
  const theme = createTheme({ color: { primary: "#111111" } });
  assert.equal(theme.color.primary, "#111111");
  assert.equal(theme.color.surface, baseTokens.color.surface);
});

test("toCssVars emits expected keys", () => {
  const css = toCssVars(baseTokens);
  assert.match(css, /--color-primary:/);
  assert.match(css, /--space-md:/);
  assert.match(css, /:root \{/);
});
