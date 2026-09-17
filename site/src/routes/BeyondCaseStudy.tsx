import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { MagneticLink } from '@/components/MagneticLink';
import { Nav } from '@/components/Nav';
import { Reveal } from '@/components/Reveal';
import { SceneMount } from '@/components/SceneMount';
import { beyond, beyondFacts, capabilities, stageLabels, type MaturityStage } from '@/data/beyond';
import { contact, PORTFOLIO_URL, profile } from '@/data/profile';
import { useScrollProgress } from '@/hooks/useScrollProgress';

const ORDER: MaturityStage[] = ['shipped', 'building', 'planned'];

const DESCRIPTION =
  'BeBeyond — an AI-powered fitness, nutrition and personal performance platform built by Basant Kumar with React Native, FastAPI, PostgreSQL and a three.js anatomical visualisation layer.';

export default function BeyondCaseStudy() {
  const { progress } = useScrollProgress();

  // The site is a single-page app, so per-route metadata is set here rather
  // than in index.html. Restored on unmount so returning home is correct.
  useEffect(() => {
    const previousTitle = document.title;
    const canonical = document.querySelector('link[rel="canonical"]');
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content') ?? '';

    document.title = `${beyond.name} — AI fitness and nutrition platform · ${profile.name}`;
    canonical?.setAttribute('href', `${PORTFOLIO_URL.replace(/\/$/, '')}/bebeyond`);
    description?.setAttribute('content', DESCRIPTION);
    window.scrollTo(0, 0);

    return () => {
      document.title = previousTitle;
      canonical?.setAttribute('href', PORTFOLIO_URL);
      description?.setAttribute('content', previousDescription);
    };
  }, []);

  return (
    <>
      <Nav variant="case-study" />
      <main id="main" className="study">
        <header className="study__hero">
          <div className="study__scene">
            <SceneMount scene="beyond" scroll={progress} />
            <div className="beyond__scrim" aria-hidden="true" />
          </div>

          <div className="shell study__hero-content">
            <p className="eyebrow beyond__eyebrow">Flagship case study</p>
            <h1 className="study__title">{beyond.name}</h1>
            <p className="study__tagline">{beyond.tagline}</p>
            <p className="study__status mono">{beyond.status}</p>

            <ul className="beyond__facts study__facts">
              {beyondFacts.map((fact) => (
                <li key={fact.label}>
                  <span className="beyond__fact-value mono">{fact.value}</span>
                  <span className="beyond__fact-label">{fact.label}</span>
                  <span className="beyond__fact-hint">{fact.hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <section className="section" aria-labelledby="study-premise">
          <div className="shell study__narrative">
            <Reveal>
              <h2 id="study-premise">The premise</h2>
              <p>{beyond.problem}</p>
            </Reveal>
            <Reveal index={1}>
              <h2>How it is built</h2>
              <p>{beyond.approach}</p>
            </Reveal>

            <Reveal index={2} className="study__architecture glass">
              <h3>Architecture</h3>
              <dl>
                {beyond.architecture.map((layer) => (
                  <div key={layer.layer}>
                    <dt className="mono">{layer.layer}</dt>
                    <dd>{layer.detail}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        <section className="section" aria-labelledby="study-state">
          <div className="shell">
            <h2 id="study-state" className="study__section-title">
              What runs today, and what does not
            </h2>
            <p className="study__section-lead">
              Split by maturity on purpose. Everything under {stageLabels.shipped.toLowerCase()} exists
              in the repository with tests against it; everything below that is honestly incomplete.
            </p>

            {ORDER.map((stage) => {
              const items = capabilities.filter((item) => item.stage === stage);
              if (items.length === 0) return null;
              return (
                <div key={stage} className="study__stage">
                  <h3>
                    <span className={`stage stage--${stage}`}>{stageLabels[stage]}</span>
                    <span className="study__stage-count mono">{items.length}</span>
                  </h3>
                  <ul className="study__capabilities">
                    {items.map((item, index) => (
                      <Reveal as="li" key={item.title} index={index} className="study__capability glass">
                        <h4>{item.title}</h4>
                        <p>{item.detail}</p>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="section" aria-labelledby="study-access">
          <div className="shell study__access glass">
            <h2 id="study-access">Access</h2>
            <p>
              BeBeyond is in a private repository and is not publicly deployed, so there is no live
              build or public source link to hand out yet. Rather than point a button at something
              that would 404, the honest options are here.
            </p>
            <div className="study__access-actions">
              <MagneticLink href={`mailto:${contact.email}?subject=BeBeyond`} tone="warm">
                Request a walkthrough
              </MagneticLink>
              <Link className="cta cta--cool" to="/#work">
                <span className="cta__label">See the rest of the work</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
