# Inforens Loan Tools — Design System Master

## Brand Foundation

**Primary Color:** #E1622F (Inforens Orange) — Trust, Energy, Action  
**Typography:** Poppins (400, 500, 600, 700) | Play (700) for headings  
**Border Radius:** 6px (buttons, cards, inputs)  
**Button Padding:** 8px 16px  
**Transitions:** 0.15s cubic-bezier(0.4, 0, 0.2, 1)  

---

## Color Palette (Adapted for Inforens Brand)

### Primary Color System
- **Primary:** #E1622F (Inforens Orange)
- **Primary Dark:** #C74C1A (Hover/Active state)
- **Primary Light:** #F4A78D (Disabled/Light backgrounds)

### Supporting Colors
- **Secondary:** #1F2937 (Dark charcoal text/headings)
- **Accent:** #2563EB (Call-to-action, highlights)
- **Background:** #FFFFFF (Light mode primary)
- **Surface:** #F9FAFB (Card/section backgrounds)
- **Border:** #E5E7EB (Subtle dividers)
- **Muted:** #6B7280 (Secondary text)
- **Success:** #10B981 (Savings highlight)
- **Destructive:** #EF4444 (Error states)

### Text Colors
- **Foreground (Primary):** #0F172A (High contrast body text)
- **Foreground (Secondary):** #6B7280 (Muted descriptive text)
- **On Primary:** #FFFFFF (Text over orange backgrounds)

---

## Layout & Spacing

**Spacing Scale (8px base):**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 96px

**Breakpoints:**
- Mobile: 375px (default)
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px

**Container Widths:**
- Mobile: 100% - 16px padding
- Tablet: 768px max
- Desktop: 1200px max

---

## Typography

### Font Stack
```css
font-family: 'Poppins', 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Play', 'Poppins', sans-serif; /* For headings */
```

### Type Scale

| Type | Font | Weight | Size | Line Height | Usage |
|------|------|--------|------|-------------|-------|
| H1 | Play | 700 | 48px | 1.2 | Page headline |
| H2 | Play | 700 | 36px | 1.25 | Section titles |
| H3 | Play | 700 | 28px | 1.3 | Sub-sections |
| H4 | Poppins | 700 | 24px | 1.3 | Card titles |
| Body | Poppins | 400 | 16px | 1.6 | Long form text |
| Small | Poppins | 500 | 14px | 1.5 | Helper text, labels |
| Tiny | Poppins | 500 | 12px | 1.4 | Captions, badges |

### Color in Typography
- **Headings:** #1F2937 (dark charcoal)
- **Body Text:** #0F172A (near-black for contrast)
- **Secondary Text:** #6B7280 (muted for descriptions)
- **Links:** #2563EB (blue, underline on hover)

---

## Components

### Buttons

**Primary Button (CTA)**
```css
background: #E1622F;
color: #FFFFFF;
padding: 10px 20px;
border-radius: 6px;
font-weight: 600;
transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  background: #C74C1A;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(225, 98, 47, 0.3);
}

&:active {
  transform: scale(0.96);
}

&:focus {
  outline: 2px solid #E1622F;
  outline-offset: 2px;
}
```

**Secondary Button**
```css
background: #F9FAFB;
color: #1F2937;
border: 1px solid #E5E7EB;
padding: 10px 20px;
border-radius: 6px;
font-weight: 500;

&:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

&:focus {
  outline: 2px solid #E1622F;
  outline-offset: 2px;
}
```

### Input Fields

```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
border-radius: 6px;
padding: 12px 14px;
font-family: Poppins, sans-serif;
font-size: 16px;
transition: border-color 0.15s;

&:focus {
  outline: none;
  border-color: #E1622F;
  box-shadow: 0 0 0 3px rgba(225, 98, 47, 0.1);
}

&::placeholder {
  color: #9CA3AF;
}
```

### Cards

```css
background: #FFFFFF;
border-radius: 8px;
padding: 24px;
border: 1px solid #E5E7EB;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
transition: box-shadow 0.15s;

&:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### Bank Badge Pills

```css
/* PSU Banks */
.badge-psu {
  background: #DBEAFE;
  color: #1E40AF;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Private Banks */
.badge-private {
  background: #FECACA;
  color: #991B1B;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* NBFC */
.badge-nbfc {
  background: #DDD6FE;
  color: #4C1D95;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
```

---

## Animation & Motion

### Entrance Animations

**Stagger List (Landing Page Cards)**
```javascript
// GSAP
gsap.from('.tool-card', {
  opacity: 0,
  y: 20,
  scale: 0.95,
  duration: 0.5,
  stagger: {
    each: 0.1,
    from: 'start'
  },
  ease: 'back.out(1.4)'
});
```

**Hero Section Fade-In**
```javascript
gsap.from('.hero-content', {
  opacity: 0,
  y: 30,
  duration: 0.6,
  ease: 'power2.out'
});

gsap.from('.hero-image', {
  opacity: 0,
  scale: 0.9,
  delay: 0.2,
  duration: 0.6,
  ease: 'power2.out'
});
```

### Interaction Animations

**Button Press (Scale)**
```javascript
// Click: scale 0.96 → 1.0 over 150ms
gsap.to(button, {
  scale: 0.96,
  duration: 0.05,
  yoyo: true,
  repeat: 1,
  ease: 'power2.inOut'
});
```

**Input Focus**
```javascript
// Subtle glow and border color shift
gsap.to(input, {
  boxShadow: '0 0 0 3px rgba(225, 98, 47, 0.1)',
  borderColor: '#E1622F',
  duration: 0.2
});
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Landing Page Structure

### Hero Section
- **Headline:** "Find the Perfect Education Loan for Your Future"
- **Subheadline:** "Compare interest rates across banks and save thousands. Or transfer your current loan to get better rates."
- **CTA Buttons:** "Start Calculator" | "Check Transfer Potential"
- **Visual:** Background gradient or illustration

### Tool Selection Cards (2-Column)

**Card 1: Education Loan Calculator**
- Icon: Calculator
- Title: "Education Loan Calculator"
- Description: "Compare interest rates across PSU banks, Private banks, and NBFCs. Find the best loan option for your needs."
- Benefits:
  - Compare 9+ banks instantly
  - See total interest over loan tenure
  - No credit check required
- CTA: "Compare Now →"

**Card 2: Balance Transfer Calculator**
- Icon: Transfer
- Title: "Education Loan Balance Transfer"
- Description: "Check if transferring your existing loan to another bank can reduce your EMI and total interest."
- Benefits:
  - Potential monthly savings
  - No prepayment penalties considered
  - Connect with our experts
- CTA: "Check Savings →"

### How It Works (Optional Section)
- Step 1: Enter your loan details
- Step 2: Compare across banks
- Step 3: Get connected with loan experts

### Trust Section
- "Trusted by 50,000+ students"
- Bank logos (SBI, ICICI, Axis, etc.)
- Testimonials (if available)

### FAQ Section
- Common questions about loan comparison
- Balance transfer benefits
- Eligibility criteria

---

## Responsive Behavior

### Mobile (< 768px)
- Hero: Single column, full-width
- Tool cards: Stack vertically (1 column)
- Navigation: Hamburger menu
- Input fields: Full width
- Comparison table: Horizontal scroll container

### Tablet (768px - 1024px)
- Hero: 2 columns if space permits
- Tool cards: 2 columns
- Comparison: Card-based layout (2 columns)

### Desktop (> 1024px)
- Hero: 2 columns, balanced
- Tool cards: 2 columns with ample spacing
- Comparison: Table + Cards + Chart views
- Sidebar: Optional for navigation

---

## Accessibility Checklist

- [ ] Text contrast: 4.5:1 for body text minimum
- [ ] Focus indicators: Visible 2px outline on all interactive elements
- [ ] Labels: Associated with form inputs via `<label for="id">`
- [ ] Headings: Semantic hierarchy (h1 > h2 > h3)
- [ ] Alt text: All images have descriptive alt text
- [ ] ARIA labels: Form fields and custom controls labeled
- [ ] Keyboard navigation: Tab through all interactive elements
- [ ] Screen reader: Tested with NVDA/JAWS
- [ ] Color: Not sole indicator of information (use labels + icons)
- [ ] Reduced motion: Animations respect prefers-reduced-motion

---

## Performance Targets

- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Time to Interactive:** < 3.5s

### Optimization Strategies

1. **Images:** Use WebP with JPEG fallback, lazy load below fold
2. **Fonts:** Google Fonts with `display=swap`, load weights 400, 500, 600, 700 only
3. **Animations:** Use CSS transforms and opacity only (no width/height)
4. **Code Splitting:** Separate landing page from calculator pages
5. **Hydration:** Server-render static sections, hydrate interactivity

---

## Implementation Notes

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Custom CSS variables
- **Animations:** GSAP 3.12+ (gsap.min.js)
- **Icons:** Heroicons or Lucide SVG icons
- **Charts:** Recharts for bank comparison visualizations
- **State:** React Context for calculator state
- **Forms:** React Hook Form + Express Validator (backend)

---

## Color Usage by Component

| Component | Primary Use | Secondary Use |
|-----------|-------------|---------------|
| Primary CTA Button | #E1622F | #C74C1A (hover) |
| Secondary Button | #F9FAFB | #E5E7EB (border) |
| Bank Badges | Role-based colors | Text contrast maintained |
| Input Focus | #E1622F (ring) | #E5E7EB (border) |
| Success Highlight | #10B981 | Savings display |
| Error State | #EF4444 | Validation messages |
| Links | #2563EB | #1E40AF (hover) |
| Disabled State | #9CA3AF (text) | #F3F4F6 (bg) |

---

## Next Steps

1. ✅ Design System Created
2. → Build Landing Page Component
3. → Build Education Loan Calculator
4. → Build Balance Transfer Calculator
5. → Integrate Contact Form
6. → Test Responsiveness & Accessibility

