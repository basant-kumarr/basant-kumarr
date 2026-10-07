# Basant Kumar portfolio, dashboard edition

Static site, no build step, no external requests.

Every section uses crops of the supplied rendered artwork
(`assets/img/*.webp`), with all text as real HTML. Crops avoid baked-in
figures; the fraud card's brand mark and printed name were painted out.
The sales forecast chart is drawn live on a 2D canvas.

- `index.html` all content
- `assets/css/style.css` layout and theme
- `assets/js/engine.js` shared 3D/render engine (pauses offscreen, reduced motion, adaptive frame rate)
- `assets/js/scenes-projects.js` live sales forecast chart
- `assets/js/scenes-sections.js` glint overlay on the artwork
- `assets/img/` artwork crops (WebP)
- `assets/fonts/` self-hosted fonts (SIL Open Font License)

Deploy: drag this folder onto https://app.netlify.com/drop, or onto the
Deploys tab of an existing Netlify site.
