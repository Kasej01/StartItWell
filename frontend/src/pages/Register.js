import React, { useState } from 'react';
import './styles/Register.css';

const Register = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTermsChange = e => {
    setAcceptedTerms(e.target.checked);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!acceptedTerms) {
      setError('You must accept the Terms and Conditions to register.');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setSuccess('Registration successful! You can now log in.');
        setForm({ first_name: '', last_name: '', email: '', password: '' });
        setAcceptedTerms(false);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <label htmlFor="first_name">First Name:</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="last_name">Last Name:</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div className="terms-container">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={handleTermsChange}
          />
          <label htmlFor="terms" className="terms-label">
            I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
          </label>
        </div>

        <button type="submit" disabled={!acceptedTerms}>Register</button>
        {error && <div className="register-error">{error}</div>}
        {success && <div className="register-success">{success}</div>}
      </form>
    </div>
  );
};

export default Register;