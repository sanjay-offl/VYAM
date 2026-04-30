# DIVYAM Premium Purple Design System

A modern, premium web application UI inspired by a sophisticated purple color palette.

## Color Palette

### Primary Colors
- **Primary Light**: `#A56BFF` - Soft, approachable purple
- **Primary Dark**: `#6A3DFF` - Bold, action-oriented purple
- **Accent**: `#4B1FB8` - Deep violet for emphasis

### Secondary Colors
- **Secondary**: `#E9D8FF` - Light lavender for subtle backgrounds
- **Background**: `#F8F8FB` - Off-white with subtle purple tint
- **Surface**: `#FFFFFF` - Pure white for cards and containers

### Text Colors
- **Primary Text**: `#1A1A1A` - Dark grey for headings
- **Secondary Text**: `#666666` - Muted grey for body text
- **Muted**: `#999999` - Light grey for hints

### Status Colors
- **Success**: `#22C55E` - Green for positive actions
- **Error**: `#EF4444` - Red for errors and alerts
- **Warning**: `#FB923C` - Orange for warnings
- **Info**: `#A56BFF` - Purple for informational content

## Typography

### Font Family
- **System**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen`
- **Fallback**: `Helvetica Neue, sans-serif`

### Font Weights
- **Headings (H1-H6)**: 600 (Semibold)
- **Body**: 400 (Regular)
- **Buttons**: 500 (Medium)
- **Labels**: 500 (Medium)

### Font Sizes
- **H1**: 2.5rem (40px)
- **H2**: 2rem (32px)
- **H3**: 1.5rem (24px)
- **Body**: 0.95rem (15.2px)
- **Small**: 0.9rem (14.4px)
- **Caption**: 0.8rem (12.8px)

## Component Library

### Buttons

#### Primary Button (`.btn-primary`)
- Gradient background: #A56BFF → #6A3DFF
- White text
- Soft shadow on default, elevated on hover
- Hover: Translate up (-2px), enhanced shadow
- Active: Translate down (0px), reduced shadow

#### Secondary Button (`.btn-secondary`)
- Light lavender background
- Deep violet text
- Subtle border: rgba(165, 107, 255, 0.3)
- Hover: Border opacity increases, background slightly darker

#### Outline Button (`.btn-outline`)
- Transparent background
- Purple text and border
- Light purple hover background

#### Button Sizes
- **Small**: 0.5rem padding, 0.875rem font
- **Default**: 0.75rem padding, 0.95rem font
- **Large**: 1rem padding, 1.05rem font

### Cards

#### Standard Card (`.card`)
- White background
- Light purple border: rgba(165, 107, 255, 0.15)
- Soft shadow: 0 2px 8px rgba(0, 0, 0, 0.04)
- Rounded: 16px
- Hover: Elevated shadow, translate up (-2px)

#### Glow Card (`.card-glow`)
- Semi-transparent lavender background
- More prominent border: rgba(165, 107, 255, 0.4)
- Soft glow effect with inset highlight
- Perfect for featured content

### Forms

#### Input Fields
- White background
- Subtle purple border: rgba(165, 107, 255, 0.2)
- Rounded: 12px
- Focus: Purple border, purple glow shadow
- Placeholder: Muted grey, 60% opacity

#### Labels
- Dark grey text
- 500 weight (medium)
- 0.9rem size
- 0.5rem margin-bottom

### Layout Components

#### Grid Layouts
- **grid-2**: 300px minimum, 2 columns on desktop
- **grid-3**: 250px minimum, 3 columns on desktop
- **grid-4**: 220px minimum, 4 columns on desktop
- **Responsive**: Single column on mobile (≤768px)

#### Stat Box
- Center-aligned
- Large gradient text for numbers
- Muted label below
- Purple-tinted border and background

### Badges
- Small rectangular shape
- Lavender background with deep violet text
- Rounded: 8px
- Compact padding: 0.375rem 0.875rem

### Alerts
- Left border: 4px
- Subtle background (5% opacity)
- Border color matches alert type
- Flex layout with icon support

## Spacing System

- **Compact**: 0.5rem (8px)
- **Small**: 0.75rem (12px)
- **Base**: 1rem (16px)
- **Medium**: 1.25rem (20px)
- **Large**: 1.5rem (24px)
- **XLarge**: 2rem (32px)

## Border Radius

- **Button**: 12px
- **Card**: 16px
- **Input**: 12px
- **Small**: 8px
- **Full**: 9999px (for circles/pills)

## Shadows

### Subtle Shadow
```
0 1px 2px rgba(0, 0, 0, 0.04)
```

### Standard Shadow
```
0 4px 12px rgba(0, 0, 0, 0.06)
```

### Elevated Shadow
```
0 8px 24px rgba(0, 0, 0, 0.08)
```

### Purple Glow
```
0 0 20px rgba(165, 107, 255, 0.15)
```

## Interactions

### Transitions
- Default: 0.2s ease
- Extended: 0.3s ease
- Timing function: `ease` (natural motion)

### Hover Effects
- **Buttons**: Scale up, shadow intensifies
- **Cards**: Translate up, shadow enhanced
- **Links**: Color changes to accent purple

### Focus States
- Focus ring: 2px solid purple
- Outline offset: 2px
- High contrast for accessibility

### Animations
- **Fade In**: 0.3s ease, Y-axis translation
- **Slide In**: 0.3s ease, X-axis translation
- **Spin**: 0.8s linear infinite (for loaders)

## Best Practices

### Accessibility
- Use `focus:outline-none` with custom focus styles
- Maintain 4.5:1 contrast ratio for text
- Provide clear, descriptive labels
- Use ARIA labels where needed

### Consistency
- Use predefined spacing scale
- Stick to the color palette
- Use system fonts for better performance
- Apply consistent corner radius

### Performance
- Use CSS custom properties for theming
- Minimize shadow depth for better performance
- Use transitions instead of animations where possible
- Lazy load images where applicable

### Mobile Optimization
- Single column grid layouts on mobile
- Touch-friendly button sizes (min 44px height)
- Readable text sizes (min 16px for inputs)
- Full-width cards and inputs on mobile

## Usage Examples

### Creating a Primary Button
```jsx
<button className="btn btn-primary">
  Click Me
</button>
```

### Creating a Card
```jsx
<div className="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>
```

### Using Grid Layout
```jsx
<div className="grid grid-3">
  <div className="card">Item 1</div>
  <div className="card">Item 2</div>
  <div className="card">Item 3</div>
</div>
```

### Creating an Alert
```jsx
<div className="alert alert-success">
  Success message here
</div>
```

## Color Variables (CSS)

```css
--color-bg: 248 248 251;              /* #F8F8FB */
--color-surface: 255 255 255;         /* #FFFFFF */
--color-text: 26 26 26;               /* #1A1A1A */
--color-muted: 102 102 102;           /* #666666 */
--color-primary-light: 165 107 255;   /* #A56BFF */
--color-primary-dark: 106 61 255;     /* #6A3DFF */
--color-secondary: 233 216 255;       /* #E9D8FF */
--color-accent: 75 31 184;            /* #4B1FB8 */
--color-danger: 239 68 68;            /* #EF4444 */
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android 90+

---

**Last Updated**: April 30, 2026
**Version**: 1.0.0
