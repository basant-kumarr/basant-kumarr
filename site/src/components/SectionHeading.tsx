import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type Props = {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
};

/** Consistent section masthead: index label, heading, one line of framing. */
export function SectionHeading({ eyebrow, title, lead, id }: Props) {
  return (
    <header className="section-heading">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <Reveal index={1}>
        <h2 id={id} className="section-heading__title">
          {title}
        </h2>
      </Reveal>
      {lead ? (
        <Reveal index={2}>
          <p className="section-heading__lead">{lead}</p>
        </Reveal>
      ) : null}
    </header>
  );
}
