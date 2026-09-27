import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, initializeAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/chat');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-form-card">
        <div className="auth-form-brand">
          <span className="auth-form-icon">
            <i className="bi bi-chat-dots-fill"></i>
          </span>
          <span className="auth-form-brand-text">Echo</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to continue your conversations.</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2 auth-alert" role="alert">
              <small>{error}</small>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="email" className="form-label auth-form-label">
              Email or Username
            </label>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
              required
              className="form-control auth-form-control"
              placeholder="Enter your email or username"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="form-label auth-form-label">
              Password
            </label>
            <div className="input-group auth-input-group">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="form-control auth-form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn btn-outline-secondary auth-form-toggle"
                onClick={togglePasswordVisibility}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-3 text-end">
            <Link to="/forgot-password" className="auth-inline-link">
              Forgot your password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn btn-echo-primary auth-submit-btn w-100">
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ms-2">Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>

          <p className="auth-footnote text-center">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
