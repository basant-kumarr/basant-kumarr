# Basant Kumar portfolio, dashboard edition

Static site, no build step, no external requests.

Hero, About, Skills, Experience and Education use crops of the supplied
rendered artwork (`assets/img/*.webp`, only regions without baked-in text),
with all text as real HTML on top. Project cards and the contact globe are
rendered live on a 2D canvas (real 3D projection, no WebGL).

- `index.html` all content
- `assets/css/style.css` layout and theme
- `assets/js/engine.js` shared 3D/render engine (pauses offscreen, reduced motion, adaptive frame rate)
- `assets/js/scenes-projects.js` BeBeyond figure, Ireland map, fraud shield, forecast
- `assets/js/scenes-sections.js` glint overlay on the artwork, Contact globe
- `assets/img/` artwork crops (WebP)
- `assets/fonts/` self-hosted fonts (SIL Open Font License)

Deploy: drag this folder onto https://app.netlify.com/drop, or onto the
Deploys tab of an existing Netlify site.
