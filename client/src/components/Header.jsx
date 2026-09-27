import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="navbar navbar-expand-lg">
      <div className="container">
        <nav className="navbar navbar-expand-lg p-0 w-100">
          {/* Logo and Brand */}
          <Link 
            to="/" 
            className="navbar-brand d-flex align-items-center text-decoration-none"
            onClick={handleLogoClick}
          >
            <div className="d-flex align-items-center justify-content-center me-3 fw-bold" 
                 style={{width: '45px', height: '45px', fontSize: '1.2rem', background: 'linear-gradient(135deg, #25d366, #34b7f1)', borderRadius: '50%', color: 'white'}}>
              E
            </div>
            <span className="fs-2 fw-bold">Echo</span>
          </Link>

          {/* Mobile toggle button */}
          <button 
            className="navbar-toggler border-0" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/">
                  <i className="bi bi-house me-2"></i>
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/chat">
                  <i className="bi bi-chat-dots me-2"></i>
                  Chat
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/login">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className="nav-link btn btn-light text-primary px-4 py-2 ms-3 rounded-pill fw-medium" 
                  to="/register"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
