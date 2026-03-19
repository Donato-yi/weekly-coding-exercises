# Demo — CSS Variables Output

```css
:root {
  --color-primary: #3b82f6;
  --color-primaryText: #ffffff;
  --color-surface: #0f172a;
  --color-surfaceText: #e2e8f0;
  --color-border: #1f2937;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --type-fontFamily: Inter, ui-sans-serif, system-ui;
  --type-fontSize: 16px;
  --type-fontWeight: 500;
}
```

```html
<button class="btn">Primary</button>
```

```css
.btn {
  background: var(--color-primary);
  color: var(--color-primaryText);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-family: var(--type-fontFamily);
}
```
