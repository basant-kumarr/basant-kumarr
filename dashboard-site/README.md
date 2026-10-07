# Basant Kumar portfolio, dashboard edition

Static site, no build step. Every section visual is rendered live in the
browser on a 2D canvas (real 3D projection, no WebGL, no external requests).

- `index.html` all content
- `assets/css/style.css` layout and theme
- `assets/js/engine.js` shared 3D/render engine (pauses offscreen, reduced motion, adaptive frame rate)
- `assets/js/scene-hero.js` neural brain and data globe
- `assets/js/scenes-projects.js` BeBeyond figure, Ireland map, fraud shield, forecast
- `assets/js/scenes-sections.js` About ring, Skills orbit, Experience city, Education path, Contact globe
- `assets/fonts/` self-hosted fonts (SIL Open Font License)

Portrait: save a square photo as `assets/img/portrait.jpg`. Until then the
About ring shows a BK monogram.

Deploy: drag this folder onto https://app.netlify.com/drop, or onto the
Deploys tab of an existing Netlify site.
