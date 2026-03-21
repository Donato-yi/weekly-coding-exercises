# Usage Notes

- Run tests: `npm test`
- Emit CSS vars: `toCssVars(theme, selector)`
- Get a map for tooling: `toCssVarMap(theme)`

## Preset Themes

```ts
import { createPresetTheme, toCssVars } from "../src/tokens.js";

const theme = createPresetTheme("sunset");
const css = toCssVars(theme, ":root");
console.log(css);
```

## Integration Demo

- See `demos/integration-demo.html` + `demos/integration-demo.css` for a self-contained snippet.
- Drop the CSS vars block into `:root` or scoped selectors like `[data-theme="dark"]`.
- Toggle the `data-theme` attribute to swap presets without touching component styles.
