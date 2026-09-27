import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.message || 'Password reset email sent successfully.');
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card auth-form-card">
          <div className="auth-form-brand">
            <span className="auth-form-icon">
              <i className="bi bi-envelope-check-fill"></i>
            </span>
            <span className="auth-form-brand-text">Echo</span>
          </div>

          <h1 className="auth-title">Check your email</h1>
          <p className="auth-sub">We sent a password reset link to your email address.</p>

          <div className="alert auth-alert-info py-2" role="alert">
            <small>{message}</small>
          </div>

          <p className="auth-footnote mb-3">
            Check your inbox and spam folder, then follow the reset link to create a new password.
          </p>

          <Link to="/login" className="btn btn-echo-primary auth-submit-btn w-100 text-center text-decoration-none">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card auth-form-card">
        <div className="auth-form-brand">
          <span className="auth-form-icon">
            <i className="bi bi-key-fill"></i>
          </span>
          <span className="auth-form-brand-text">Echo</span>
        </div>

        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-sub">Enter your email and we will send you a reset link.</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2 auth-alert" role="alert">
              <small>{error}</small>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="email" className="form-label auth-form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="form-control auth-form-control"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-echo-primary auth-submit-btn w-100 mb-3">
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ms-2">Sending...</span>
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="text-center">
            <Link to="/login" className="auth-inline-link">
              <i className="bi bi-arrow-left me-1"></i>
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
