/**
 * Project case studies.
 *
 * Rules this file follows, deliberately:
 *  - Every metric is copied from the project's own repository README.
 *  - Every link is a URL that exists. Projects whose repository is private
 *    carry `visibility: 'private'` and render a state label, never a button
 *    that would resolve to a 404.
 *  - Nothing claims a capability the code does not have.
 */

export type ProjectLink = {
  label: string;
  href: string;
  kind: 'live' | 'repo' | 'case-study';
};

export type Project = {
  id: string;
  name: string;
  tagline: string;
  /** Domain tint used by the card and its scene. */
  domain: 'policy' | 'risk' | 'forecast' | 'vision' | 'platform' | 'media';
  context: string;
  problem: string;
  approach: string;
  result: string[];
  tech: string[];
  links: ProjectLink[];
  visibility?: 'private';
  privateNote?: string;
  /** Rendered verbatim where credit is shared. */
  credit?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: 'age-friendly-ireland',
    name: 'The Rising Step',
    tagline: 'Projecting Irish household stair-accessibility barriers to 2050',
    domain: 'policy',
    context: 'Consultancy project for Age Friendly Ireland · MSc Business Analytics, Maynooth University',
    problem:
      'Age Friendly Ireland works with every Irish local authority on housing and universal design. They needed a defensible estimate of how many households face stair, walking, lifting or carrying difficulty today — and what that figure becomes by 2050 — to argue for policy change rather than guess at it.',
    approach:
      'A prevalence × projection model: age-and-sex disability rates from Census 2022 (CSO F4006) applied forward to official CSO population projections (PEC19, Method M2). Time-series forecasting was rejected because Ireland’s Q15(c) question wording is too recent to support a reliable historical series; dynamic microsimulation was rejected because the individual-level transition data does not exist matched to Census wording. The result ships as a single-file interactive dashboard with the methodology and limitations documented inside it.',
    result: [
      'Household share affected rises from 16.94% (2022) to 22.35% (2050)',
      'Over 100,000 additional households affected by 2050 without policy change',
      '349,155 people currently live with mobility difficulties (CSO Census 2022)',
      'Benchmarked Ireland against Australia, Sweden and Denmark; identified the absence of a universal design law as the structural gap',
      'Five recommendations delivered to the client, led by a legal right to housing adaptations modelled on Sweden’s Housing Adaptation Act',
    ],
    tech: ['Python', 'CSO Census 2022', 'Prevalence modelling', 'Policy benchmarking', 'Inline SVG dashboard'],
    credit: 'Group 6B — Basant Kumar, Abhijit Kumar, Pallavi Kethi Reddy, Shanjai Chinnamma Reddy',
    links: [
      { label: 'Live dashboard', href: 'https://age-friendly-ireland.netlify.app/', kind: 'live' },
      {
        label: 'Dashboard repository',
        href: 'https://github.com/basant-kumarr/ireland-stair-accessibility-dashboard',
        kind: 'repo',
      },
      {
        label: 'Consultancy write-up',
        href: 'https://github.com/basant-kumarr/housing-accessibility-ireland',
        kind: 'repo',
      },
    ],
  },
  {
    id: 'fraud-detection',
    name: 'Catching the Missed Fraud',
    tagline: 'Explainable credit-card fraud detection on a severely imbalanced dataset',
    domain: 'risk',
    context: 'Group coursework, MI6228 · MSc Business Analytics, Maynooth University',
    problem:
      'A fraud operations team does not care about headline accuracy — it cares how many real frauds get through and how many false alarms an analyst has to work. The task was to build a model that beats an interpretable baseline on both counts, and to explain which features actually separate fraud from legitimate activity.',
    approach:
      'Behavioural feature engineering first — spending deviation from the cardholder average, distance to merchant, card-not-present proxies, time-of-day flags — so an analyst can read a prediction. Logistic Regression as the interpretable benchmark, then XGBoost tuned with GridSearchCV at a 0.7 decision threshold to prioritise precision, with SHAP used to attribute the result.',
    result: [
      'Tuned XGBoost: 97.2% precision, 81.7% recall, 99.9% AUC-ROC',
      'Baseline caught 59 of 644 frauds in the test set; the tuned model caught 496 — 437 more',
      'Card-not-present proxy transactions show a 3.44% fraud rate vs 0.02% for point-of-sale — over 170× the risk',
      'Top SHAP drivers: amount deviation from average, distance to merchant, CNP proxy',
    ],
    tech: ['Python', 'XGBoost', 'scikit-learn', 'SHAP', 'GridSearchCV', 'Gradio'],
    credit:
      'Group 6B — Karishma Yadav, Aadhish, Abhinand, Basant Kumar, Sreejith, Varun. My contribution: feature engineering, XGBoost tuning, SHAP analysis, Gradio deployment.',
    links: [
      { label: 'Live dashboard', href: 'https://fraud-detection-xgboost.netlify.app/', kind: 'live' },
      {
        label: 'Repository',
        href: 'https://github.com/basant-kumarr/fraud-detections-xgboost',
        kind: 'repo',
      },
    ],
  },
  {
    id: 'demand-forecasting',
    name: 'Sales Demand Forecasting',
    tagline: 'ARIMA and Prophet compared for inventory decision support',
    domain: 'forecast',
    context: 'Time-series modelling in R',
    problem:
      'Inaccurate demand forecasting costs a business twice — capital tied up in unsold stock, or lost sales from stockouts. The question was which forecasting approach to trust for which demand pattern.',
    approach:
      'Decomposition and stationarity testing (ADF, ACF/PACF) first, then two models built against the same train/test split with rolling-window validation: ARIMA with auto-parameter optimisation, and Prophet for multiple seasonality and holiday effects. Evaluated on RMSE, MAE and MAPE rather than a single metric.',
    result: [
      'Prophet outperformed ARIMA on series with strong seasonality and holiday effects',
      'ARIMA performed better on stationary, trend-driven series',
      'Both improved on the naive baseline; forecasts ship with uncertainty intervals for planning scenarios',
    ],
    tech: ['R', 'forecast (ARIMA)', 'Prophet', 'dplyr', 'ggplot2'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/basant-kumarr/sales-demand-forecasting',
        kind: 'repo',
      },
    ],
  },
  {
    id: 'emotion-identification',
    name: 'Real-Time Identification & Emotion Analysis',
    tagline: 'Computer-vision proof of concept for retail footfall analytics',
    domain: 'vision',
    context: 'Python + OpenCV proof of concept',
    problem:
      'Retailers have no real-time read on who is on the shop floor or how they are responding. Manual observation is slow, inconsistent and does not scale.',
    approach:
      'A real-time video pipeline: OpenCV face detection, a pre-trained model for gender classification with confidence output, FACS-inspired feature extraction for emotion classification, and reference-calibrated bounding-box mapping for height estimation.',
    result: [
      'Frame-by-frame classification across gender, estimated height and core emotional states',
      'Framed against concrete retail uses: footfall demographics, queue-experience monitoring, layout optimisation',
      'Documented as academic proof of concept — any deployment would require GDPR and EU AI Act compliance, explicit consent and transparent data handling',
    ],
    tech: ['Python', 'OpenCV', 'TensorFlow / Keras', 'NumPy', 'Pandas'],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/basant-kumarr/realtime-emotion-identification',
        kind: 'repo',
      },
    ],
  },
  {
    id: 'ai-creator-studio',
    name: 'AI Creator Studio',
    tagline: 'Cloud-first content automation with quality gates and human approval',
    domain: 'media',
    context: 'Independent build · Phase 1 foundation',
    problem:
      'Automated content pipelines fail in two predictable ways: they publish work nobody checked, and they burn budget invisibly. The design constraint was a production spine where neither is possible.',
    approach:
      'A modular monolith rather than microservices — capability interfaces for every provider, one wiring point, pipelines expressed as data. Nothing publishes without passing quality gates and an explicit human approval stage. Live provider adapters are documented scaffolds that raise NotImplementedError rather than returning plausible fake data.',
    result: [
      'Full dry-run pipeline runs end to end and stops where it should, spending nothing',
      '173 tests on the Python standard library — no runtime dependencies at all',
      'Secret and private-media scanning, cost estimation and resumable job orchestration built into the foundation',
    ],
    tech: ['Python (stdlib only)', 'Modular monolith', 'Job orchestration', 'Quality gates', 'Cost control'],
    visibility: 'private',
    privateNote: 'Private repository — available on request.',
    links: [],
  },
];

/**
 * BeBeyond is deliberately not in `projects` — it is the flagship and has its
 * own presentation and its own route.
 */
export const featuredProjectIds = projects.map((p) => p.id);
