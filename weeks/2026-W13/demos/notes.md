# Demo Notes

- Landing view shows a clean habit list with an HTMX-powered add form.
- Each item toggles completion via an inline HTMX request.
- Validation errors show in a slim banner without losing the list state.
- Tailwind provides quick contrast for done vs. pending habits.
- Add swaps replace the entire list container (`#list`) while toggle swaps only the row (`#item-{id}`).
