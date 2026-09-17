import { ProjectGlyph } from './ProjectGlyph';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { projects, type Project } from '@/data/projects';

function ProjectLinks({ project }: { project: Project }) {
  if (project.visibility === 'private') {
    // No control at all rather than a disabled one: a button that cannot do
    // anything is worse than its absence.
    return <p className="case__private mono">{project.privateNote}</p>;
  }

  return (
    <ul className="case__links">
      {project.links.map((link) => (
        <li key={link.href}>
          <a
            className={`case__link case__link--${link.kind}`}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
            <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function CaseStudy({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal as="article" className={`case case--${project.domain}`} index={index % 2}>
      <div className="case__head">
        <span className="case__number mono">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3 className="case__title">{project.name}</h3>
          <p className="case__tagline">{project.tagline}</p>
          <p className="case__context mono">{project.context}</p>
        </div>
        <div className="case__glyph">
          <ProjectGlyph domain={project.domain} />
        </div>
      </div>

      <div className="case__body">
        <div className="case__narrative">
          <div className="case__block">
            <h4>Problem</h4>
            <p>{project.problem}</p>
          </div>
          <div className="case__block">
            <h4>Approach</h4>
            <p>{project.approach}</p>
          </div>
        </div>

        <div className="case__side">
          <div className="case__block">
            <h4>Result</h4>
            <ul className="case__results">
              {project.result.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="case__block">
            <h4>Technology</h4>
            <ul className="case__tech">
              {project.tech.map((item) => (
                <li key={item} className="chip">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {project.credit ? <p className="case__credit">{project.credit}</p> : null}

          <ProjectLinks project={project} />
        </div>
      </div>
    </Reveal>
  );
}

export function Projects() {
  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="shell">
        <SectionHeading
          id="work-title"
          eyebrow="05 — Work"
          title="Case studies, not thumbnails"
          lead="Problem, approach, result and a link you can open. Numbers are copied from each project's own repository."
        />

        <div className="cases">
          {projects.map((project, index) => (
            <CaseStudy key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
