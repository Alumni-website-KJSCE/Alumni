import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./AuthCallback.css";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, hasCompletedProfile, loading: authLoading } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle navigation after authentication is complete
  useEffect(() => {
    if (!authLoading && user && !loading) {
      if (!hasCompletedProfile) {
        navigate("/complete-profile");
      } else if (!user.isApproved) {
        navigate("/pending-approval");
      } else if (user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [authLoading, user, hasCompletedProfile, loading, navigate]);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (error) {
          setError(error);
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        if (!token) {
          setError("No authentication token found");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Use the centralized login method from AuthContext
        const success = await login(token);

        if (!success) {
          setError("Authentication failed. Please try again.");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // Authentication successful, navigation will be handled by the other useEffect
        setLoading(false);
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Authentication failed. Please try again.");
        setTimeout(() => navigate("/login"), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuth();
  }, [location, navigate, login]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          gap: "1rem",
          background: "var(--light-beige)",
        }}
      >
        <p style={{ color: "red" }}>{error}</p>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "1rem",
        background: "var(--light-beige)",
      }}
    >
      {loading && (
        <>
          <div
            className="spinner"
            style={{
              border: "4px solid rgba(0, 0, 0, 0.1)",
              borderRadius: "50%",
              borderTop: "4px solid var(--primary-red)",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p style={{ color: "var(--dark-red)", fontWeight: "500" }}>
            Completing login... Please wait.
          </p>
        </>
      )}
    </div>
  );
};

export default AuthCallback;
