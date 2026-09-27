import React, { useState } from 'react';
import { PlusIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.username.trim() && !formData.email.trim()) {
        throw new Error('Either username or email is required');
      }

      console.log('Submitting form:', formData);
      
      // Call backend API to add contact
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);

      const requestBody = {
        username: formData.username.trim() || undefined,
        email: formData.email.trim() || undefined,
        displayName: formData.displayName.trim() || undefined
      };

      console.log('Request body:', requestBody);

      // determine API base from Vite env or fall back to localhost:5000
      const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
        ? import.meta.env.VITE_API_URL
        : (window.__BACKEND_URL__ || 'http://localhost:5000');

      console.log('Using API base:', API_BASE);

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE.replace(/\/$/, '')}/api/contacts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      // parse response safely (handle non-JSON responses without crashing)
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.warn('Non-JSON response from server', text);
        data = { error: 'Server returned non-JSON response', raw: text };
      }
      console.log('Response data:', data);

      if (!response.ok) {
        const msg = data.error || data.message || `Failed to add contact (status ${response.status})`;
        // If server says user not found (404), show helpful message
        if (response.status === 404 || (msg && (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('does not exist')))) {
          console.log('⚠️ User not found on server:', requestBody);
          throw new Error('User not found. Please check the username or email and make sure the person has registered.');
        }
        throw new Error(msg);
      }

      console.log('Contact added successfully:', data.contact || data);
      // Ensure the contact has an ID
      const addedContact = data.contact || data || requestBody;
      if (!addedContact.id) {
        addedContact.id = addedContact._id || `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      console.log('Calling onAddUser with:', addedContact);
      // call onAddUser with returned contact or fallback to request body
      await onAddUser(addedContact);

      // Reset form
      setFormData({ username: '', email: '', displayName: '' });
      onClose();
    } catch (err) {
      console.error('Error adding contact:', err);
      // Provide more helpful message for network errors
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Failed to fetch — check backend is running and API URL is correct');
      } else {
        setError(err.message || 'Failed to add contact');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ zIndex: 10000, maxWidth: '600px', width: '95%', margin: '20px' }}>
        <div style={{ borderRadius: '15px', border: '3px solid #007ACC', backgroundColor: '#FFFFFF', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <div className="modal-header border-0" style={{ background: '#007ACC', padding: '20px 24px' }}>
            <h5 className="modal-title fw-bold" style={{color: '#FFFFFF', fontSize: '23px'}}>
              <UserPlusIcon className="h-5 w-5 me-2" style={{ display: 'inline', width: '27px', height: '27px' }} />
              Add New Contact
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {error && (
                <div className="alert fade show" role="alert" style={{backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA'}}>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError('')}
                  />
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="username" className="form-label fw-semibold" style={{fontSize: '18px'}}>
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #E2E8F0',
                    padding: '14px 16px',
                    fontSize: '19px'
                  }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold" style={{fontSize: '18px'}}>
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #E2E8F0',
                    padding: '14px 16px',
                    fontSize: '19px'
                  }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="displayName" className="form-label fw-semibold" style={{fontSize: '18px'}}>
                  Display Name <span className="text-muted">(optional)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Enter display name"
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #E2E8F0',
                    padding: '14px 16px',
                    fontSize: '19px'
                  }}
                />
              </div>

              <div className="text-muted small" style={{fontSize: '17px'}}>
                <i className="bi bi-info-circle me-1"></i>
                <strong>Note:</strong> Enter either username or email to find and add the person to your contacts.
              </div>
            </div>

            <div className="modal-footer border-0 p-4 pt-0">
              <button
                type="button"
                className="btn me-2"
                onClick={onClose}
                disabled={loading}
                style={{ 
                  borderRadius: '10px', 
                  padding: '12px 24px',
                  fontSize: '18px',
                  backgroundColor: '#F8FAFC',
                  color: '#475569',
                  border: '2px solid #E2E8F0'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn text-white"
                disabled={loading}
                style={{
                  background: '#007ACC',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 28px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-4 w-4 me-2" style={{ display: 'inline', width: '21px', height: '21px' }} />
                    Add Contact
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;