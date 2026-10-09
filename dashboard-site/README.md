# Basant Kumar portfolio, dashboard edition

Static site, no build step and no third-party requests. Drag this folder (or
the zip's contents) onto https://app.netlify.com/drop, or onto the Deploys
tab of an existing Netlify site.

## Structure

- `index.html` all content: Home, About, Projects, Skills, Experience,
  Education & Journey, Let's Build Something Meaningful
- `404.html` Netlify serves this for unknown paths
- `swarm-drone-coordination.html` project page for the Bachelor's swarm drone project, with the India Innovation Challenge 2018 qualifying-round certificate (`assets/img/iic-2018-*.jpg`)
- `basant-kumar-cv.pdf` two-page CV behind the Download CV buttons; built from `../cv/`
- `_headers` security headers (CSP allows only same-origin assets)
- `assets/css/style.css` layout and theme
- `assets/js/engine.js` shared canvas engine (pauses offscreen, honours
  reduced motion, drops to half rate on slow devices)
- `assets/js/scenes-projects.js` live sales forecast chart (illustrative)
- `assets/js/scenes-sections.js` glint overlay on the artwork
- `assets/js/main.js` menu, active section, reveal, scene mounting
- `assets/img/` artwork crops (WebP), with smaller variants for phones
- `assets/fonts/` self-hosted fonts (SIL Open Font License)

## Content rules

The artwork is visual storytelling only. Numbers and claims baked into the
artwork are not facts; the HTML text is. Project facts follow each
repository's README (team/client context, contribution, metrics). Disputed
recall/F1 figures and card-network branding are deliberately left out.

## Real logos

University and employer marks are shown as neutral name tiles. To use real
logo files, add them under `assets/img/logos/` and replace the matching
`<span class="wm">` / `<span class="seal">` contents with an `<img>`.
