// Single source of truth for the CV. Both the Word file and the PDF are
// generated from this list, so the two can never drift apart.
// Every fact here was verified during the portfolio release audit.
const B = (s) => ({ b: s });     // bold run
const L = (text, href) => ({ text, href }); // link run

module.exports = [
  { type: 'name', text: 'BASANT KUMAR' },
  { type: 'tagline', text: 'AI & Business Analyst  |  Business Analytics · Data · AI' },
  { type: 'contact', runs: ['Celbridge, Co. Kildare, Ireland  ·  ', L('basantsingh607@gmail.com', 'mailto:basantsingh607@gmail.com')] },
  { type: 'contact', runs: ['Portfolio: ', L('basant-kumar-portfoli.netlify.app', 'https://basant-kumar-portfoli.netlify.app/')] },
  { type: 'contact', runs: [L('linkedin.com/in/basantsingh-', 'https://www.linkedin.com/in/basantsingh-/'), '  ·  ', L('github.com/basant-kumarr', 'https://github.com/basant-kumarr')] },

  { type: 'heading', text: 'Profile' },
  { type: 'para', runs: ['Business analytics graduate with an electronics engineering background, working across business problems, data and AI. I completed the MSc in Business Analytics at Maynooth University in 2026 (award pending), after R&D work in IoT and analytics and research reporting at Maynooth. I like framing the problem with stakeholders first, getting the data into a state worth trusting, modelling it, and turning the result into something people can use. Seeking Business Analyst, Data Analyst, BI Analyst and AI/Product Analyst roles in Ireland.'] },

  { type: 'heading', text: 'Education' },
  { type: 'entry', title: 'MSc Business Analytics, Maynooth University, Ireland', right: '2024 – 2026', sub: 'Programme completed 2026; award pending' },
  { type: 'entry', title: 'BEng Electronics & Telecommunication Engineering', right: 'Aug 2016 – Apr 2020', sub: 'Savitribai Phule Pune University, India' },

  { type: 'heading', text: 'Professional Experience' },
  { type: 'entry', title: 'Graduate Research Assistant, Maynooth University', right: 'Nov 2024 – Feb 2026', sub: 'Kildare, Ireland' },
  { type: 'bullet', runs: ['Built automated reporting dashboards using Python, R and Tableau.'] },
  { type: 'bullet', runs: ['Interviewed HR leads, CEOs and senior managers, then analysed the qualitative data to identify themes.'] },
  { type: 'entry', title: 'R&D Engineer, IoT & Analytics, Bajaj Electricals Ltd', right: 'Oct 2022 – Dec 2023', sub: 'India' },
  { type: 'bullet', runs: ['Analysed IoT sensor data, built KPI reporting and applied forecasting.'] },
  { type: 'bullet', runs: ['Worked with cross-functional teams on requirements and technical deliverables.'] },
  { type: 'entry', title: 'Junior Engineer, AI & IoT Solutions, Bajaj Electricals Ltd', right: 'Jul 2021 – Oct 2022', sub: 'India' },
  { type: 'bullet', runs: ['Analysed existing processes and prepared gap-analysis reports.'] },
  { type: 'bullet', runs: ['Built KPI dashboards and supported performance benchmarking across AI and IoT solutions.'] },
  { type: 'entry', title: 'E-commerce Founder (independent business)', right: 'Feb 2018 – Aug 2019', sub: 'Delhi, India' },
  { type: 'bullet', runs: ['Ran a Shopify business across sales, inventory, suppliers and marketing.'] },
  { type: 'bullet', runs: ['Used commercial data to understand demand, conversion and stock requirements.'] },

  { type: 'heading', text: 'Selected Projects' },
  { type: 'entry', title: 'BeBeyond: AI fitness and nutrition platform', right: 'Personal product', sub: 'Private build, in development · React Native, Expo, TypeScript, FastAPI, PostgreSQL, Three.js' },
  { type: 'bullet', runs: ['Designed and built end to end: exercise ontology, muscle load and readiness with confidence tiers, recommendation and nutrition engines, and a 3D exercise view.'] },
  { type: 'bullet', runs: ['Deterministic engines own every number; a rule-based coach explains each recommendation. Language-model explanations are written but switched off by default.'] },
  { type: 'bullet', runs: ['Camera form analysis runs on a simulated pose source; wearable adapters are scaffolded with no live data.'] },
  { type: 'entry', title: 'Fraud Detection: explainable XGBoost model', right: 'MSc team project', sub: 'Coursework MI6228, Maynooth University · Python, XGBoost, GridSearchCV, SHAP, scikit-learn, Gradio' },
  { type: 'bullet', runs: [B('My contribution: '), 'feature engineering, XGBoost tuning, SHAP analysis and Gradio deployment.'] },
  { type: 'bullet', runs: ['Engineered behavioural features (spend deviation from the cardholder average, distance to merchant, card-not-present proxy) and tuned XGBoost with a precision-first threshold.'] },
  { type: 'bullet', runs: ['On a 166,716-transaction hold-out from 555,719 synthetic Kaggle transactions, the tuned model caught 496 of 644 frauds versus 59 for a logistic regression baseline, with 11 false alerts; AUC\u2011ROC 99.9%.'] },
  { type: 'entry', title: 'Housing Accessibility: client project for Age Friendly Ireland', right: 'MSc team project', sub: 'Four-person consultancy team · CSO Census 2022, CSO PEC19 population projections' },
  { type: 'bullet', runs: ['Applied Census 2022 prevalence by age and sex to population projections and converted it to household level: an estimated 16.9% of households in 2022, projected to reach 22.3% by 2050 (100,000+ additional households).'] },
  { type: 'bullet', runs: ['Benchmarked housing-adaptation policy in Australia, Sweden and Denmark; five recommendations delivered to the client in an executive presentation.'] },
  { type: 'entry', title: 'Sales Demand Forecasting: ARIMA vs Prophet', right: '', sub: 'R, forecast, prophet, dplyr, ggplot2' },
  { type: 'bullet', runs: ['Compared Auto ARIMA and Prophet on product sales data with rolling-window validation on RMSE, MAE and MAPE.'] },
  { type: 'bullet', runs: ['Prophet performed better on strongly seasonal series with holiday effects; ARIMA on stationary, trend-driven series.'] },
  { type: 'entry', title: 'Swarm Drone Coordination System', right: '2019 – 2020', sub: "Bachelor's final-year team project · Arduino, GPS, gyroscope, RF modules" },
  { type: 'bullet', runs: [B('Achievement (2018): '), 'Qualified in the DST & Texas Instruments India Innovation Challenge Design Contest 2018, anchored by IIM Bangalore.'] },
  { type: 'bullet', runs: ['Developed a two-drone coordination prototype for disaster-response applications, exploring coordinated operations for supply delivery and search-and-rescue support.'] },
  { type: 'bullet', runs: ['Integrated Arduino-based control hardware with GPS, gyroscope and RF modules as part of the engineering system.'] },
  { type: 'bullet', runs: ['Explored navigation, drone coordination and operational safety considerations for a practical disaster-response application.'] },

  { type: 'heading', text: 'Skills' },
  { type: 'labelled', label: 'Business analysis', text: 'requirements, process improvement, stakeholder management, KPI definition, As-Is / To-Be, gap analysis, supply chain analytics, project management' },
  { type: 'labelled', label: 'Data & analytics', text: 'SQL, Python, R, Excel, Power Query, Power BI, Tableau, MySQL' },
  { type: 'labelled', label: 'Machine learning', text: 'XGBoost, SHAP, scikit-learn, model evaluation, forecasting (ARIMA, Prophet)' },
  { type: 'labelled', label: 'Product & engineering', text: 'FastAPI, PostgreSQL, React Native, TypeScript, APIs, IoT, Git and GitHub' },
  { type: 'labelled', label: 'Engineering tools', text: 'MATLAB, CAD' },

  { type: 'heading', text: 'Certifications' },
  { type: 'cert', title: 'Machine Learning Professional', right: 'Altair / RapidMiner, 2025' },
  { type: 'cert', title: 'Google Data Analytics Professional Certificate', right: 'Google, 2024' },
  { type: 'cert', title: 'AI For Everyone', right: '2025' },
  { type: 'cert', title: 'Google Project Management Certificate', right: 'Google' },

  { type: 'heading', text: 'Leadership & Volunteering' },
  { type: 'bullet', runs: [B('Save the Children, Pune: '), 'weekend volunteer raising awareness of girls’ education, teaching mathematics to children and fundraising in the community.'] },
  { type: 'bullet', runs: [B('Head Boy '), 'at higher secondary school; ', B('Fashion Show Head '), 'at college, mentoring team members competing at events around Pune; college cricket team.'] },
];
