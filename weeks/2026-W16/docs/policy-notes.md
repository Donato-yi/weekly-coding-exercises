# Policy Scoring Notes

The scoring model is intentionally simple:

- Tier weight reflects how business-critical a service is.
- Dependency count adds a little implementation complexity.
- Blast radius rewards attention to central shared services.
- Missing owner and missing health check are treated as concrete operational risks.
- Unknown dependencies are penalized heavily because the model cannot validate them.

This is a good fit for lightweight architecture reviews, onboarding exercises, or design interviews where you want something more actionable than a static diagram.
