import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">StartItWell</Link>
      </div>
      <div className="navbar-right">
        <Link to="/login" className="navbar-login-btn">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;