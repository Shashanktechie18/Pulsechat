import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const AuroraCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    let animId;
    let tick = 0;
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      stars = Array.from({ length: Math.max(70, Math.floor(window.innerWidth / 16)) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.35,
        speed: Math.random() * 0.004 + 0.001,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#020613';
      ctx.fillRect(0, 0, width, height);

      const layers = [
        { color1: 'rgba(56,189,248,0.16)', color2: 'rgba(99,102,241,0.11)', offsetX: 0.28, offsetY: 0.42, scale: 1.25 },
        { color1: 'rgba(168,85,247,0.14)', color2: 'rgba(236,72,153,0.08)', offsetX: 0.62, offsetY: 0.32, scale: 0.95 },
        { color1: 'rgba(34,211,238,0.11)', color2: 'rgba(16,185,129,0.07)', offsetX: 0.18, offsetY: 0.63, scale: 1.55 },
      ];

      layers.forEach((layer, i) => {
        const x = width * layer.offsetX + Math.sin(tick * 0.0008 + i * 2.1) * width * 0.15;
        const y = height * layer.offsetY + Math.cos(tick * 0.0006 + i * 1.7) * height * 0.12;
        const r = Math.min(width, height) * layer.scale * 0.65;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, layer.color1);
        grad.addColorStop(0.5, layer.color2);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      stars.forEach((star) => {
        const alpha = 0.25 + 0.45 * Math.sin(tick * star.speed + star.phase);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });

      tick += 1;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="echo-aurora-canvas" />;
};

const Home = () => {
  const [mousePos, setMousePos] = useState({ x: 48, y: 26 });

  useEffect(() => {
    const handleMouse = (event) => {
      setMousePos({
        x: Math.round((event.clientX / window.innerWidth) * 100),
        y: Math.round((event.clientY / window.innerHeight) * 100),
      });
    };

    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const features = useMemo(() => [
    {
      iconClass: 'bi bi-lightning-charge-fill',
      title: 'Real-time delivery',
      desc: 'Sub-50ms message latency with WebSocket events and instant update streams.',
      accent: '#2dd4bf',
    },
    {
      iconClass: 'bi bi-shield-lock-fill',
      title: 'Secure JWT sessions',
      desc: 'Token-based authentication and protected routes keep chat access safe and reliable.',
      accent: '#8b5cf6',
    },
    {
      iconClass: 'bi bi-people-fill',
      title: 'Group channels',
      desc: 'General room chat plus direct 1-to-1 threads for focused conversation.',
      accent: '#f472b6',
    },
    {
      iconClass: 'bi bi-camera-video-fill',
      title: 'HD video calling',
      desc: 'WebRTC-based direct video calls with mute, camera toggle, and call state handling.',
      accent: '#38bdf8',
    },
    {
      iconClass: 'bi bi-check2-all',
      title: 'Read receipts',
      desc: 'Delivered and read statuses update in real time for every direct message.',
      accent: '#10b981',
    },
  ], []);

  const docsItems = [
    'Socket.IO real-time events',
    'WebRTC signaling for calls',
    'Read receipt and status flow',
    'Typing and unread handling',
  ];

  return (
    <div className="echo-homepage">
      <AuroraCanvas />
      <div
        className="echo-spotlight"
        style={{
          background: `radial-gradient(640px circle at ${mousePos.x}% ${mousePos.y}%, rgba(99,102,241,0.10), transparent 60%)`,
        }}
      />

      <div className="echo-content-layer">
        <header className="echo-header">
          <div className="echo-brand-wrap">
            <div className="echo-brand-icon">
              E
            </div>
            <div className="echo-brand-name">
              Echo
            </div>
          </div>

          <nav className="echo-header-links">
            <a href="#about">About Us</a>
          </nav>

          <div className="echo-header-actions">
            <Link to="/login" className="echo-sign-in-link">
              Sign in
            </Link>
            <Link to="/register" className="echo-get-started-btn">
              Get started
            </Link>
          </div>
        </header>

        <main>
          <section className="echo-hero">
            <div className="echo-hero-left">
              <div className="echo-live-pill">
                <span></span>
                Fully integrated chat platform
              </div>

              <h1>
                Real-time messaging with
                <em> video calling</em>
              </h1>

              <p>
                Echo now includes direct WebRTC video calls, read receipts, unread counters,
                conversation search, typing indicators, reply threading, and secure real-time messaging.
              </p>

              <div className="echo-hero-actions">
                <Link to="/register" className="echo-main-cta">
                  Start for free
                </Link>
                <Link to="/chat" className="echo-secondary-cta">
                  Open chat
                </Link>
              </div>

              <div className="echo-stat-grid">
                <div>
                  <strong>&lt;50ms</strong>
                  <span>Realtime delivery</span>
                </div>
                <div>
                  <strong>1:1 HD</strong>
                  <span>Video calling</span>
                </div>
                <div>
                  <strong>Live</strong>
                  <span>Read + typing state</span>
                </div>
              </div>
            </div>

            <div className="echo-hero-right">
              <div className="echo-chat-panel">
                <div className="echo-panel-top">
                  <div className="echo-avatar">EC</div>
                  <div>
                    <strong>Echo Team</strong>
                    <small>General channel</small>
                  </div>
                  <span className="echo-online-dot">live</span>
                </div>

                <div className="echo-message them">Video call support is now live.</div>
                <div className="echo-message me">Read receipts and unread badges are working.</div>
                <div className="echo-message them">Search users and messages instantly.</div>

                <div className="echo-panel-footer">
                  <span>Typing indicators enabled</span>
                  <i className="bi bi-check2-all"></i>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="echo-features-section">
            <div className="echo-section-head">
              <span>All implemented features</span>
              <h2>Feature-complete chat experience</h2>
              <p>
                Every card below maps to capability already present in this codebase and available from the app.
              </p>
            </div>

            <div className="echo-features-grid">
              {features.map((feature) => (
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
            <h2>Ready to launch your chat workspace?</h2>
            <p>Open the app and start messaging with calls, receipts, search, and live presence right away.</p>
            <div>
              <Link to="/register" className="echo-main-cta">
                Create account
              </Link>
              <Link to="/login" className="echo-secondary-cta">
                Sign in
              </Link>
            </div>
          </section>
        </main>

        <footer className="echo-footer">
          <div>Echo</div>
          <div>Copyright 2026 Echo. Built with real-time web tech.</div>
          <div className="echo-footer-links">
            <a href="#docs">Docs</a>
            <a href="#blog">Blog</a>
            <a href="#features">Features</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;