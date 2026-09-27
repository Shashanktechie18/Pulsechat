import React from 'react';
import { Link } from 'react-router-dom';
import EchoMarketingHeader from '../components/EchoMarketingHeader';
import EchoMarketingFooter from '../components/EchoMarketingFooter';
import { marketingFeatures } from '../utils/marketingData';

const Features = () => {
  return (
    <div className="echo-homepage">
      <div className="echo-content-layer">
        <EchoMarketingHeader />

        <main className="echo-subpage-main">
          <section className="echo-sub-hero">
            <span className="section-eyebrow">Capabilities</span>
            <h1 className="echo-sub-title">Everything Echo ships with</h1>
            <p className="echo-sub-copy">
              Explore the complete product feature set across messaging, calling, realtime presence,
              and conversation management.
            </p>
          </section>

          <section className="echo-features-section pt-0">
            <div className="echo-features-grid">
              {marketingFeatures.map((feature) => (
                <article key={feature.title} className="echo-feature-card" style={{ '--accent': feature.accent }}>
                  <div className="echo-feature-icon-wrap">
                    <i className={feature.iconClass}></i>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="echo-cta-strip">
            <h2>Ready to use these features in production?</h2>
            <p>Open the app and test chat, calling, receipts, unread states, and dynamic search.</p>
            <div>
              <Link to="/chat" className="echo-main-cta">Open chat</Link>
              <Link to="/about" className="echo-secondary-cta">Learn more</Link>
            </div>
          </section>
        </main>

        <EchoMarketingFooter />
      </div>
    </div>
  );
};

export default Features;
