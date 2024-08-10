import React, { useState } from 'react';
import axios from 'axios';
import './Signin.css'; 
import {useNavigate} from 'react-router-dom';


function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/signin', { email, password })
      .then(result => {console.log(result)
        navigate('/login');
      })
      .catch(error => console.log(error)); 
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome Back</h2>
        <p>Please Sign in to your account</p>
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
          <button type="submit">Sign In</button>
          <a href="#" className="forgot-password">Forgot password?</a>
        </form>
      </div>
    </div>
  );
}

export default Signin;
