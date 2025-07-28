import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import confetti from 'canvas-confetti';

window.confetti = confetti;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);