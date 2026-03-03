# Task Spec — JSON Loader (Week 10)

## Quick Start
- Place a JSON spec (see `/demos/sample-spec.json`).
- Decode and validate:

```go
spec, err := src.LoadSpec("./demos/sample-spec.json")
```

## Notes
- Unknown fields are rejected to prevent typos.
- Validation requires at least one task and one step per task.
