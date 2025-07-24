import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Login.css';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const isFormValid = form.email.trim() !== '' && form.password.trim() !== '';

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        login(data.user, data.token);
        navigate('/');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
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
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <span
            className="show-password-icon"
            onClick={toggleShowPassword}
            tabIndex={0}
            role="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{ userSelect: "none" }}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="submit" disabled={!isFormValid}>
          Login
        </button>
        {error && <div className="login-error">{error}</div>}
      </form>
      <div className="login-switch">
        Don't have an account?{' '}
        <Link to="/register" className="login-switch-link">
          Sign up instead
        </Link>
      </div>
    </div>
  );
};

export default Login;