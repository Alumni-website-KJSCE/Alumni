import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import "./Navbar.css";
import { User, Shield, Edit, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive state from AuthContext
  const isLoggedIn = !!user;
  const isAdmin = user?.isAdmin || false;
  const userName = user?.name || "";

  useEffect(() => {
    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Close mobile menu on escape key
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);

    // Clean up event listeners
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const handleLogout = () => {
    setShowDropdown(false);
    setMobileMenuOpen(false);
    logout(); // Use the logout from AuthContext
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close menu when clicking on overlay
  const handleOverlayClick = () => {
    setMobileMenuOpen(false);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside in mobile
  const handleMobileMenuItemClick = () => {
    setMobileMenuOpen(false);
    setShowDropdown(false);
  };

  return (
    <div>
      <nav className={`main-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          <img src={logo} alt="KJSCE Logo" />
        </div>

        {/* Hamburger Menu Button */}
        <button
          className={`hamburger-button ${mobileMenuOpen ? "is-active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setMobileMenuOpen(!mobileMenuOpen);
            }
            if (e.key === "Escape" && mobileMenuOpen) {
              setMobileMenuOpen(false);
            }
          }}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? (
            <X size={24} className="hamburger-icon" />
          ) : (
            <Menu size={24} className="hamburger-icon" />
          )}
          <span className="visually-hidden">Menu</span>
        </button>

        {/* Desktop and Mobile Menu */}
        <div
          id="mobile-menu"
          className={`menu ${mobileMenuOpen ? "mobile-menu-open" : ""}`}
          role="navigation"
          aria-hidden={!mobileMenuOpen}
          tabIndex={mobileMenuOpen ? 0 : -1}
        >
          {" "}
          <ul className="nav-links" role="menubar">
            <li role="none">
              <Link to="/" onClick={handleMobileMenuItemClick} role="menuitem">
                Home
              </Link>
            </li>
            <li role="none">
              <Link
                to="/careers"
                onClick={handleMobileMenuItemClick}
                role="menuitem"
              >
                Careers
              </Link>
            </li>
            <li role="none">
              <Link
                to="/newsletter"
                onClick={handleMobileMenuItemClick}
                role="menuitem"
              >
                Newsletter
              </Link>
            </li>
            <li role="none">
              <Link
                to="/alumni"
                onClick={handleMobileMenuItemClick}
                role="menuitem"
              >
                Alumni
              </Link>
            </li>
            <li role="none">
              <Link
                to="/alumni-visits"
                onClick={handleMobileMenuItemClick}
                role="menuitem"
              >
                Alumni Visits
              </Link>
            </li>
            <li role="none">
              <Link
                to="/events"
                onClick={handleMobileMenuItemClick}
                role="menuitem"
              >
                Events
              </Link>
            </li>
          </ul>
          {isLoggedIn ? (
            <ul className="user-menu">
              <li>
                <button className="user-button" onClick={toggleDropdown}>
                  <User size={18} className="user-icon" />
                  <span>{userName}</span>
                </button>{" "}
                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={handleMobileMenuItemClick}
                    >
                      <Edit size={16} className="dropdown-icon" />
                      <span>My Profile</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="dropdown-item"
                        onClick={handleMobileMenuItemClick}
                      >
                        <Shield size={16} className="dropdown-icon" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button className="dropdown-item" onClick={handleLogout}>
                      <LogOut size={16} className="dropdown-icon" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </li>
              <li>
                <ThemeToggle variant="navbar" />
              </li>
            </ul>
          ) : (
            <ul className="auth-links">
              <li style={{ marginTop: "10px" }}>
                <Link
                  to="/auth"
                  onClick={handleMobileMenuItemClick}
                  className="auth-btn"
                >
                  Login / Sign Up
                </Link>
              </li>
              <li>
                <ThemeToggle variant="navbar" />
              </li>
            </ul>
          )}
        </div>

        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu-overlay"
            onClick={handleOverlayClick}
          ></div>
        )}
      </nav>
    </div>
  );
}
