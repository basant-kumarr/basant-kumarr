import { Link } from 'react-router-dom';
import { contact, profile } from '@/data/profile';

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <div>
          <p className="footer__name">{profile.name}</p>
          <p className="footer__role">{profile.role}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="footer__links">
            <li>
              <a href={`mailto:${contact.email}`}>Email</a>
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
            <li>
              <Link to="/bebeyond">BeBeyond</Link>
            </li>
          </ul>
        </nav>

        <p className="footer__meta mono">
          Built with React, TypeScript and three.js · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
