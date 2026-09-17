/**
 * Track record.
 *
 * Only entries evidenced by the repositories and the linked profiles. No
 * employment history is listed here because none is documented in them —
 * inventing one would be the single most damaging thing this site could do.
 */

export type TimelineEntry = {
  title: string;
  org: string;
  kind: 'education' | 'engagement' | 'build';
  summary: string;
  highlights: string[];
};

export const timeline: TimelineEntry[] = [
  {
    title: 'MSc Business Analytics',
    org: 'Maynooth University',
    kind: 'education',
    summary:
      'Postgraduate study combining statistical modelling, machine learning and business analysis, delivered against real client briefs rather than only coursework datasets.',
    highlights: [
      'Consultancy project delivered to Age Friendly Ireland',
      'Machine-learning module (MI6228) — fraud detection with XGBoost and SHAP',
      'Time-series forecasting in R; visual analytics in Tableau and Power BI',
    ],
  },
  {
    title: 'Business analytics consultancy',
    org: 'Age Friendly Ireland',
    kind: 'engagement',
    summary:
      'Worked as part of a four-person team for a client that works with every Irish local authority on housing and universal design, producing a defensible national projection of stair-accessibility barriers to 2050.',
    highlights: [
      'Built the prevalence × projection model on CSO Census 2022 and PEC19 data',
      'Benchmarked Irish policy against four international models',
      'Delivered five recommendations and an executive presentation to the client',
    ],
  },
  {
    title: 'BeBeyond — independent product build',
    org: 'Self-directed',
    kind: 'build',
    summary:
      'Designing and building a full-stack AI fitness and nutrition platform end to end: mobile client, API, data model, intelligence layer and 3D anatomical visualisation.',
    highlights: [
      'React Native and FastAPI with PostgreSQL and versioned migrations',
      'Muscle-load, readiness and nutrition engines behind a typed API',
      'Design system and visual rules maintained as documentation, not folklore',
    ],
  },
];
