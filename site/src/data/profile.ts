/**
 * Single source of truth for identity and contact details.
 *
 * Every value here is verifiable from the repositories in this account or from
 * the linked public profiles. Nothing in this file is aspirational.
 */

export const PORTFOLIO_URL = 'https://basant-kumar-portfolio.netlify.app/';

export const profile = {
  name: 'Basant Kumar',
  role: 'Business Analyst — Data & AI Analytics',
  location: 'Dublin, Ireland',
  disciplines: ['Business Analytics', 'AI', 'Data', 'Product'],
  summary:
    'I turn business questions into decision-ready systems — census-scale policy models, explainable machine learning, and products that people actually use.',
  availability: 'Open to Business Analyst and Data Analyst roles in Ireland',
} as const;

export const contact = {
  email: 'basantsingh607@gmail.com',
  linkedin: 'https://www.linkedin.com/in/basantsingh-/',
  github: 'https://github.com/basant-kumarr',
} as const;

export const education = {
  degree: 'MSc Business Analytics',
  institution: 'Maynooth University',
  location: 'Maynooth, Co. Kildare, Ireland',
} as const;
