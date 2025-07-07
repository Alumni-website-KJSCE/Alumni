import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosConfig";
import axiosInstance from "../../utils/axiosConfig";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import "../Auth/Auth.css"; // Import base Auth styling
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false); // Check if user is already logged in
  useEffect(() => {
    // If user is already logged in, redirect based on their role
    if (user) {
      if (user.isAdmin) {
        navigate("/admin");
      } else {
        // Regular user or alumni trying to access admin login - redirect to home
        navigate("/");
      }
    }
  }, [navigate, user]);

  // Handle navigation after successful login
  useEffect(() => {
    if (loginSuccess && !authLoading && user) {
      if (user.isAdmin) {
        navigate("/admin");
      } else {
        setError("This account does not have admin privileges");
        setLoginSuccess(false);
      }
    }
  }, [loginSuccess, authLoading, user, navigate]);
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setFormSubmitted(true);

    try {
      const response = await axiosInstance.post("/api/admin/login", {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Ensure user is admin before proceeding
      if (!userData.isAdmin) {
        setError("This account does not have admin privileges");
        setIsLoading(false);
        return;
      }

      // Use the AuthContext login method to properly authenticate
      const success = await login(token);

      if (success) {
        setLoginSuccess(true);
        // Navigation will be handled by the useEffect watching loginSuccess
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="auth-form admin-form">
        <div className="admin-header">
          <div className="admin-icon">🔐</div>
          <h2>Admin Portal</h2>
          <p>Secure access to administrative functions</p>
        </div>

        <form onSubmit={handleAdminLogin}>
          <div className="input-field">
            <input
              id="admin-email"
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={formSubmitted && !email ? "error" : ""}
              autoComplete="email"
            />
            <label htmlFor="admin-email">Email Address</label>
          </div>

          <div className="input-field">
            <input
              id="admin-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={formSubmitted && !password ? "error" : ""}
              autoComplete="current-password"
            />
            <label htmlFor="admin-password">Password</label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="auth-button admin-login-button"
          >
            {isLoading ? "Authenticating..." : "Access Admin Portal"}
          </button>
        </form>

        <div className="admin-security-notice">
          <p>
            <strong>Security Notice:</strong> This area is restricted to
            authorized administrators only. All access attempts are logged and
            monitored.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
