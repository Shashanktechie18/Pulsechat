import React from 'react';
import { Link } from 'react-router-dom';
import EchoMarketingHeader from '../components/EchoMarketingHeader';
import EchoMarketingFooter from '../components/EchoMarketingFooter';
import { blogPosts } from '../utils/marketingData';

const Blog = () => {
  return (
    <div className="echo-homepage">
      <div className="echo-content-layer">
        <EchoMarketingHeader />

        <main className="echo-subpage-main">
          <section className="echo-sub-hero">
            <span className="section-eyebrow">Blog</span>
            <h1 className="echo-sub-title">Release notes and product stories</h1>
            <p className="echo-sub-copy">
              Track feature launches, engineering updates, and design improvements across Echo.
            </p>
          </section>

          <section className="echo-features-section pt-0">
            <div className="echo-blog-grid">
              {blogPosts.map((post) => (
                <article key={post.title} className="echo-blog-card">
                  <div className="echo-blog-meta">
                    <span className="echo-chip">{post.tag}</span>
                    <span>{post.date}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <Link to="/docs" className="echo-secondary-cta">Read details</Link>
                </article>
              ))}
            </div>
          </section>

          <section className="echo-cta-strip">
            <h2>Jump into the app</h2>
            <p>Launch chat and test the latest calling, receipts, and search improvements.</p>
            <div>
              <Link to="/chat" className="echo-main-cta">Open chat</Link>
              <Link to="/features" className="echo-secondary-cta">Explore features</Link>
            </div>
          </section>
        </main>

        <EchoMarketingFooter />
      </div>
    </div>
  );
};

export default Blog;
