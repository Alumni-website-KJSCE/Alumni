import React from "react";
import "./Footer.css";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>About KJSCE Alumni</h3>
          <p>
            Connecting graduates across generations to build a thriving
            community that supports both alumni and current students through
            networking, mentorship, and professional development opportunities.
          </p>
          <div className="social-icons">
            <a href="https://facebook.com" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="https://instagram.com" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/events">Events</a>
            </li>
            <li>
              <a href="/careers">Careers</a>
            </li>
            <li>
              <a href="/alumni-visits">Alumni Visits</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul className="contact-info">
            <li>
              <Mail size={16} />
              <a href="mailto:alumni@kjsce.edu.in">alumni@kjsce.edu.in</a>
            </li>
            <li>
              <Phone size={16} />
              <a href="tel:+911234567890">+91 12345 67890</a>
            </li>
            <li>
              <MapPin size={35} />
              <span>
                K.J. Somaiya College of Engineering, Vidyavihar, Mumbai
              </span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Stay Connected</h3>
          <p>Keep up with the latest alumni news and opportunities</p>
          <div className="stay-connected-links">
            <a href="/newsletter" className="newsletter-btn">
              Newsletter
            </a>
            <a href="/alumni" className="footer-highlight-link">
              Alumni Directory
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>
            &copy; {currentYear} KJSCE Alumni Association. All rights reserved.
          </p>
          <ul className="footer-links horizontal">
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms">Terms of Service</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
