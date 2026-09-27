import React from 'react';
import { Link } from 'react-router-dom';
import EchoMarketingHeader from '../components/EchoMarketingHeader';
import EchoMarketingFooter from '../components/EchoMarketingFooter';
import { docsSections } from '../utils/marketingData';

const Docs = () => {
  return (
    <div className="echo-homepage">
      <div className="echo-content-layer">
        <EchoMarketingHeader />

        <main className="echo-subpage-main">
          <section className="echo-sub-hero">
            <span className="section-eyebrow">Docs</span>
            <h1 className="echo-sub-title">Implementation references</h1>
            <p className="echo-sub-copy">
              Architecture, API flow, signaling behavior, and practical notes for integrating Echo.
            </p>
          </section>

          <section className="echo-features-section pt-0">
            <div className="echo-docs-grid">
              {docsSections.map((section) => (
                <article key={section.title} className="echo-doc-card">
                  <h3>{section.title}</h3>
                  <ul className="echo-doc-list">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="echo-cta-strip">
            <h2>Continue with product pages</h2>
            <p>See all capabilities and plan options using dedicated route pages.</p>
            <div>
              <Link to="/features" className="echo-secondary-cta">View features</Link>
              <Link to="/about" className="echo-main-cta">Learn more</Link>
            </div>
          </section>
        </main>

        <EchoMarketingFooter />
      </div>
    </div>
  );
};

export default Docs;
