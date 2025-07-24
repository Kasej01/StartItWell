import React from 'react';
import './styles/Register.css';

const Register = () => {
  return (
    <div className="register-container">
      <h1>Register</h1>
      <form className="register-form">
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" required />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;