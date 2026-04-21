# Design Token Accessibility Toolkit

This week's exercise turns a small nested token file into two practical review artifacts:

1. A `:root` CSS variable block that frontend code can consume directly.
2. A contrast audit that catches obvious accessibility issues before a full UI implementation exists.

## Why this exercise matters

Design systems often fail in the handoff layer, not in the mockup. Stable token names and lightweight audits help designers and engineers review the same artifact.

## Workflow

1. Update `demos/sample_tokens.json` or replace it with exported design tokens.
2. Run `node src/cli.mjs demos/sample_tokens.json`.
3. Review the generated CSS and contrast audit.
4. Fix failing pairs before wiring the theme into a component library.

## Next extensions

- Support semantic aliases, like `button.primary.bg -> colors.accent.brand`
- Export scoped theme selectors, such as `[data-theme="dark"]`
- Emit JSON reports for CI or pull-request comments
