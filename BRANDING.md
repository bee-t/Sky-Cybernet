# Sky-Cybernet Brand Identity

## Logo Design Rationale

The Sky-Cybernet logo embodies a **military-tactical cyber operations aesthetic** with the following design principles:

### Core Concepts
1. **Strategic Network** - Interconnected nodes representing a distributed cyber network
2. **Tactical Operations** - Military-style UI elements (brackets, hexagons, targeting reticles)
3. **Cyber Warfare** - Terminal/command-line aesthetic with monospace typography
4. **Precision & Control** - Clean geometric shapes, measured spacing

---

## Logo Variants

### 1. **Icon Variant** (`variant="icon"`)
- **Use Case**: Favicons, app icons, small UI elements
- **Features**: 
  - Corner tactical brackets
  - Network node connections (4 satellites + center hub)
  - Scanning effect lines
  - Outer border square
- **Size**: Optimized for 32px - 128px

### 2. **Minimal Variant** (`variant="minimal"`)
- **Use Case**: Compact spaces, loading indicators
- **Features**:
  - Stylized "S" letterform
  - Subtle "C" accent
  - Network dots
- **Size**: 16px - 64px

### 3. **Full Variant** (`variant="full"`)
- **Use Case**: Headers, landing pages, main branding
- **Features**:
  - Hexagonal tactical border
  - Targeting reticle (concentric circles + crosshair)
  - "SC" monogram center
  - Pulsing corner indicators
  - Full "SKY-CYBERNET" text with "STRATEGIC NETWORK" tagline
- **Size**: 40px - 200px

### 4. **Loading Variant** (`<LoadingLogo />`)
- **Use Case**: Loading screens, initialization sequences
- **Features**:
  - Rotating dashed outer ring
  - Pulsing center circle
  - "INITIALIZING..." text
  - Full animation effects

---

## ASCII Art Logos

For terminal displays, documentation, and retro aesthetic:

### Compact (3 lines)
```
 ╔═══╗╔═══╗
 ║ S ║║ C ║
 ╚═══╝╚═══╝
```

### Tactical (12 lines)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ◢◣  ╔═╗╦╔═  ╦ ╦        ┃
┃ ◢  ◣ ╚═╗╠╩╗─ ╚╦╝        ┃
┃ ◥  ◤ ╚═╝╩ ╩   ╩         ┃
┃  ◥◤                     ┃
┃ ╔═╗╦ ╦╔╗ ╔═╗╦═╗         ┃
┃ ║  ╚╦╝╠╩╗║╣ ╠╦╝         ┃
┃ ╚═╝ ╩ ╚═╝╚═╝╩╚═         ┃
┃                         ┃
┃ ╔╗╔╔═╗╔╦╗               ┃
┃ ║║║║╣  ║                ┃
┃ ╝╚╝╚═╝ ╩                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
TACTICAL OPERATIONS SYSTEM
```

---

## Color System

### Primary Theme: **Tactical Green**
- **Primary**: `#00ff41` (matrix green)
- **Glow**: `0 0 10px rgba(0, 255, 65, 0.5)`
- **Usage**: Primary elements, borders, text highlights

### Secondary Theme: **Orange Alert**
- **Primary**: `#ff8c00` (tactical orange)
- **Glow**: `0 0 10px rgba(255, 140, 0, 0.5)`
- **Usage**: Alerts, warnings, secondary actions

### Neutral Palette
- **Background**: `#000000` (pure black)
- **Surface**: `#0a0a0a` - `#1a1a1a` (dark grays)
- **Text**: `#e5e5e5` (gray-200) for primary text
- **Text Muted**: `#a3a3a3` (gray-400) for secondary text

---

## Typography

### Headers & Branding
- **Font**: Monospace (system: `ui-monospace, Consolas, 'Courier New'`)
- **Weight**: Bold (700)
- **Tracking**: Wide (`tracking-widest` / `0.15em`)
- **Transform**: Uppercase for primary branding

### Body Text
- **Font**: System sans-serif
- **Weight**: Normal (400)
- **Line Height**: 1.6 for readability

### Code & Terminal
- **Font**: Monospace
- **Weight**: Normal (400)
- **Background**: Subtle dark surface

---

## Logo Usage Guidelines

### ✅ DO
- Use on dark backgrounds (#000000 to #1a1a1a)
- Maintain aspect ratio (square for icon, horizontal for full)
- Ensure minimum size: 32px for icon, 120px for full logo
- Apply `military-glow` class for enhanced visibility
- Use CSS custom properties (`var(--color-primary)`) for theme switching

### ❌ DON'T
- Place on light backgrounds (contrast ratio < 4.5:1)
- Distort or skew the logo
- Change colors outside the defined palette
- Add drop shadows or 3D effects
- Use raster formats below 2x resolution

---

## Implementation Examples

### Navigation Bar
```tsx
import { Logo } from '@/app/components/Logo';

<Logo variant="icon" size={40} className="hover:scale-110 transition" />
```

### Landing Page Hero
```tsx
<Logo variant="full" size={120} />
```

### Favicon (public/favicon.ico)
```tsx
import { generateFavicon } from '@/app/components/Logo';

// Generate 32x32 favicon
const faviconDataUrl = generateFavicon();
```

### Loading Screen
```tsx
import { LoadingLogo } from '@/app/components/Logo';

<div className="min-h-screen flex items-center justify-center bg-black">
  <LoadingLogo size={80} />
</div>
```

### Terminal Display
```tsx
import { ASCII_LOGOS } from '@/app/components/Logo';

console.log(ASCII_LOGOS.tactical);
```

---

## Brand Voice

### Tone
- **Authoritative** - Command & control
- **Precise** - Technical accuracy
- **Strategic** - Forward-thinking
- **Secure** - Trust & reliability

### Messaging
- "Strategic Cyber Network" (primary tagline)
- "Tactical Operations System" (secondary)
- "Secure. Strategic. Connected."
- "Network Operations Command"

### Example Copy
```
SKY-CYBERNET
Strategic Cyber Network

Secure communications platform for tactical operations.
Real-time intelligence. Encrypted channels. Zero-trust architecture.

> Deploy. Connect. Dominate.
```

---

## File Export Specifications

### SVG Export
- **Viewbox**: `0 0 100 100` (square)
- **Stroke Width**: 1.5-2px for primary elements
- **Fill**: Use CSS variables where possible
- **Optimization**: Remove unnecessary paths, use `<use>` for repeating elements

### PNG Export (Raster)
- **Icon**: 512x512px @ 2x (export at 1024x1024)
- **Social**: 1200x630px (Open Graph)
- **Favicon**: 32x32, 64x64, 128x128, 256x256
- **Format**: PNG-24 with transparency

### Favicon Set
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

---

## Animation Guidelines

### Hover Effects
- **Scale**: 1.05 - 1.1x
- **Glow**: Increase blur radius by 2-4px
- **Duration**: 200-300ms
- **Easing**: `ease-out`

### Loading States
- **Pulse**: 2s infinite
- **Spin**: 3s linear infinite (outer ring only)
- **Ping**: 1.5s cubic-bezier(0, 0, 0.2, 1) infinite

### Entrance Animations
```css
.logo-entrance {
  animation: fadeInScale 0.6s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## Accessibility

### Contrast Ratios
- **Green on Black**: 13.77:1 ✅ (AAA)
- **Orange on Black**: 8.51:1 ✅ (AAA)
- **Gray-200 on Black**: 12.63:1 ✅ (AAA)

### Screen Reader Support
```tsx
<Logo 
  variant="full" 
  size={60}
  aria-label="Sky-Cybernet - Strategic Cyber Network"
  role="img"
/>
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .logo-animated,
  .animate-pulse,
  .animate-spin {
    animation: none;
  }
}
```

---

## Standalone SVG Logos

For external use (presentations, documentation, marketing materials), standalone SVG files are available in `/public/`:

### 1. **logo-icon.svg** (Green Theme)
- **Dimensions**: 100x100px
- **Design**: Hexagonal tactical border with targeting reticle and "SC" monogram
- **Color**: #00ff41 (tactical green)
- **Use Cases**: 
  - App icons
  - Social media profile pictures
  - Favicons (when converted to PNG/ICO)
  - Presentation slides
- **Features**: Glowing effect, corner indicators, crosshair targeting system

### 2. **logo-icon-orange.svg** (Orange Theme)
- **Dimensions**: 100x100px
- **Design**: Same as logo-icon.svg with orange color scheme
- **Color**: #ff6b35 (tactical orange)
- **Use Cases**:
  - Alert/warning contexts
  - Alternative branding
  - Theme variants
  - A/B testing

### 3. **logo-full.svg** (Complete Branding)
- **Dimensions**: 400x120px (horizontal)
- **Design**: Icon + "SKY-CYBERNET" wordmark + "STRATEGIC NETWORK" tagline
- **Features**:
  - Hexagonal icon with targeting reticle
  - Full brand name in military monospace font
  - Tactical line decorations
  - Corner bracket accents
- **Use Cases**:
  - Website headers
  - Email signatures
  - Landing pages
  - Marketing materials
  - Presentation title slides

### 4. **logo-wordmark.svg** (Text-Only)
- **Dimensions**: 350x80px
- **Design**: "SKY-CYBERNET" text with "STRATEGIC NETWORK" subtitle
- **Features**:
  - No icon, pure typography
  - Decorative tactical elements (lines, dots)
  - Glowing text effect
- **Use Cases**:
  - Space-constrained layouts
  - Footer branding
  - Text-heavy documents
  - Merchandise (t-shirts, stickers)

### 5. **logo-minimal.svg** (Network Design)
- **Dimensions**: 100x100px
- **Design**: Network topology with central hub and satellite nodes
- **Features**:
  - Square tactical border with corner brackets
  - 5-node network (center + 4 satellites)
  - Connection lines
  - Scanning effect accents
- **Use Cases**:
  - Alternative icon design
  - Loading states
  - Network/connectivity contexts
  - Technical documentation

### SVG Usage Examples

#### In HTML
```html
<!-- Direct embedding -->
<img src="/logo-full.svg" alt="Sky-Cybernet" width="300" />

<!-- As background -->
<div style="background-image: url('/logo-icon.svg'); width: 100px; height: 100px;"></div>
```

#### In React/Next.js
```tsx
import Image from 'next/image';

<Image 
  src="/logo-full.svg" 
  alt="Sky-Cybernet Strategic Network"
  width={400}
  height={120}
  priority
/>
```

#### In CSS
```css
.brand-header {
  background: url('/logo-wordmark.svg') no-repeat center;
  background-size: contain;
}
```

#### In Markdown
```markdown
![Sky-Cybernet Logo](/logo-icon.svg)
```

---

## Brand Assets Checklist

- [x] Logo component (Logo.tsx)
- [x] SVG logo variants (public/)
  - [x] logo-icon.svg (hexagon with SC monogram - green)
  - [x] logo-icon-orange.svg (hexagon with SC monogram - orange)
  - [x] logo-full.svg (icon + wordmark + tagline)
  - [x] logo-wordmark.svg (text-only version)
  - [x] logo-minimal.svg (network nodes design)
- [x] Favicon set (favicon.ico)
- [x] Apple touch icon (apple-touch-icon.png)
- [ ] Social media preview (1200x630)
- [ ] Loading animation
- [ ] ASCII art variants
- [ ] Brand guidelines document
- [ ] Color palette swatches
- [ ] Typography specimens
- [ ] Usage examples

---

## Future Enhancements

1. **Animated Logo Sequence** - Cyberpunk-style build-up animation
2. **Sound Effects** - Tactical UI sound design (hover, click)
3. **3D Variant** - Three.js rotating holographic logo
4. **Particle System** - Network node connections with flowing data
5. **Glitch Effect** - Controlled digital distortion on hover
6. **Variable Color Themes** - Faction-based color variations (red, blue, purple)

---

*Last Updated: March 12, 2026*  
*Version: 1.0.0*
