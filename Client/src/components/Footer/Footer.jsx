import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About</h3>
          <p>lorem ipsum</p>
        </div>
        <div className="footer-section">
          <h3>Explore</h3>
          <ul className="footer-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">Events</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Newsletter</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul className="footer-links">
            <li>Email: alumni@kjsce.com</li>
            <li>Phone: +1234567890</li>
            <li><a href="#">Contact Form</a></li>
          </ul>
        </div>
      </div>
      <hr />
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} KJSCE. All rights reserved.</p>
        <ul className="footer-links">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Contact Us</a></li>
        </ul>
      </div>
    </footer>
  );
}
