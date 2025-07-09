import React from "react";
import { Link } from "react-router-dom";
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
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/events">Events</Link>
            </li>
            <li>
              <Link to="/careers">Careers</Link>
            </li>
            <li>
              <Link to="/alumni-visits">Alumni Visits</Link>
            </li>
            <li>
              <Link to="/contact-us">Contact Us</Link>
            </li>
            <li>
              <Link to="/credits">Credits</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul className="contact-info">
            <li>
              <Mail size={16} />
              <a href="mailto:alumni.engg@somaiya.edu ">alumni@kjsce.edu.in</a>
            </li>
            <li>
              <Phone size={16} />
              <a href="tel:+91 98193 79529">+91 98193 79529</a>
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
            <Link to="/newsletter" className="newsletter-btn">
              Newsletter
            </Link>
            <Link to="/alumni" className="footer-highlight-link">
              Alumni Directory
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>
            &copy; {currentYear} KJSSE SwDC. All rights reserved.
          </p>
          <ul className="footer-links horizontal">
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
