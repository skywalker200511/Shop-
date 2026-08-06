---
name: Nexus Command
colors:
  surface: '#1f0f10'
  surface-dim: '#1f0f10'
  surface-bright: '#483435'
  surface-container-lowest: '#190a0b'
  surface-container-low: '#281718'
  surface-container: '#2c1b1c'
  surface-container-high: '#382526'
  surface-container-highest: '#443030'
  on-surface: '#fbdbdb'
  on-surface-variant: '#e5bdbe'
  inverse-surface: '#fbdbdb'
  inverse-on-surface: '#3f2b2c'
  outline: '#ac8889'
  outline-variant: '#5c3f40'
  surface-tint: '#ffb3b6'
  primary: '#ffb3b6'
  on-primary: '#68001a'
  primary-container: '#e11d48'
  on-primary-container: '#fffaf9'
  inverse-primary: '#be0037'
  secondary: '#b6c4ff'
  on-secondary: '#05297a'
  secondary-container: '#264191'
  on-secondary-container: '#9db2ff'
  tertiary: '#74d8bd'
  on-tertiary: '#00382d'
  tertiary-container: '#00836c'
  on-tertiary-container: '#eefff7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920028'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b6c4ff'
  on-secondary-fixed: '#00164e'
  on-secondary-fixed-variant: '#264191'
  tertiary-fixed: '#90f5d9'
  tertiary-fixed-dim: '#74d8bd'
  on-tertiary-fixed: '#002019'
  on-tertiary-fixed-variant: '#005142'
  background: '#1f0f10'
  on-background: '#fbdbdb'
  surface-variant: '#443030'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is engineered for high-stakes enterprise AI environments where precision and immediate cognitive processing are paramount. The aesthetic is "Tactical Intelligence"—a fusion of high-end minimalism and futuristic command-center interfaces. 

The style utilizes a deep-space background to eliminate visual noise, allowing data and AI insights to surface with maximum clarity. It leverages subtle glassmorphism and inner glows to create a sense of technological depth without sacrificing the professional rigor required for enterprise SaaS. The emotional response is one of absolute control, sophistication, and cutting-edge capability.

## Colors
The palette is dominated by deep blacks and charcoals to establish a premium, "lights-out" operations environment. 

- **Primary Accent (Crimson Red):** Used with extreme restraint (approx. 2% of the UI). It marks active states, critical alerts, and primary calls to action.
- **Secondary Accent (Dark Blue):** Reserved exclusively for AI-driven features, data visualizations, and analytical processing indicators.
- **Neutral Scale:** High-contrast text ensures legibility against the dark surfaces. Borders are kept tight and subtle to define structure without clutter.

## Typography
This design system uses a dual-font strategy. **Geist** provides a clean, technical, yet highly legible sans-serif for the majority of the interface, ensuring the UI feels modern and professional. **JetBrains Mono** is utilized for labels, metadata, and AI-generated data points to reinforce the technical, "command" nature of the product.

Headlines should utilize tighter letter-spacing to maintain a dense, authoritative feel. Body text should remain generous in line-height to ensure comfort during long sessions of data analysis.

## Layout & Spacing
The layout follows a strict 12-column grid for desktop views with a 24px gutter. The philosophy is "Generous Breathing Room"—high-density data is balanced by significant negative space to prevent user fatigue.

- **Desktop:** 12 columns, 32px side margins.
- **Tablet:** 8 columns, 24px side margins.
- **Mobile:** 4 columns, 16px side margins.

Use spacing to group related AI insights. For instance, a 16px (sm) gap identifies sub-elements within a card, while 40px (lg) separates major dashboard modules.

## Elevation & Depth
This design system avoids traditional drop shadows in favor of **Tonal Layering** and **Luminosity**. 

1.  **Surfaces:** Use `#171717` (Surface Cards) against `#090909` (Primary Background) to create natural hierarchy.
2.  **Inner Glow:** Interactive elements and cards feature a subtle 1px inner stroke (opacity 10% white) on the top and left edges to simulate a light source from above.
3.  **Glassmorphism:** Overlays and dropdown menus should use a background blur (20px) with a semi-transparent `#111111` fill (80% opacity) to maintain context.
4.  **Interactive Glow:** On hover, primary interactive elements emit a soft, diffused Crimson Red outer glow (blur: 15px, spread: -5px) to indicate focus.

## Shapes
Shapes are defined by a uniform **10px corner radius** (Soft/Custom) for all containers, cards, and buttons. This specific radius provides a balance between the aggressive sharp edges of traditional enterprise software and the overly rounded consumer trends.

Borders must remain a consistent 1px width. Avoid double-borders or heavy strokes to maintain the technical precision of the system.

## Components

### Buttons
- **Primary:** Solid Crimson Red (#E11D48) with white text. On hover, apply a red outer glow.
- **Secondary:** Transparent background with a 1px border (#2A2A2A). On hover, border changes to Crimson Red.
- **AI-Action:** Solid Dark Blue (#1E3A8A) with a subtle pulse animation on the icon.

### Navigation
- **Active State:** Vertical Crimson Red bar (4px width) on the left edge of the navigation item.
- **Background:** Navigation sidebar uses Secondary Background (#111111).

### Cards
- **Structure:** Surface Card (#171717) with 1px border (#2A2A2A).
- **Header:** Include a JetBrains Mono label for the section title.
- **Interaction:** Entire card should have a 1px Crimson Red border transition on hover.

### Input Fields
- **Default:** Background #090909, border #2A2A2A. 
- **Focus:** Border becomes Crimson Red with a 2px inner glow.
- **Typography:** Placeholder text in Muted (#707070).

### Chips & Badges
- **Status Badges:** Use JetBrains Mono. Small, all-caps.
- **AI-Badge:** Dark Blue background with a "Spark" icon to denote machine-generated content.

### Data Lists
- **Row Styling:** Subtle 1px bottom border. Alternate row colors are not permitted; use hover states (Surface Card #171717) to highlight rows.