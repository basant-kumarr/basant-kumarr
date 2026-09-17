import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { contact, education, profile } from '@/data/profile';

const CHANNELS = [
  {
    key: 'email',
    label: 'Email',
    value: contact.email,
    href: `mailto:${contact.email}`,
    hint: 'Best for roles, briefs and anything with a deadline',
    external: false,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    value: 'in/basantsingh-',
    href: contact.linkedin,
    hint: 'Professional background and network',
    external: true,
  },
  {
    key: 'github',
    label: 'GitHub',
    value: 'basant-kumarr',
    href: contact.github,
    hint: 'Source for everything public on this site',
    external: true,
  },
] as const;

/**
 * Contact is three real channels and nothing else.
 *
 * There is no form: this site is a static deploy with no backend, and a form
 * that pretends to submit — or that silently posts nowhere — is exactly the
 * kind of fake control this build set out to remove.
 */
export function Contact() {
  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="shell">
        <SectionHeading
          id="contact-title"
          eyebrow="06 — Contact"
          title="Open to Business Analyst and Data Analyst roles in Ireland"
          lead={`${profile.location}. ${education.degree}, ${education.institution}.`}
        />

        <ul className="contact__grid">
          {CHANNELS.map((channel, index) => (
            <Reveal as="li" key={channel.key} index={index} className="contact__card glass">
              <a
                href={channel.href}
                {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="contact__label mono">{channel.label}</span>
                <span className="contact__value">{channel.value}</span>
                <span className="contact__hint">{channel.hint}</span>
                <span className="contact__arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
