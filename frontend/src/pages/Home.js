import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import Dashboard from '../components/Dashboard';


const Home = () => {
  const navigate = useNavigate();
const { user, token, logout } = useContext(AuthContext);

  return (
    <div className="home-container">
    {user ? (
      <Dashboard user={user} token={token} />
    ) : (
      <>
      {/* Hero Section */}
        <header className="home-header">
          <h1>
            Welcome to <span className="highlight">StartItWell</span>!
          </h1>
          <p className="slogan">
            "You only get to start today once, so <span className="highlight">startitwell</span>."
          </p>
        </header>

        {/* Features Section */}
        <section className="features-section section">
          <h2>Why StartItWell?</h2>
          <div className="features-list">
            <div className="feature-card">
              <span role="img" aria-label="Checklist" className="feature-icon">✅</span>
              <h4>To-Do List</h4>
              <p>Stay on top of your tasks and boost productivity every day.</p>
            </div>
            <div className="feature-card">
              <span role="img" aria-label="Calendar" className="feature-icon">📅</span>
              <h4>Calendar</h4>
              <p>Never miss an event or deadline with your personal calendar widget.</p>
            </div>
            <div className="feature-card">
              <span role="img" aria-label="Motivation" className="feature-icon">💡</span>
              <h4>Motivation</h4>
              <p>Get inspired with daily motivational quotes and messages.</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="app-details section">
          <h2>About the App</h2>
          <p>
            StartItWell is your personal dashboard to kickstart your day. Customize your experience with widgets like a to-do list, calendar, and motivational messages.
            Stay organized, stay inspired, and make every day count!
          </p>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section section">
          <h3>Ready to Start?</h3>
          <p>Sign up or log in to begin your journey!</p>
          <div className="cta-buttons">
            <button className="btn btn-register" onClick={() => navigate('/register')}>
              Register
            </button>
            <button className="btn btn-login" onClick={() => navigate('/login')}>
              Login
            </button>
          </div>
        </section>
        </>
      )}
    </div>
  );
};

export default Home;