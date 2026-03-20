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

## Presets
Presets give you curated themes you can tweak quickly:
```ts
import { createPresetTheme, toCssVars } from "./src/tokens.js";

const sunset = createPresetTheme("sunset", { spacing: { md: "18px" } });
console.log(toCssVars(sunset, "[data-theme=\"sunset\"]"));
```

## Theme scoping
Use a scoped selector to avoid global overrides:
```ts
const darkTheme = createTheme({
  color: { surface: "#0b1120", surfaceText: "#e5e7eb" }
});
console.log(toCssVars(darkTheme, "[data-theme=\"dark\"]"));
```

## Tips
- Keep keys short and predictable (color-primary, space-md).
- Use CSS variables for theme switching without re‑rendering UI.
- Avoid mixing raw colors and token values in components.
