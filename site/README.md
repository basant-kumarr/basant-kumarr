# Portfolio site

Static single page portfolio for Basant Kumar. Vite build, no framework.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

## How it is put together

- `index.html` holds all content as real markup. Nothing is injected by JavaScript,
  so crawlers, link preview bots and CV parsers read the full page without running scripts.
- `src/styles.css` is the design system. Tokens live on `:root`.
- `src/main.js` is progressive enhancement only: counters, panels, tabs, nav, scroll reveal.
  If it fails to load, the page stays complete and readable.

## Two rules worth keeping

1. **The HTML owns every number.** Counters read their target from `data-count` and
   restore the original text when the animation ends, so the displayed value can never
   disagree with the markup.
2. **Content is visible by default.** The scroll reveal only hides things after JS adds
   `html.anim`, and a 3 second failsafe reveals anything the observer misses.

## Deployment

Netlify, configured by `../netlify.toml` (base `site`, publish `site/dist`).
