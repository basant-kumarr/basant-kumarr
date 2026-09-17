import type { MutableRefObject } from 'react';
import { MagneticLink } from './MagneticLink';
import { Reveal } from './Reveal';
import { SceneMount } from './SceneMount';
import { beyond, beyondFacts, capabilities, stageLabels } from '@/data/beyond';

/**
 * The flagship.
 *
 * It gets its own environment, its own accent and its own scene rather than a
 * project card, because it is the piece of work that carries the most signal:
 * a product designed, built and operated end to end.
 */
export function BeyondFlagship({ scroll }: Props) {
  const shipped = capabilities.filter((item) => item.stage === 'shipped');
  const building = capabilities.filter((item) => item.stage === 'building');

  return (
    <section className="beyond section" id="beyond" aria-labelledby="beyond-title">
      <div className="beyond__scene">
        <SceneMount scene="beyond" scroll={scroll} />
        <div className="beyond__scrim" aria-hidden="true" />
      </div>

      <div className="shell beyond__content">
        <Reveal>
          <p className="eyebrow beyond__eyebrow">04 — Flagship</p>
        </Reveal>

        <Reveal index={1}>
          <h2 id="beyond-title" className="beyond__title">
            {beyond.name}
          </h2>
        </Reveal>

        <Reveal index={2}>
          <p className="beyond__tagline">{beyond.tagline}</p>
        </Reveal>

        <Reveal index={3}>
          <p className="beyond__lead">{beyond.positioning}</p>
        </Reveal>

        <Reveal index={4}>
          <ul className="beyond__facts">
            {beyondFacts.map((fact) => (
              <li key={fact.label}>
                <span className="beyond__fact-value mono">{fact.value}</span>
                <span className="beyond__fact-label">{fact.label}</span>
                <span className="beyond__fact-hint">{fact.hint}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="beyond__split">
          <Reveal index={5} className="beyond__panel glass">
            <h3>
              <span className="stage stage--shipped">{stageLabels.shipped}</span>
            </h3>
            <ul>
              {shipped.slice(0, 6).map((item) => (
                <li key={item.title}>{item.title}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal index={6} className="beyond__panel glass">
            <h3>
              <span className="stage stage--building">{stageLabels.building}</span>
            </h3>
            <ul>
              {building.map((item) => (
                <li key={item.title}>{item.title}</li>
              ))}
            </ul>
            <p className="beyond__panel-note">
              Listed as unfinished because it is unfinished. The full breakdown is in the case study.
            </p>
          </Reveal>
        </div>

        <Reveal index={7} className="beyond__actions">
          <MagneticLink to={beyond.caseStudyPath} tone="warm">
            Explore BeBeyond
          </MagneticLink>
          <p className="beyond__status mono">{beyond.status}</p>
        </Reveal>
      </div>
    </section>
  );
}

type Props = { scroll: MutableRefObject<number> };
