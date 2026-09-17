import { Link } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';

export default function NotFound() {
  return (
    <>
      <Nav variant="case-study" />
      <main id="main" className="notfound">
        <div className="shell">
          <p className="eyebrow">404</p>
          <h1>That page does not exist</h1>
          <p>
            Every link on this site points at something real, so this is most likely a typed or an
            out-of-date URL.
          </p>
          <Link className="cta cta--warm" to="/">
            <span className="cta__label">Back to the portfolio</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
