# Token Audit Notes

The first slice focuses on deterministic parsing and naming checks. The audit is intentionally strict about token names because design-token drift often starts with small inconsistencies that later make exports, docs, and component usage harder to review.

## Current Rules
- Token sets must provide a tokens array.
- Supported categories are color, typography, spacing, radius, and shadow.
- Token names use lowercase dot-separated kebab-case segments.
- Token names must start with their category.
- Color token values must be hex strings.
- Aliases cannot be reused by different tokens.
- Vague segments such as misc, other, and stuff are warnings.
- Explicit contrast pairs can be listed with foreground and background token names.
- Semantic color pairs named as color.<role>.<state>.foreground/background are inferred automatically.
- Contrast below 4.5:1 fails; contrast from 4.5:1 to below 7:1 passes AA but warns that it misses AAA.

## Contrast Pair Notes
Contrast checks are intentionally pair-based. A color can be valid by itself and still fail once it is used as text on a real surface. The audit supports both explicit pairs for product-specific roles and inferred pairs for semantic statuses such as success, warning, and danger.

## Next Slice
- Add optional report destinations so CI can persist markdown artifacts directly.
- Add a compact changelog section that highlights newly introduced failures between two reports.

## Browser Inspector Notes
The browser demo uses the same parser and audit model as the CLI, then maps the result into preview sections: color swatches, typography samples, spacing ramps, radius ramps, contrast cards, and grouped issue rows. Keeping the view model in TypeScript makes the demo easy to test without requiring a DOM test harness.

## Exportable Reports
The CLI can now render either JSON or markdown:

    npm run audit -- demos/clean-tokens.json --format json
    npm run audit -- demos/problematic-tokens.json --format markdown

JSON output includes a generated timestamp and issue-level suggested fixes for automation. Markdown output groups failures before warnings so a pull request comment can lead with release-blocking issues and keep advisory cleanup separate.
