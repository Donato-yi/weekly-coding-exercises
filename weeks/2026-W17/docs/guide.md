# Design Token Accessibility Toolkit

This week's exercise turns a small nested token file into practical review artifacts:

1. A `:root` CSS variable block that frontend code can consume directly.
2. A contrast audit that catches obvious accessibility issues before a full UI implementation exists.
3. A token warning pass that highlights broken semantic aliases before they ship into a theme.

## Why this exercise matters

Design systems often fail in the handoff layer, not in the mockup. Stable token names, semantic aliases, and lightweight audits help designers and engineers review the same artifact.

## Workflow

1. Update `demos/sample_tokens.json` or replace it with exported design tokens.
2. Use raw tokens for physical values, then point semantic tokens at them with `{colors.accent.brand}` style aliases.
3. Run `node src/cli.mjs demos/sample_tokens.json`.
4. Review the generated CSS, contrast audit, and token warnings.
5. Fix failing pairs or dangling aliases before wiring the theme into a component library.

## Notes on semantic aliases

- Semantic aliases keep component intent readable, for example `semantic.button.primary.bg`.
- The CLI resolves aliases during contrast checks, so tests can validate component-level pairings instead of only raw palette tokens.
- Broken aliases are surfaced as warnings so token packs can fail review before they break runtime styling.

## Next extensions

- Support scoped theme selectors, such as `[data-theme="dark"]`
- Emit JSON reports for CI or pull-request comments
- Add token diffing so designers can compare theme revisions between commits
