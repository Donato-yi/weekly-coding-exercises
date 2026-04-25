# Design Token Accessibility Toolkit

This week's exercise turns a small nested token file into practical review artifacts:

1. A `:root` CSS variable block that frontend code can consume directly.
2. A contrast audit that catches obvious accessibility issues before a full UI implementation exists.
3. A token warning pass that highlights broken semantic aliases before they ship into a theme.
4. A review checklist that turns failed checks and token warnings into concrete follow-up items.
5. A small CLI with review-friendly flags for scoped theme previews and fast audit-only output.

## Why this exercise matters

Design systems often fail in the handoff layer, not in the mockup. Stable token names, semantic aliases, and lightweight audits help designers and engineers review the same artifact.

## Workflow

1. Update `demos/sample_tokens.json` or replace it with exported design tokens.
2. Use raw tokens for physical values, then point semantic tokens at them with `{colors.accent.brand}` style aliases.
3. Run one of the CLI commands below.
4. Review the generated CSS, contrast audit, token warnings, and generated checklist.
5. Fix failing pairs or dangling aliases before wiring the theme into a component library.

## CLI examples

```bash
node src/cli.mjs demos/sample_tokens.json
node src/cli.mjs demos/dark_tokens.json --selector '[data-theme="dark"]'
node src/cli.mjs demos/sample_tokens.json --summary-only
node src/cli.mjs demos/sample_tokens.json --format markdown --output demos/report.md
node src/cli.mjs demos/sample_tokens.json --format json --summary-only --output demos/report.json
```

## Export modes

- `--format text` keeps the current terminal-friendly review output.
- `--format markdown` wraps CSS in fenced blocks and produces a shareable artifact for docs or pull requests.
- `--format json` emits structured summary data that a CI step or bot can parse.
- `--output <path>` writes the chosen format to disk while still printing it to stdout, which is handy for both automation logs and saved review artifacts.
- Exported summaries now include a review checklist so pull requests can carry the exact follow-up items alongside the raw audit data.

## Notes on semantic aliases

- Semantic aliases keep component intent readable, for example `semantic.button.primary.bg`.
- The CLI resolves aliases during contrast checks, so tests can validate component-level pairings instead of only raw palette tokens.
- Broken aliases are surfaced as warnings so token packs can fail review before they break runtime styling.

## Demo fixtures

- `demos/sample_tokens.json` keeps one intentionally broken alias and one failing warning pair so the audit has something useful to flag.
- `demos/dark_tokens.json` is a clean dark theme fixture that demonstrates selector scoping with `[data-theme="dark"]`.
- `demos/demo_output.txt` and `demos/dark_demo_output.txt` capture representative CLI output for quick review.
- `demos/review_checklist.md` shows the checklist-focused markdown export that a designer or frontend reviewer could paste into a ticket.

## Next extensions

- Add token diffing so designers can compare theme revisions between commits
- Support grouped reports for multiple theme files in one run
- Emit SARIF or GitHub-friendly annotations for failing contrast checks
