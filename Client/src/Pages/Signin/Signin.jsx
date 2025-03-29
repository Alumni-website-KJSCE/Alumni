import React, { useState } from 'react';
import axios from 'axios';
import './Signin.css'; 
import { useNavigate } from 'react-router-dom';

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/signin', { email, password })
      .then(() => {
        setSuccessMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch(error => {
        console.error(error);
        setErrorMessage("An error occurred. Please try again.");
      });
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Create an Account</h2>
        <p>Sign up to join our network</p>
        <form onSubmit={handleSubmit}> 
          <div className="input-field">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>
          <div className="input-field">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>
          <button type="submit">Sign Up</button>
          <a href="/login" className="forgot-password">Log In</a>
        </form>
        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
}

export default Signin;
