# Integration Guide

## 1) Generate CSS Variables

Use the library to emit CSS variables for a preset theme:

```ts
import { createPresetTheme, toCssVars } from "../src/tokens.js";

const theme = createPresetTheme("dark");
const cssVars = toCssVars(theme, "[data-theme=\"dark\"]");
console.log(cssVars);
```

## 2) Apply In HTML

```html
<div data-theme="dark" class="card">
  <h2>Dark Theme Card</h2>
  <button class="btn">Confirm</button>
</div>
```

## 3) Style Components Once

```css
.card {
  background: var(--color-surface);
  color: var(--color-surfaceText);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
}
```

## Tips

- Keep a single base theme in `:root`, then override with `[data-theme]` blocks.
- Prefer small preset deltas (override only what changes) to keep maintenance easy.
