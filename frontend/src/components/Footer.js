import React from 'react';
import './styles/Footer.css';

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-main">
      <div className="footer-section">
        <h4>StartItWell</h4>
        <span>© {new Date().getFullYear()} StartItWell</span>
        <span>Made with <span style={{color: '#e53935'}}>♥</span> by Kase Johnson</span>
      </div>
      <div className="footer-section">
        <h5>Links</h5>
        <a href="/privacy" className="footer-link">Privacy Policy</a>
        <a href="/terms" className="footer-link">Terms of Service</a>
      </div>
      <div className="footer-section">
        <h5>Connect</h5>
        <a href="mailto:kasejohnson01@gmail.com" className="footer-link">Contact</a>
        <a href="https://github.com/Kasej01" className="footer-link" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </div>
  </footer>
);

export default Footer;