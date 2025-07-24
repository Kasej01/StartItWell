import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navbar.css';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">StartItWell</Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <div className="user-dropdown-wrapper" ref={dropdownRef}>
            <img
              src="/User_Icon.svg"
              alt="User"
              className="user-icon"
              onClick={() => setDropdownOpen((open) => !open)}
              tabIndex={0}
              style={{ cursor: 'pointer', width: '2.2rem', height: '2.2rem', borderRadius: '50%' }}
            />
            {dropdownOpen && (
              <div className="user-dropdown-menu">
                <button onClick={() => { setDropdownOpen(false); navigate('/account'); }}>Account Details</button>
                <button onClick={() => { setDropdownOpen(false); navigate('/settings'); }}>Settings</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="navbar-login-btn">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;