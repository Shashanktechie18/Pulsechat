import React from 'react';
import { Link } from 'react-router-dom';
import EchoMarketingHeader from '../components/EchoMarketingHeader';
import EchoMarketingFooter from '../components/EchoMarketingFooter';

const AboutUs = () => {
  return (
    <div className="echo-homepage">
      <div className="echo-content-layer">
        <EchoMarketingHeader />

        <main className="echo-subpage-main">
          <section className="echo-sub-hero">
            <span className="section-eyebrow">About Echo</span>
            <h1 className="echo-sub-title">Real-time messaging, reimagined</h1>
            <p className="echo-sub-copy">
              Echo is a modern chat platform built on cutting-edge web technology to bring your team closer together with instant messaging, video calling, and read receipts.
            </p>
          </section>

          <section className="echo-features-section">
            <div className="echo-feature-grid">
              <article className="echo-feature-card">
                <div className="echo-feature-icon">
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <h3>Lightning Fast</h3>
                <p>
                  WebSocket-powered messaging delivers conversations in under 50ms, keeping your team in perfect sync.
                </p>
              </article>

              <article className="echo-feature-card">
                <div className="echo-feature-icon">
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h3>Secure by Design</h3>
                <p>
                  JWT-based authentication, protected routes, and token session management keep your chats safe.
                </p>
              </article>

              <article className="echo-feature-card">
                <div className="echo-feature-icon">
                  <i className="bi bi-camera-video-fill"></i>
                </div>
                <h3>HD Video Calls</h3>
                <p>
                  Direct WebRTC video calls with crystal-clear quality, mute controls, and camera toggle.
                </p>
              </article>

              <article className="echo-feature-card">
                <div className="echo-feature-icon">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h3>Team Channels</h3>
                <p>
                  Unified group channels plus 1-to-1 direct messaging for both broad and focused conversations.
                </p>
              </article>

              <article className="echo-feature-card">
                <div className="echo-feature-icon">
                  <i className="bi bi-check2-all"></i>
                </div>
                <h3>Read Receipts</h3>
                <p>
                  Know when your messages are delivered and read in real time with live status updates.
                </p>
              </article>

              <article className="echo-feature-card">
                <div className="echo-feature-icon">
                  <i className="bi bi-search"></i>
                </div>
                <h3>Smart Search</h3>
                <p>
                  Find messages instantly with powerful search filtering across all your conversations.
                </p>
              </article>
            </div>
          </section>

          <section className="echo-cta-strip">
            <h2>Experience Echo today</h2>
            <p>Join thousands of users communicating smarter with real-time messaging, calling, and team collaboration.</p>
            <div>
              <Link to="/register" className="echo-main-cta">Create account</Link>
              <Link to="/chat" className="echo-secondary-cta">Open chat</Link>
            </div>
          </section>
        </main>

        <EchoMarketingFooter />
      </div>
    </div>
  );
};

export default AboutUs;
