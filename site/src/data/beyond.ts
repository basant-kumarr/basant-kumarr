/**
 * BeBeyond — flagship case study content.
 *
 * Everything below was read out of the BeBeyond repository itself. The
 * implemented / in-development / planned split is deliberate and load-bearing:
 * a recruiter reading this should be able to tell exactly what runs today.
 *
 * The repository is private and the app is not publicly deployed, so there is
 * no live URL and no public repository link to give. Rather than ship a button
 * that resolves to a 404, the flagship call to action opens the full case
 * study inside this site.
 */

export type MaturityStage = 'shipped' | 'building' | 'planned';

export type Capability = {
  title: string;
  detail: string;
  stage: MaturityStage;
};

export const beyond = {
  name: 'BeBeyond',
  tagline: 'AI-powered fitness, nutrition and personal performance platform',
  positioning:
    'A full-stack mobile product: a guided assessment produces an adaptive training and nutrition programme, and the system keeps adjusting it from what the user actually does.',
  status: 'Actively developed · private repository',
  caseStudyPath: '/bebeyond',
  problem:
    'Most fitness apps hand you a static plan and stop. They do not know what you trained yesterday, what that did to your recovery, or whether today’s session is the right one. BeBeyond is built around the opposite premise — that a training plan is a control loop, not a document.',
  approach:
    'The mobile app never talks to an AI provider directly. Every plan decision happens server-side behind a typed API, so credentials stay off the device and the intelligence layer can change without touching the client. Underneath it, an exercise ontology, a muscle-load model and a nutrition engine each own one part of the decision, and a coach layer explains the result in language rather than producing it from nothing.',
  architecture: [
    { layer: 'Mobile', detail: 'React Native · Expo SDK 57 · Expo Router · Zustand · TypeScript' },
    { layer: 'API', detail: 'Python · FastAPI · Pydantic schemas · rate limiting · ownership checks' },
    { layer: 'Data', detail: 'PostgreSQL · SQLAlchemy · Alembic migrations' },
    { layer: 'Intelligence', detail: 'Workout engine · muscle-load model · nutrition engine · coach agent runtime' },
    { layer: '3D', detail: 'three.js via expo-gl — rigged anatomical model, 36-region taxonomy' },
  ],
} as const;

export const capabilities: Capability[] = [
  {
    title: 'Guided assessment → adaptive programme',
    detail:
      'Profile, goals, diet, experience and equipment feed a workout engine that produces a training and nutrition programme, then keeps revising it through an adaptive program lifecycle rather than regenerating from scratch.',
    stage: 'shipped',
  },
  {
    title: 'Muscle-load analysis',
    detail:
      'Completed sets are attributed to muscle groups and accumulated into per-region load, which is what makes the next session’s selection defensible instead of arbitrary.',
    stage: 'shipped',
  },
  {
    title: 'Readiness signals and confidence tiers',
    detail:
      'Recommendations carry a confidence tier derived from how much signal actually exists for that user. Low evidence produces a visibly lower-confidence recommendation rather than a confident guess.',
    stage: 'shipped',
  },
  {
    title: 'Exercise ontology and curated library',
    detail:
      'A structured exercise taxonomy with a curated library, resolver and media-integrity checks, so every exercise surfaced in the app has verified visuals attached to it.',
    stage: 'shipped',
  },
  {
    title: 'Nutrition engine',
    detail:
      'Macro targets, a food and diet library, and meal planning that converges with the training side rather than being calculated independently of it.',
    stage: 'shipped',
  },
  {
    title: '3D anatomical exercise visualisation',
    detail:
      'A rigged anatomical model rendered through three.js and expo-gl, with camera presets, studio lighting, equipment props and per-region muscle activation driven by the exercise being viewed.',
    stage: 'shipped',
  },
  {
    title: 'Coach agent with deterministic fallback',
    detail:
      'A provider-interface AI layer generates the coach’s prose. Recommendations themselves are computed, not generated — and a deterministic fallback provider keeps the coach working when no AI provider is reachable.',
    stage: 'shipped',
  },
  {
    title: 'Accounts, ownership and privacy controls',
    detail:
      'Authentication, per-resource ownership checks, rate limiting, app lock, a privacy settings screen and full account deletion, each covered by its own test module.',
    stage: 'shipped',
  },
  {
    title: 'Camera-based form analysis',
    detail:
      'On-device pose capture through vision-camera worklets, being developed towards feedback on lift execution. The capture path exists; the analysis is not finished.',
    stage: 'building',
  },
  {
    title: 'Wearable and health integration',
    detail:
      'Health provider connection state and summary tables are in the schema and served by the API, with Apple Health and Health Connect marked available and Garmin and WHOOP not yet. End-to-end sync is not complete.',
    stage: 'building',
  },
  {
    title: 'Habits, cardio and wellness programming',
    detail:
      'Streaks and daily habits, cardio-specific programming, and recovery and mindfulness features are on the roadmap and not yet started.',
    stage: 'planned',
  },
];

export const stageLabels: Record<MaturityStage, string> = {
  shipped: 'Implemented',
  building: 'In development',
  planned: 'Planned',
};

/** Verified from the repository at the time of writing. */
export const beyondFacts = [
  { value: '51', label: 'API endpoints', hint: 'FastAPI routes serving the mobile client' },
  { value: '37', label: 'Backend test modules', hint: 'Covering safety, ownership, engines and persistence' },
  { value: '36', label: 'Anatomical regions', hint: 'Taxonomy driving muscle activation in the 3D viewer' },
  { value: '5', label: 'Schema migrations', hint: 'Alembic history from initial schema to health tables' },
];
