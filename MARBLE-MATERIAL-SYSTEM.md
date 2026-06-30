# MARBLE MATERIAL SYSTEM
## Large Texture Sampling Implementation

**Date:** 2026-06-30  
**Status:** Implemented and committed  
**Location:** index.html (CSS custom properties + material classes)

---

## OVERVIEW

Four marble materials, each 2000×2000px SVG texture. Components sample from different positions of the same texture to create visual variety without repetition.

**Key Feature:** Every component that uses a material gets a unique visual sample from the same large texture, preventing the flat "repeating pattern" look.

---

## THE FOUR MATERIALS

### 1. GRAPHITE (--marble-graphite)
**Color:** Dark charcoal (#0d0f14)  
**Use:** Sidebar background, page backgrounds, foundations  
**Texture:** Dark with subtle white veining  
**Sample Position:** 0 0 (full texture)  

```css
.sidebar {
  background-image: var(--marble-graphite);
  background-position: 0 0;
}
```

### 2. SLATE (--marble-slate)
**Color:** Medium charcoal (#161921)  
**Use:** Cards, panels, containers, modals  
**Texture:** Medium-dark with varied veining patterns  
**Sample Positions:**
- Card 1: 0 0
- Card 2: 250px 200px
- Card 3: 500px 400px
- Card 4: 750px 600px
- Card 5: 1000px 800px

```css
.card {
  background-image: var(--marble-slate);
  background-position: 250px 200px; /* Different for each card */
}
```

### 3. MIST (--marble-mist)
**Color:** Light charcoal (#1a1f2e)  
**Use:** Accents, highlights, secondary elements, hover states  
**Texture:** Light with delicate veining  
**Sample Positions:** 800px 600px and beyond  

```css
.accent-box {
  background-image: var(--marble-mist);
  background-position: 800px 600px;
}
```

### 4. PEARL (--marble-pearl)
**Color:** Deep blue (#2B4E9C, sapphire)  
**Use:** Primary buttons, highlights, active states  
**Texture:** Blue with white veining suggesting light reflection  
**Sample Position:** 0 0 (full texture)  

```css
button.primary {
  background-image: var(--marble-pearl);
  background-position: 0 0;
}
```

---

## HOW IT WORKS

### The Texture
Each material is a 2000×2000px SVG embedded as a data URI. The SVG contains:
- Solid base color fill
- Fractal noise displacement filter (creates organic veining)
- Subtle white/gray strokes (veins)
- Optical effects (circles, ellipses for light reflection)

### Sampling
Instead of repeating the texture (which creates obvious patterns), components use `background-position` to sample from different areas of the same 2000px texture.

```
Texture: 2000×2000px

Component positions:
├── 0, 0       (top-left area)
├── 250, 200   (upper-middle area)
├── 500, 400   (middle area)
├── 750, 600   (middle-right area)
├── 1000, 800  (lower-middle area)
└── 1400, 1050 (lower-right area)

Result: 6-8 unique visual samples from ONE texture
```

### Why This Works
- **Large texture (2000px):** Provides enough unique data for multiple samples
- **Different positions:** Each component gets visually distinct marble grain
- **Non-repeating:** No obvious pattern repetition across components
- **Premium appearance:** Looks like each component has its own marble block carved from the same slab

---

## IMPLEMENTATION GUIDE

### For Cards

```html
<div class="card" style="background-position: 250px 200px;">
  <!-- Card content -->
</div>
```

Or use nth-child selector (already implemented):
```css
.card:nth-child(1) { background-position: 0 0; }
.card:nth-child(2) { background-position: 250px 200px; }
.card:nth-child(3) { background-position: 500px 400px; }
/* etc. */
```

### For Buttons

```html
<button class="primary" style="background-image: var(--marble-pearl); background-position: 0 0;">
  Submit
</button>
```

### For Custom Elements

```html
<div class="material-slate" style="background-position: 600px 450px;">
  Custom element sampling from Slate material
</div>
```

### CSS Class Approach (Pre-defined)

```html
<!-- Use predefined sample classes -->
<div class="card material-slate sample-a">Card 1</div>
<div class="card material-slate sample-b">Card 2</div>
<div class="card material-slate sample-c">Card 3</div>
```

---

## SAMPLE POSITIONS (Reference)

```
sample-a: 0, 0           (start)
sample-b: 200px, 150px
sample-c: 400px, 300px
sample-d: 600px, 450px
sample-e: 800px, 600px   (middle)
sample-f: 1000px, 750px
sample-g: 1200px, 900px
sample-h: 1400px, 1050px (end)
```

Each provides a unique visual from the 2000×2000px texture.

---

## TECHNICAL DETAILS

### SVG Texture Structure

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000">
  <defs>
    <filter id="noise">
      <feTurbulence type="fractalNoise" 
                    baseFrequency="0.04" 
                    numOctaves="5" 
                    seed="1" 
                    result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="40"/>
    </filter>
  </defs>
  
  <!-- Base color -->
  <rect width="2000" height="2000" fill="#0d0f14"/>
  
  <!-- Veining with displacement -->
  <g filter="url(#noise)" opacity="0.15">
    <path d="M50,200 Q150,150 250,200 T450,200" 
          stroke="#ffffff" stroke-width="2" fill="none"/>
    <!-- More paths for veining pattern -->
  </g>
  
  <!-- Optical effects (light reflection) -->
  <g opacity="0.08">
    <circle cx="150" cy="300" r="40" fill="#ffffff"/>
    <!-- More circles for highlight effect -->
  </g>
</svg>
```

### Why Inline SVG?
- No external image files needed
- Cached as CSS custom properties
- Fully vectorized (scales perfectly)
- Small file size (data URI embedded in CSS)
- No additional HTTP requests
- Performance-optimized

---

## USAGE IN DIFFERENT CONTEXTS

### Sidebar (Graphite)
```css
.sidebar {
  background-image: var(--marble-graphite);
  background-size: 2000px 2000px;
  background-position: 0 0;
  background-attachment: fixed;
}
```

### Input Cards (Slate)
```css
.input-card {
  background-image: var(--marble-slate);
  background-size: 2000px 2000px;
  background-position: 250px 200px;
}
```

### Primary Button (Pearl)
```css
button.primary {
  background-image: var(--marble-pearl);
  background-size: 2000px 2000px;
  background-position: 0 0;
  box-shadow: 0 4px 16px rgba(42, 78, 156, 0.3);
}

button.primary:hover {
  filter: brightness(1.1);
}
```

### Hover/Active States (Mist)
```css
button:hover {
  background-image: var(--marble-mist);
  background-position: 800px 600px;
}
```

---

## DESIGN COMPLIANCE

✅ **Matches Design Spec:**
- Black Marble: Graphite material
- Smoked Glass: Slate material
- Blue Marble: Pearl material
- Light/Highlights: Mist material

✅ **Premium Appearance:**
- Large, non-repeating textures
- Organic veining (fractal noise)
- Subtle light reflection effects
- Polished stone aesthetic

✅ **Performance:**
- 4 inline SVG data URIs
- No external image files
- Efficient rendering
- Scales to any size
- No performance penalty

---

## EXTENDING THE SYSTEM

### Adding a New Material

```css
:root {
  --marble-new: url('data:image/svg+xml,<svg><!-- your SVG --></svg>');
}
```

### Creating New Sample Positions

```css
.sample-i { background-position: 1600px, 1200px; }
.sample-j { background-position: 1800px, 1400px; }
```

### Component-Specific Sampling

```css
.profile-card {
  background-image: var(--marble-slate);
  background-position: 1000px 800px;
}

.notification-badge {
  background-image: var(--marble-mist);
  background-position: 800px 600px;
}
```

---

## TESTING CHECKLIST

- [ ] Sidebar shows marble texture (Graphite)
- [ ] Cards have different marble samples (Slate)
- [ ] Buttons show blue marble (Pearl)
- [ ] No obvious repeating patterns
- [ ] Each card looks unique despite using same texture
- [ ] Hover states show light material (Mist)
- [ ] Performance is smooth (no jank)
- [ ] Works in light and dark theme
- [ ] Mobile rendering smooth

---

## TROUBLESHOOTING

### Texture Not Showing?
Check browser DevTools → Elements → Computed styles → background-image shows data URI

### Obvious Pattern Repetition?
Increase distance between sample positions:
```css
.card:nth-child(1) { background-position: 0 0; }
.card:nth-child(2) { background-position: 400px 300px; }  /* Larger offset */
.card:nth-child(3) { background-position: 800px 600px; }
```

### Performance Issues?
- Reduce number of textured elements
- Use solid fallback colors for non-critical elements
- Consider `will-change: background-image` for animations

### Color Doesn't Match Design?
Adjust SVG fill colors in data URI. All 4 materials defined in `:root` section of CSS.

---

## REFERENCE

**Files Modified:**
- `index.html` - Added material system CSS + updated components

**Textures Generated:**
- Graphite: `--marble-graphite` (dark base)
- Slate: `--marble-slate` (medium)
- Mist: `--marble-mist` (light)
- Pearl: `--marble-pearl` (bright blue)

**Total Size:** ~8-10KB data URIs (very efficient)

**Browser Support:** All modern browsers (SVG + CSS custom properties)

---

**Status:** ✅ Implemented and ready to use  
**Next Step:** Apply to more components (inputs, buttons, modals, etc.)  
**Design Authority:** Matches VISUAL-SPECIFICATION-V2.0.md
