import React from 'react';
import './Login.css'; // Import the CSS file for styling

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Welcome Back</h2>
        <p>Please log in to your account</p>
        <form>
          <div className="input-field">
            <input type="text" required />
            <label>Email</label>
          </div>
          <div className="input-field">
            <input type="password" required />
            <label>Password</label>
          </div>
          <button type="submit">Log In</button>
          <a href="#" className="forgot-password">Forgot password?</a>
        </form>
      </div>
    </div>
  );
};

export default Login;

