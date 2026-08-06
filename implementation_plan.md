# Implementation Plan: Ultra-Dynamic "Lando Norris" Style Aesthetics

The goal is to elevate the CRM from a standard dashboard to a highly dynamic, kinetic, and immersive experience inspired by ultra-modern sites (like Lando Norris's personal site).

## User Review Required
> [!IMPORTANT]
> These changes will significantly alter the "feel" of the app. It will hide the default mouse cursor and replace it with a smooth animated circle, add a noise texture over the entire app, and make buttons/cards physically react to your mouse. Please confirm if this is the level of dynamism you are looking for!

## Proposed Changes

### Global Styles & Texture
We will add a subtle film-grain/noise texture overlay to the entire site to give it a premium, physical feel. We will also hide the default browser cursor.

#### [MODIFY] [index.css](file:///c:/Users/xsais/OneDrive/Desktop/Shop+/src/index.css)
- Add CSS for a fixed, pointer-events-none noise texture overlay.
- Hide default cursor (`cursor: none` on body).

### Custom Magnetic Cursor
A smooth, spring-physics-based custom cursor that follows the mouse and expands/snaps to clickable elements.

#### [NEW] [CustomCursor.tsx](file:///c:/Users/xsais/OneDrive/Desktop/Shop+/src/components/shared/CustomCursor.tsx)
- Use `framer-motion` to create a smooth following dot.
- Listen to hover states on links and buttons to expand the cursor.

#### [MODIFY] [App.tsx](file:///c:/Users/xsais/OneDrive/Desktop/Shop+/src/App.tsx)
- Inject `<CustomCursor />` and the noise texture overlay into the root layout.

### Magnetic / Kinetic Cards
Cards will not just hover, they will slightly tilt and pull towards the mouse cursor using 3D transforms.

#### [MODIFY] [GlassCard.tsx](file:///c:/Users/xsais/OneDrive/Desktop/Shop+/src/components/shared/GlassCard.tsx)
- Upgrade the standard `whileHover` to a custom `onMouseMove` handler that calculates the cursor's position relative to the card's center and applies a subtle 3D `rotateX` and `rotateY` effect using Framer Motion's `useMotionValue` and `useTransform`.

## Verification Plan
1. I will implement the changes.
2. I will ensure the dev server is running.
3. You will move your mouse around to feel the magnetic elements, the custom cursor, and the textured background.
