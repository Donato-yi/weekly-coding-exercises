# Usage

## Run locally
```bash
cd weeks/2026-W13

go run ./src/cmd/habits
```

Open http://localhost:8080

## Tests
```bash
go test ./...
```

## Notes
- Uses HTMX for partial updates (list + item swaps).
- Validation errors return list HTML with a banner message.
- Tailwind is loaded via CDN for fast styling.
