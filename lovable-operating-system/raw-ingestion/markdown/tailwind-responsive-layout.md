# Tailwind Responsive Layout

Use when you need to build a responsive page layout using Tailwind CSS in a Lovable project.

## Overview

Tailwind's utility-first approach makes responsive layouts fast to build. This skill covers common layout patterns: sidebar, grid, stack, and centered content — all using Tailwind breakpoint prefixes.

## Breakpoints

| Prefix | Min Width |
|--------|-----------|
| `sm`   | 640px     |
| `md`   | 768px     |
| `lg`   | 1024px    |
| `xl`   | 1280px    |

## Code Examples

### Responsive Sidebar Layout

```tsx
<div className="flex flex-col md:flex-row min-h-screen">
  <aside className="w-full md:w-64 bg-gray-900 text-white p-4">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 p-6">
    {/* Main content */}
  </main>
</div>
```

### Responsive Card Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <div key={item.id} className="rounded-xl border p-4 shadow-sm">
      {item.title}
    </div>
  ))}
</div>
```

### Centered Content

```tsx
<div className="max-w-2xl mx-auto px-4 py-8">
  {/* Centered content */}
</div>
```

### Stack with Gap

```tsx
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Notes

- Always design mobile-first — default styles are for small screens, breakpoint prefixes add larger screen overrides
- Use `gap-*` instead of margin for spacing between flex/grid children
- `min-h-screen` on the root container prevents short-page layout collapse
