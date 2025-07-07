import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import axiosInstance, { setGlobalLogoutHandler } from "../utils/axiosConfig";

// Create context directly here to avoid circular dependencies
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  // Define logout function first
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setHasCompletedProfile(false);
    // Force page reload to clear all state
    window.location.href = "/auth";
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setHasCompletedProfile(false);
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get("/api/user/profile");
      const userData = response.data;

      if (!userData) {
        throw new Error("Invalid user data received");
      }

      setUser(userData);

      // Admin users automatically have complete profiles
      if (userData.isAdmin) {
        setHasCompletedProfile(true);
        setLoading(false);
        return;
      }

      // For regular users, check all required profile fields
      const requiredFields = [
        "branch",
        "highestQualification",
        "graduationYear",
        "attendanceProof",
      ];

      const isProfileComplete = requiredFields.every((field) => {
        const value = userData[field];
        const isPresent = value !== undefined && value !== null && value !== "";
        return isPresent;
      });

      setHasCompletedProfile(isProfileComplete);
    } catch (error) {
      console.error("Auth check failed:", error);

      if (error.response?.status === 401) {
        logout();
      } else {
        console.error("Network error during auth check:", error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);
  const login = async (token) => {
    try {
      localStorage.setItem("token", token);
      await checkAuth();
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      localStorage.removeItem("token");
      return false;
    }
  };

  // Register the logout handler with axios config
  useEffect(() => {
    setGlobalLogoutHandler(logout);
  }, [logout]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    hasCompletedProfile,
    loading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export { AuthProvider };
