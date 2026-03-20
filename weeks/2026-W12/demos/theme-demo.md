# Demo — Scoped Theme Override

```css
[data-theme="dark"] {
  --color-surface: #0b1120;
  --color-surfaceText: #e5e7eb;
  --color-primary: #22c55e;
}

[data-theme="sunset"] {
  --color-surface: #fff7ed;
  --color-surfaceText: #7c2d12;
  --color-primary: #f97316;
}
```

```html
<div data-theme="dark" class="card">
  <h2>Dark Theme Card</h2>
  <button class="btn">Confirm</button>
</div>

<div data-theme="sunset" class="card">
  <h2>Sunset Theme Card</h2>
  <button class="btn">Book now</button>
</div>
```

```css
.card {
  background: var(--color-surface);
  color: var(--color-surfaceText);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
}
```
