/**
 * Capability graph.
 *
 * Deliberately not percentage bars — a number like "Python 85%" is unverifiable
 * and tells a hiring manager nothing. Each node instead carries what it was
 * used for and which project it was used on, so the claim is checkable.
 */

export type SkillNode = {
  name: string;
  /** What it was actually used to do. */
  use: string;
  /** Project id, or the BeBeyond flagship. */
  project: string;
  projectLabel: string;
};

export type SkillDomain = {
  id: string;
  label: string;
  blurb: string;
  nodes: SkillNode[];
};

const AFI = { project: 'age-friendly-ireland', projectLabel: 'The Rising Step' };
const FRAUD = { project: 'fraud-detection', projectLabel: 'Fraud Detection' };
const FORECAST = { project: 'demand-forecasting', projectLabel: 'Demand Forecasting' };
const VISION = { project: 'emotion-identification', projectLabel: 'Emotion Analysis' };
const BEYOND = { project: 'beyond', projectLabel: 'BeBeyond' };
const STUDIO = { project: 'ai-creator-studio', projectLabel: 'AI Creator Studio' };

export const skillDomains: SkillDomain[] = [
  {
    id: 'data',
    label: 'Data',
    blurb: 'Getting from a raw official dataset to something a decision can rest on.',
    nodes: [
      { name: 'SQL', use: 'Relational modelling and querying behind application data', ...BEYOND },
      { name: 'Python', use: 'Feature engineering, prevalence modelling and pipeline code', ...AFI },
      { name: 'Pandas / NumPy', use: 'Cleaning and reshaping transaction and census data', ...FRAUD },
      { name: 'R', use: 'Time-series decomposition and stationarity testing', ...FORECAST },
      { name: 'PostgreSQL', use: 'Application schema with versioned Alembic migrations', ...BEYOND },
      { name: 'Excel', use: 'Client-facing analysis and reconciliation of census figures', ...AFI },
    ],
  },
  {
    id: 'ai',
    label: 'AI / ML',
    blurb: 'Models chosen for what they let a human do with the output, not for novelty.',
    nodes: [
      { name: 'XGBoost', use: 'Tuned gradient boosting at 97.2% precision on imbalanced fraud data', ...FRAUD },
      { name: 'scikit-learn', use: 'Logistic regression benchmark and GridSearchCV tuning', ...FRAUD },
      { name: 'SHAP', use: 'Attributing predictions so a fraud analyst can act on them', ...FRAUD },
      { name: 'ARIMA / Prophet', use: 'Competing demand forecasts with uncertainty intervals', ...FORECAST },
      { name: 'OpenCV', use: 'Real-time face detection and frame-by-frame classification', ...VISION },
      { name: 'TensorFlow / Keras', use: 'Pre-trained classification models in the vision pipeline', ...VISION },
      { name: 'LLM integration', use: 'Provider-interface coach layer with a deterministic fallback', ...BEYOND },
    ],
  },
  {
    id: 'analytics',
    label: 'Business Analytics',
    blurb: 'Framing the question so the answer changes what someone does on Monday.',
    nodes: [
      { name: 'Requirements analysis', use: 'Turning a client brief into a defensible modelling scope', ...AFI },
      { name: 'KPI design', use: 'Metrics framed for fraud operations, not for model leaderboards', ...FRAUD },
      { name: 'Policy benchmarking', use: 'Ireland against Australia, Sweden and Denmark', ...AFI },
      { name: 'Scenario modelling', use: 'Projections to 2030, 2040 and 2050 with stated assumptions', ...AFI },
      { name: 'Stakeholder communication', use: 'Executive presentation delivered to the client', ...AFI },
    ],
  },
  {
    id: 'visualisation',
    label: 'Visualisation',
    blurb: 'Charts that carry the method and the caveats, not just the headline.',
    nodes: [
      { name: 'Tableau', use: 'Exploratory dashboards over census and transaction data', ...AFI },
      { name: 'Power BI', use: 'Reporting views for business analysis coursework', ...FORECAST },
      { name: 'ggplot2', use: 'Forecast plots with confidence intervals', ...FORECAST },
      { name: 'Hand-built SVG', use: 'Dependency-free charts inside single-file live dashboards', ...AFI },
      { name: 'Data storytelling', use: 'Methodology and limitations documented inside the dashboard', ...AFI },
    ],
  },
  {
    id: 'engineering',
    label: 'Engineering',
    blurb: 'Shipping the thing, not just the notebook.',
    nodes: [
      { name: 'FastAPI', use: 'Typed API surface across 51 endpoints', ...BEYOND },
      { name: 'React Native / Expo', use: 'Full mobile client with file-based routing', ...BEYOND },
      { name: 'TypeScript', use: 'Typed state, API contracts and component boundaries', ...BEYOND },
      { name: 'three.js', use: 'Rigged anatomical model with camera presets and lighting', ...BEYOND },
      { name: 'Testing', use: '37 backend test modules; 173 stdlib tests on the studio foundation', ...STUDIO },
      { name: 'Git / CI', use: 'Branch-based workflow with automated checks', ...BEYOND },
    ],
  },
  {
    id: 'product',
    label: 'Product & Delivery',
    blurb: 'Deciding what not to build, and being explicit about what is not finished.',
    nodes: [
      { name: 'Product definition', use: 'PRD, visual system and roadmap maintained alongside the code', ...BEYOND },
      { name: 'Design systems', use: 'Tokens, nine surface levels and motion rules enforced in review', ...BEYOND },
      { name: 'Quality gates', use: 'Nothing publishes without QA and explicit human approval', ...STUDIO },
      { name: 'Risk and compliance framing', use: 'GDPR and EU AI Act constraints stated before deployment', ...VISION },
      { name: 'Agile delivery', use: 'Iterative scope against a group consultancy deadline', ...AFI },
    ],
  },
];
