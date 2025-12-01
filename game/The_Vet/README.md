# The Vet — Static Promo Framework

This folder contains a static, single-page experience inspired by cinematic AAA launch sites. It is intentionally light on assets so you can plug real art, videos, and copy later.

## Layout Overview

1. **Neon Header & Navigation** – sticky bar with CTA, adaptive to scroll.
2. **Hero Section** – full viewport with looping background video/image, layered glitches, call-to-action buttons.
3. **Feature Pillars** – three-card grid that animates into view with JS intersection observers.
4. **Narrative Split** – text + media column layout for lore beats.
5. **World Map Callout** – stylized SVG overlay with hoverable hotspots.
6. **Timeline / Launch Roadmap** – horizontally scrollable milestones with keyboard support.
7. **Media Showcase** – responsive gallery with lightbox placeholder.
8. **Community CTA** – newsletter + social badges.
9. **Footer** – legal + quick links.

## Tech Notes

- Built with plain HTML/CSS/JS, no bundler or framework.
- Styling uses CSS custom properties for quick re-theming.
- JavaScript keeps state in `data-*` attributes to simplify content swaps.
- Each interactive block is isolated (hero player, features reveal, timeline slider, map hotspots).

## Getting Started

Serve the site from the repo root (so absolute paths such as `/style.css` continue to work) or launch a static server inside `game/The_Vet`.

```powershell
cd C:\Users\72823\Desktop\Web\Ceasiumz.github.io\game\The_Vet
python -m http.server 8000
```

Visit `http://localhost:9000` and start customizing copy, art, or mechanics.
