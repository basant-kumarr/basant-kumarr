import type { MutableRefObject } from 'react';
import { MagneticLink } from './MagneticLink';
import { SceneMount } from './SceneMount';
import { beyond } from '@/data/beyond';
import { contact, education, profile } from '@/data/profile';

type Props = { scroll: MutableRefObject<number> };

/**
 * The hero states who this is and what they do inside the first viewport,
 * above and independent of the 3D layer. If WebGL never loads, nothing in this
 * section is missing.
 */
export function Hero({ scroll }: Props) {
  return (
    <section className="hero" id="hero">
      <div className="hero__scene">
        <SceneMount scene="hero" scroll={scroll} />
        <div className="hero__scrim" aria-hidden="true" />
      </div>

      <div className="hero__content shell">
        <p className="hero__eyebrow eyebrow">
          {profile.location} · {education.degree}, {education.institution}
        </p>

        <h1 className="hero__name">{profile.name}</h1>

        <p className="hero__disciplines">
          {profile.disciplines.map((discipline, index) => (
            <span key={discipline}>
              {discipline}
              {index < profile.disciplines.length - 1 ? (
                <i aria-hidden="true" className="hero__sep" />
              ) : null}
            </span>
          ))}
        </p>

        <p className="hero__summary">{profile.summary}</p>

        <div className="hero__actions">
          <MagneticLink to={beyond.caseStudyPath} tone="warm">
            Explore BeBeyond
          </MagneticLink>
          <a className="cta cta--cool" href="#work">
            <span className="cta__label">See the work</span>
          </a>
        </div>

        <ul className="hero__links">
          <li>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </li>
          <li>
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={contact.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
        </ul>
      </div>

      <a className="hero__cue" href="#about">
        <span className="mono">Scroll</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
