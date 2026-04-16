# Architecture Review Checklist

Use the generated report to ask a few fast questions:

1. Does every service have a clear owner?
2. Can every dependency be resolved to a known service?
3. Are health checks present on all runtime services?
4. Is deployment order obvious and deterministic?
5. If one dependency fails, which downstream services are exposed?

This checklist keeps the exercise focused on operational consequences, not just diagram aesthetics.
