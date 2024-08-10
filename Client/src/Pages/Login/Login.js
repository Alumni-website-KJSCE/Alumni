import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; 
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/login', { email, password })
      .then(result => {
        console.log(result);
        if (result.data === "Login Success") {
          navigate('/');   
        }
      })
      .catch(error => console.log(error)); 
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome Back</h2>
        <p>Please log in to your account</p>
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
          <button type="submit">Log In</button>
          <a href="http://localhost:3000/signin" className="forgot-password">Sign in</a>
          <a href="#" className="forgot-password">Forgot password?</a>
        </form>
      </div>
    </div>
  );
}

export default Login;

