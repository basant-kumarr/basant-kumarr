import { useEffect } from 'react';
import { About } from '@/components/About';
import { BeyondFlagship } from '@/components/BeyondFlagship';
import { Capabilities } from '@/components/Capabilities';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Nav } from '@/components/Nav';
import { Projects } from '@/components/Projects';
import { TrackRecord } from '@/components/TrackRecord';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { PORTFOLIO_URL, profile } from '@/data/profile';

export default function Home() {
  const { progress } = useScrollProgress();

  useEffect(() => {
    document.title = `${profile.name} — Business Analytics, Data & AI`;
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', PORTFOLIO_URL);
  }, []);

  return (
    <>
      <Nav />
      <main id="main">
        <Hero scroll={progress} />
        <About />
        <TrackRecord />
        <Capabilities />
        <BeyondFlagship scroll={progress} />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
