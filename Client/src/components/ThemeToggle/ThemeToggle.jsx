import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import "./ThemeToggle.css";

const ThemeToggle = ({ className = "", variant = "default" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${variant} ${className}`}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          {isDarkMode ? (
            <Moon size={14} className="theme-icon" />
          ) : (
            <Sun size={14} className="theme-icon" />
          )}
        </div>
        <div className="theme-toggle-background">
          <Sun size={12} className="background-icon sun-icon" />
          <Moon size={12} className="background-icon moon-icon" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
