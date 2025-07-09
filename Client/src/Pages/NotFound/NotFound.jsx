import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content modern-card">
        <div className="not-found-icon">
          <span className="error-code">404</span>
        </div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="modern-button primary-btn">
            <span>🏠</span> Go Home
          </Link>
          <Link to="/auth" className="modern-button secondary-btn">
            <span>🔐</span> Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
