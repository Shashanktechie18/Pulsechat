import React from 'react';
import { Link } from 'react-router-dom';

const EchoMarketingFooter = () => {
  return (
    <footer className="echo-footer">
      <div>Echo</div>
      <div>Copyright 2026 Echo. Built with real-time web tech.</div>
      <div className="echo-footer-links">
        <Link to="/features">Features</Link>
        <Link to="/about">About Us</Link>
        <Link to="/docs">Docs</Link>
        <Link to="/blog">Blog</Link>
      </div>
    </footer>
  );
};

export default EchoMarketingFooter;
