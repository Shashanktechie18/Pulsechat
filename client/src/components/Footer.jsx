import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-light border-top mt-auto">
      <div className="container py-5">
        <div className="row">
          {/* Logo and Description */}
          <div className="col-lg-4 mb-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                   style={{width: '40px', height: '40px', fontSize: '1.2rem'}}>
                💬
              </div>
              <span className="ms-2 fw-bold text-primary">Echo</span>
            </div>
            <p className="text-muted mb-0">
              Modern messaging platform designed for seamless real-time communication. 
              Connect with friends, family, and colleagues instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-primary fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-house me-2"></i> Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/chat" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-chat-dots me-2"></i> Chat
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/login" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-box-arrow-in-right me-2"></i> Sign In
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-person-plus me-2"></i> Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-primary fw-bold mb-3">Features</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <span className="text-muted d-flex align-items-center">
                  <i className="bi bi-lightning me-2"></i> Real-time Messaging
                </span>
              </li>
              <li className="mb-2">
                <span className="text-muted d-flex align-items-center">
                  <i className="bi bi-people me-2"></i> User Management
                </span>
              </li>
              <li className="mb-2">
                <span className="text-muted d-flex align-items-center">
                  <i className="bi bi-shield-check me-2"></i> Secure & Private
                </span>
              </li>
              <li className="mb-2">
                <span className="text-muted d-flex align-items-center">
                  <i className="bi bi-phone me-2"></i> Mobile Friendly
                </span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-primary fw-bold mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-question-circle me-2"></i> Help Center
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-envelope me-2"></i> Contact Us
                </a>
              </li>
              <li className="mb-2">
                <Link to="/privacy" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-file-text me-2"></i> Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-file-earmark-text me-2"></i> Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-primary fw-bold mb-3">Connect</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="mailto:support@echochat.app" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-envelope me-2"></i> support@echochat.app
                </a>
              </li>
              <li className="mb-2">
                <a href="tel:+919876543210" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-telephone me-2"></i> +91 98765 43210
                </a>
              </li>
              <li className="mb-2">
                <a href="tel:+918765432109" className="text-muted text-decoration-none d-flex align-items-center">
                  <i className="bi bi-telephone me-2"></i> +91 87654 32109
                </a>
              </li>
              <li className="mb-2">
                <span className="text-muted d-flex align-items-center">
                  <i className="bi bi-geo-alt me-2"></i> Bangalore, India
                </span>
              </li>
              <li className="mt-3">
                <span className="badge bg-success">
                  <i className="bi bi-check-circle me-1"></i> All systems operational
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="border-top bg-white">
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 text-muted">
                © 2026 Echo. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-0 text-muted">
                Made with <span className="text-danger">❤️</span> for better communication
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
