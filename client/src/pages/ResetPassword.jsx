import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, formData.password, formData.confirmPassword);
      setSuccess(true);
      window.setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card auth-form-card">
          <div className="auth-form-brand">
            <span className="auth-form-icon">
              <i className="bi bi-shield-check"></i>
            </span>
            <span className="auth-form-brand-text">Echo</span>
          </div>

          <h1 className="auth-title">Password Reset Complete</h1>
          <p className="auth-sub">Your password has been updated. Redirecting you to sign in.</p>

          <div className="alert auth-alert-info py-2" role="alert">
            <small>Password reset successfully.</small>
          </div>

          <Link to="/login" className="btn btn-echo-primary auth-submit-btn w-100 text-center text-decoration-none">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const passwordsMatch =
    formData.confirmPassword.length === 0 || formData.password === formData.confirmPassword;

  return (
    <div className="auth-container">
      <div className="auth-card auth-form-card auth-form-card-wide">
        <div className="auth-form-brand">
          <span className="auth-form-icon">
            <i className="bi bi-shield-lock-fill"></i>
          </span>
          <span className="auth-form-brand-text">Echo</span>
        </div>

        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-sub">Create a secure password for your account.</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger py-2 auth-alert" role="alert">
              <small>{error}</small>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="password" className="form-label auth-form-label">
              New Password
            </label>
            <div className="input-group auth-input-group">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="form-control auth-form-control"
                placeholder="Enter your new password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn btn-outline-secondary auth-form-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label auth-form-label">
              Confirm New Password
            </label>
            <div className="input-group auth-input-group">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="form-control auth-form-control"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn btn-outline-secondary auth-form-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {formData.confirmPassword && (
              <small className={`auth-helper-text ${passwordsMatch ? 'text-success' : 'text-danger'}`}>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="btn btn-echo-primary auth-submit-btn w-100 mb-3"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ms-2">Resetting...</span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center">
            <Link to="/login" className="auth-inline-link">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
