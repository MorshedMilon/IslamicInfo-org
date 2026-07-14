# Breakpoints Reference — islamicinfo.org

Based on CLAUDE.md v3.0 design system.

---

## Breakpoint Definitions

| Name | Width | Device Target | Priority |
|------|-------|--------------|----------|
| Mobile S | 375px | iPhone SE, small Android | Critical |
| Mobile L | 390px | iPhone 14/15 | Critical |
| Mobile XL | 430px | iPhone 14 Plus | High |
| Tablet P | 768px | iPad portrait, large phones | High |
| Tablet L | 1024px | iPad landscape, small laptops | Medium |
| Desktop | 1280px | Laptops | Critical |
| Desktop L | 1440px | Standard monitors | Critical |
| Wide | 1920px | Large monitors | Low |

---

## CSS Breakpoints in islamicinfo.org

```css
/* Mobile first — base styles target 375px+ */

/* Tablet */
@media (min-width: 768px) { }

/* Desktop small */
@media (min-width: 1024px) { }

/* Desktop standard */
@media (min-width: 1280px) { }

/* Desktop large */
@media (min-width: 1440px) { }
```

---

## Per-Breakpoint Layout Expectations

### Grid Columns
| Component | 375px | 768px | 1280px | 1440px |
|-----------|-------|-------|--------|--------|
| Hero | 1 col | 1 col | 2 col | 2 col |
| Feature cards | 1 col | 2 col | 3 col | 4 col |
| Article cards | 1 col | 2 col | 3 col | 3 col |
| Tool cards | 1 col | 2 col | 3 col | 3 col |
| Footer | 1 col | 2 col | 3 col | 3 col |
| Stats bar | 2 col | 4 col | 4 col | 4 col |

### Navigation
| Width | Behavior |
|-------|----------|
| < 768px | Hamburger menu, nav hidden until toggled |
| 768px–1023px | Hamburger or compact nav (per blueprint) |
| 1024px+ | Full horizontal nav, all 10 items visible |

### Typography Scale
| Element | 375px | 768px | 1280px+ |
|---------|-------|-------|---------|
| H1 hero | 2rem | 2.75rem | 3.5rem |
| H2 section | 1.5rem | 1.875rem | 2.25rem |
| H3 card | 1.125rem | 1.25rem | 1.375rem |
| Body | 1rem | 1rem | 1rem |
| Small | 0.875rem | 0.875rem | 0.875rem |

---

## Overflow Rules

- `overflow-x: hidden` on `body` — no horizontal scroll at any breakpoint
- Container max-width: `1200px` centered with `margin: 0 auto`
- Side padding: `1rem` mobile → `1.5rem` tablet → `2rem` desktop

---

## Touch Target Minimums (Mobile)

- Buttons: min `44 × 44px`
- Nav links: min `44px` height
- Card CTAs: min `44px` height
- Icons with click: min `44 × 44px` tap area
