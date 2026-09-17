import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { profile } from '@/data/profile';

const PILLARS = [
  {
    title: 'Start from the decision',
    body: 'Before a model, the question: what decision changes because of this number, and who has to defend it? The Age Friendly Ireland projection was built to survive a policy argument, which is a different requirement from being accurate.',
  },
  {
    title: 'Make the output readable',
    body: 'A fraud model that cannot be explained to the analyst working the queue is not deployable. Behavioural features and SHAP attribution were chosen so a prediction has a reason attached to it, not just a score.',
  },
  {
    title: 'Ship it, then own it',
    body: 'Analysis that stays in a notebook does not get used. The same work shows up here as live dashboards, a typed API, a mobile client and a design system — with the limitations written down next to the results.',
  },
];

export function About() {
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="shell">
        <SectionHeading
          id="about-title"
          eyebrow="01 — Position"
          title={<>Analytics that has to hold up in a room, not just in a notebook</>}
          lead={profile.summary}
        />

        <div className="about__grid">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} as="article" index={index} className="about__card glass">
              <span className="about__index mono">{String(index + 1).padStart(2, '0')}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="about__note">
          <p>
            <strong>{profile.availability}.</strong> The work below is the evidence — every metric
            is taken from the project it belongs to, and everything unfinished is labelled as
            unfinished.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
