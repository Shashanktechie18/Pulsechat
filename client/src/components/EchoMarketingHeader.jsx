import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/about', label: 'About Us' },
];

const EchoMarketingHeader = () => {
  const location = useLocation();

  return (
    <header className="echo-header">
      <div className="echo-brand-wrap">
        <div className="echo-brand-icon">
          <i className="bi bi-chat-left-dots-fill"></i>
        </div>
        <div className="echo-brand-name">
          Echo
        </div>
      </div>

      <nav className="echo-header-links">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={location.pathname === item.to ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
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
  );
};

export default EchoMarketingHeader;
