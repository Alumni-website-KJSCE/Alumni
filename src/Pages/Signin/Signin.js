import React from 'react';
import './Signin.css'; // Import the CSS file for styling

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
          <div className="input-field">
            <input type="password" required />
            <label>Confirm Password</label>
          </div>
          <button type="submit">Sign In</button>
          <a href="http://localhost:3000/login" className="forgot-password">Log in</a>
          <a href="#" className="forgot-password">Forgot password?</a>
        </form>
      </div>
    </div>
  );
};

export default Login;
