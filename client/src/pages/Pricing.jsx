import React from 'react';
import { Link } from 'react-router-dom';
import EchoMarketingHeader from '../components/EchoMarketingHeader';
import EchoMarketingFooter from '../components/EchoMarketingFooter';
import { pricingPlans } from '../utils/marketingData';

const Pricing = () => {
  return (
    <div className="echo-homepage">
      <div className="echo-content-layer">
        <EchoMarketingHeader />

        <main className="echo-subpage-main">
          <section className="echo-sub-hero">
            <span className="section-eyebrow">Pricing</span>
            <h1 className="echo-sub-title">Simple plans for every stage</h1>
            <p className="echo-sub-copy">
              Start free and scale only when your chat workspace and team collaboration grow.
            </p>
          </section>

          <section className="echo-features-section pt-0">
            <div className="echo-pricing-grid">
              {pricingPlans.map((plan) => (
                <article key={plan.name} className="echo-pricing-card">
                  <div className="echo-chip">{plan.badge}</div>
                  <h3>{plan.name}</h3>
                  <p className="echo-pricing-price">
                    <strong>{plan.price}</strong>
                    <span>{plan.period}</span>
                  </p>
                  <ul className="echo-pricing-list">
                    {plan.features.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <Link to="/register" className="echo-main-cta">Choose {plan.name}</Link>
                </article>
              ))}
            </div>
          </section>

          <section className="echo-cta-strip">
            <h2>Need implementation support?</h2>
            <p>Use Docs for setup flow or open chat directly and start testing features live.</p>
            <div>
              <Link to="/docs" className="echo-secondary-cta">Read docs</Link>
              <Link to="/chat" className="echo-main-cta">Open chat</Link>
            </div>
          </section>
        </main>

        <EchoMarketingFooter />
      </div>
    </div>
  );
};

export default Pricing;
