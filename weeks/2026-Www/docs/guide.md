# Design Tokens Guide

## Why tokens?
Tokens give you a single source of truth for spacing, color, and typography. They scale from a single component to a full design system.

## Usage
```ts
import { createTheme, toCssVars } from "./src/tokens.js";

const theme = createTheme({ color: { primary: "#10b981" } });
const css = toCssVars(theme);
console.log(css);
```

## Tips
- Keep keys short and predictable (color-primary, space-md).
- Use CSS variables for theme switching without re‑rendering UI.
- Avoid mixing raw colors and token values in components.
