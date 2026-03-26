# HTMX Swap Map — Habit Check-ins

This app relies on three template layers with clear swap targets.

## Template Layers

- **page**: Full HTML shell + the `<div id="list">` swap target.
- **list**: Banner + list markup. Returned after add requests.
- **item**: Single list row. Returned after toggle requests.

## Swap Targets

| Action | Endpoint | HTMX Target | Swap | Returned Template |
| --- | --- | --- | --- | --- |
| Add habit | `POST /items` | `#list` | `innerHTML` | `list` |
| Toggle habit | `POST /items/{id}/toggle` | `#item-{id}` | `outerHTML` | `item` |

## Why This Works

- **Add** returns the full list so validation errors can render the banner without extra client logic.
- **Toggle** swaps only the item row, keeping the rest of the list untouched.

## Gotchas

- Always return `text/html` for HTMX fragment responses.
- Keep list errors inside the list template so a single target update handles everything.
