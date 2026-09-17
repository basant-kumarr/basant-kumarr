import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { skillDomains, type SkillNode } from '@/data/skills';

/**
 * Capability graph.
 *
 * Domains are tabs; the nodes inside are focusable buttons that reveal what
 * the technology was used for and on which project. It works with a keyboard
 * and on touch because the detail lives in state, not in a hover-only layer.
 */
export function Capabilities() {
  const [domainId, setDomainId] = useState(skillDomains[0].id);
  const [selected, setSelected] = useState<SkillNode | null>(null);
  const panelId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const domain = skillDomains.find((entry) => entry.id === domainId) ?? skillDomains[0];
  const detail = selected ?? domain.nodes[0];

  /**
   * Roving tabindex needs arrow keys to go with it. Without this the inactive
   * tabs are unreachable by keyboard entirely, which is worse than no tablist
   * semantics at all.
   */
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = skillDomains.length - 1;
    let next: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;

    if (next === null) return;
    event.preventDefault();
    setDomainId(skillDomains[next].id);
    setSelected(null);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="section" id="capabilities" aria-labelledby="capabilities-title">
      <div className="shell">
        <SectionHeading
          id="capabilities-title"
          eyebrow="03 — Capabilities"
          title="What each tool was actually used for"
          lead="No proficiency bars. Every capability below names the job it did and the project it did it on."
        />

        <Reveal className="caps">
          <div className="caps__tabs" role="tablist" aria-label="Capability domains">
            {skillDomains.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                onKeyDown={(event) => onTabKey(event, index)}
                id={`${panelId}-tab-${entry.id}`}
                aria-selected={entry.id === domainId}
                aria-controls={`${panelId}-panel`}
                tabIndex={entry.id === domainId ? 0 : -1}
                className={`caps__tab ${entry.id === domainId ? 'is-active' : ''}`}
                onClick={() => {
                  setDomainId(entry.id);
                  setSelected(null);
                }}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <div
            className="caps__panel glass"
            role="tabpanel"
            id={`${panelId}-panel`}
            aria-labelledby={`${panelId}-tab-${domain.id}`}
          >
            <p className="caps__blurb">{domain.blurb}</p>

            <ul className="caps__nodes">
              {domain.nodes.map((node) => (
                <li key={node.name}>
                  <button
                    type="button"
                    className={`caps__node ${detail.name === node.name ? 'is-active' : ''}`}
                    onClick={() => setSelected(node)}
                    onFocus={() => setSelected(node)}
                    onMouseEnter={() => setSelected(node)}
                  >
                    {node.name}
                  </button>
                </li>
              ))}
            </ul>

            <div className="caps__detail" aria-live="polite">
              <p className="caps__detail-name">{detail.name}</p>
              <p className="caps__detail-use">{detail.use}</p>
              <p className="caps__detail-project mono">
                Used on <span>{detail.projectLabel}</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
