import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import googleIcon from "../../assets/images/logo_google_g_icon.svg";
import "./Auth.css";

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const checkProfileCompletion = useCallback(
    async (token) => {
      try {
        const response = await axiosInstance.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = response.data;
        const requiredFields = [
          "branch",
          "highestQualification",
          "graduationYear",
        ];
        const hasIncompleteProfile =
          !user.isAdmin && requiredFields.some((field) => !user[field]);

        if (hasIncompleteProfile) {
          navigate("/complete-profile");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        setErrorMessage("Failed to verify profile status");
      }
    },
    [navigate, setErrorMessage],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const signup = params.get("signup");

    if (token) {
      localStorage.setItem("token", token);
      checkProfileCompletion(token);
    }

    if (signup) {
      setIsLogin(false);
    }
  }, [location, checkProfileCompletion]);

  const handleGoogleSignIn = () => {
    window.location.href = "/auth/google";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (isLogin) {
        const response = await axiosInstance.post("/api/login", {
          email,
          password,
        });
        const { token } = response.data;
        localStorage.setItem("token", token);
        await checkProfileCompletion(token);
      } else {
        await axiosInstance.post("/api/signin", { email, password });
        setSuccessMessage("Account created successfully!");
        setIsLogin(true);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again.",
      );
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p>
          {isLogin ? "Sign in to your account" : "Sign up to join our network"}
        </p>

        <button className="google-auth-button" onClick={handleGoogleSignIn}>
          <img
            src={googleIcon}
            style={{ width: "20px", height: "20px", marginRight: "12px" }}
            alt="Google logo"
          />
          Continue with Google
        </button>

        {/* <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              type="email"
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

          <button type="submit">
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="switch-auth">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            className="switch-button"
            style={{ height: "40px" }}
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage("");
              setSuccessMessage("");
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p> */}

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
}

export default Auth;
