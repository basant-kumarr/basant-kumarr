import type { Project } from '@/data/projects';

/**
 * Abstract domain glyph.
 *
 * Deliberately not a screenshot: fabricating product imagery for work that has
 * no public UI would be the dishonest option. Each glyph is a geometric read of
 * the domain, drawn inline so it costs no request.
 */
export function ProjectGlyph({ domain }: { domain: Project['domain'] }) {
  return (
    <svg
      className={`glyph glyph--${domain}`}
      viewBox="0 0 120 80"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`glyph-${domain}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {domain === 'policy' && (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M8 64 L32 56 L56 44 L80 30 L112 14" opacity="0.9" />
          <path d="M8 70 L32 66 L56 60 L80 53 L112 44" opacity="0.4" />
          {[32, 56, 80, 112].map((x, i) => (
            <circle key={x} cx={x} cy={[56, 44, 30, 14][i]} r="3" fill="currentColor" stroke="none" />
          ))}
        </g>
      )}

      {domain === 'risk' && (
        <g>
          {Array.from({ length: 36 }, (_, i) => {
            const x = 10 + (i % 12) * 9;
            const y = 18 + Math.floor(i / 12) * 18;
            const flagged = i === 7 || i === 20 || i === 31;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={flagged ? 4 : 2.2}
                fill="currentColor"
                opacity={flagged ? 1 : 0.28}
              />
            );
          })}
        </g>
      )}

      {domain === 'forecast' && (
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path d="M6 52 C22 30 34 62 48 44 C60 29 68 50 76 42" strokeWidth="1.8" />
          <path d="M76 42 L112 20" strokeWidth="1.8" strokeDasharray="4 4" />
          <path d="M76 42 L112 34 L112 8 Z" fill="currentColor" opacity="0.12" stroke="none" />
        </g>
      )}

      {domain === 'vision' && (
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="34" y="14" width="52" height="52" rx="6" opacity="0.5" />
          <path d="M34 26 L26 26 M34 54 L26 54 M86 26 L94 26 M86 54 L94 54" opacity="0.6" />
          <circle cx="60" cy="38" r="12" opacity="0.85" />
          <path d="M50 58 Q60 66 70 58" opacity="0.85" strokeLinecap="round" />
        </g>
      )}

      {domain === 'platform' && (
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="60" cy="40" r="26" opacity="0.28" />
          <circle cx="60" cy="40" r="16" opacity="0.5" />
          <circle cx="60" cy="40" r="6" fill="currentColor" stroke="none" />
          {[0, 72, 144, 216, 288].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={60 + Math.cos(rad) * 16}
                y1={40 + Math.sin(rad) * 16}
                x2={60 + Math.cos(rad) * 26}
                y2={40 + Math.sin(rad) * 26}
                opacity="0.7"
              />
            );
          })}
        </g>
      )}

      {domain === 'media' && (
        <g stroke="currentColor" fill="none" strokeWidth="1.5">
          <rect x="12" y="20" width="44" height="30" rx="4" opacity="0.6" />
          <rect x="36" y="34" width="44" height="30" rx="4" opacity="0.4" />
          <path d="M88 26 L108 26 M88 36 L104 36 M88 46 L110 46 M88 56 L100 56" strokeLinecap="round" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}
