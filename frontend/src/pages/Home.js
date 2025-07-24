import React from 'react';
import './styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to <span className="highlight">StartItWell</span>!</h1>
        <p className="slogan">"You only get to start today once, so startitwell."</p>
      </header>
      <section className="app-details">
        <h2>About the App</h2>
        <p>
          StartItWell is your personal dashboard to kickstart your day. Customize your experience with widgets like a to-do list, calendar, and motivational messages. 
          Stay organized, stay inspired, and make every day count!
        </p>
      </section>
      <section className="cta-section">
        <h3>Ready to Start?</h3>
        <p>Sign up or log in to begin your journey!</p>
        <div className="cta-buttons">
          <button className="btn btn-register">Register</button>
          <button className="btn btn-login">Login</button>
        </div>
      </section>
    </div>
  );
};

export default Home;