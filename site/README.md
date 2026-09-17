# Portfolio — basant-kumar-portfolio.netlify.app

The source for [basant-kumar-portfolio.netlify.app](https://basant-kumar-portfolio.netlify.app/).

## Stack

- Vite + React 18 + TypeScript
- react-three-fiber and three.js for the 3D layer (lazy-loaded, never on the critical path)
- React Router for the home route and the `/bebeyond` case study
- Plain CSS with design tokens — no UI framework, no CSS-in-JS

## Commands

```bash
npm install
npm run dev        # local dev server
npm run typecheck  # tsc -b --noEmit
npm run lint       # eslint
npm run build      # tsc -b && vite build  → dist/
npm run preview    # serve the production build
```

## How the 3D layer is wired

`src/components/SceneMount.tsx` is the single entry point. It grades the device
(`useQualityTier`), waits for the browser to go idle, and only then dynamically
imports the scene. Devices without usable WebGL never download three.js at all
and get the CSS backdrop in `src/components/SceneBackdrop.tsx` instead. Context
loss, chunk-load failure and runtime errors all fall back to the same backdrop
through `SceneBoundary`, so no part of the content depends on the scene.

`prefers-reduced-motion` switches the canvas to a single on-demand frame rather
than a render loop, and every `useFrame` body returns early.

## Content rules

Everything rendered from `src/data/` is taken from the repository or profile it
describes. Projects whose repository is private carry a state label instead of a
link, because a button that resolves to a 404 is worse than no button.

## Deployment

Netlify, from the repository root `netlify.toml` — it sets `base = "site"`, so
no build settings need configuring in the Netlify UI.
