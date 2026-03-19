# Tutorial — Theming With Scoped Tokens

## 1) Start with base tokens
```ts
import { baseTokens, toCssVars } from "../src/tokens.js";

const baseCss = toCssVars(baseTokens);
```

## 2) Create a dark theme
```ts
import { createTheme } from "../src/tokens.js";

const darkTheme = createTheme({
  color: {
    surface: "#0b1120",
    surfaceText: "#e5e7eb",
    border: "#1f2937"
  }
});
```

## 3) Scope by data attribute
```ts
import { toCssVars } from "../src/tokens.js";

const darkCss = toCssVars(darkTheme, "[data-theme=\"dark\"]");
```

## 4) Apply in HTML
```html
<div data-theme="dark">
  <button class="btn">Dark Theme</button>
</div>
```

## 5) Use CSS vars
```css
.btn {
  background: var(--color-primary);
  color: var(--color-primaryText);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
```
