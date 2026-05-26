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

## Next Slice
- Add contrast checks for semantic foreground/background pairs.
- Render audit output in a browser demo with swatches and grouped failures.

