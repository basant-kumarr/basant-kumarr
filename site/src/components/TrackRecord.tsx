import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { timeline } from '@/data/timeline';

const KIND_LABEL: Record<string, string> = {
  education: 'Education',
  engagement: 'Client engagement',
  build: 'Independent build',
};

export function TrackRecord() {
  return (
    <section className="section" id="track-record" aria-labelledby="track-title">
      <div className="shell">
        <SectionHeading
          id="track-title"
          eyebrow="02 — Track record"
          title="Where the work has actually been done"
          lead="Postgraduate analytics study, a real client engagement, and a product built end to end."
        />

        <ol className="track">
          {timeline.map((entry, index) => (
            <Reveal key={entry.title} as="li" index={index} className="track__item">
              <div className="track__marker" aria-hidden="true">
                <span />
              </div>
              <article className="track__card glass">
                <p className="track__kind mono">{KIND_LABEL[entry.kind]}</p>
                <h3 className="track__title">{entry.title}</h3>
                <p className="track__org">{entry.org}</p>
                <p className="track__summary">{entry.summary}</p>
                <ul className="track__highlights">
                  {entry.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
