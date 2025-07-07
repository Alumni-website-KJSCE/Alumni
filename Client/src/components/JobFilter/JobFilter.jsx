import React, { useState } from "react";
import { FaFilter, FaTimes, FaSearch } from "react-icons/fa";
import "./JobFilter.css";

const JobFilter = ({ filters, onFiltersChange, onClearFilters, jobCounts }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const jobTypes = [
    { value: "job", label: "Jobs" },
    { value: "internship", label: "Internships" },
  ];
  const jobModes = [
    { value: "Remote", label: "Remote" },
    { value: "Onsite", label: "On-site" },
    { value: "Hybrid", label: "Hybrid" },
  ];
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };

    if (filterType === "search") {
      newFilters.search = value;
    } else if (filterType === "jobType") {
      newFilters.jobType = newFilters.jobType === value ? "" : value;
    } else if (filterType === "jobMode") {
      newFilters.jobMode = newFilters.jobMode === value ? "" : value;
    }

    onFiltersChange(newFilters);
  };
  const hasActiveFilters = filters.search || filters.jobType || filters.jobMode;

  return (
    <div className="job-filter">
      <div className="filter-header">
        <div className="filter-toggle">
          <button
            className={`filter-button ${isExpanded ? "expanded" : ""}`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="filter-content"
          >
            <FaFilter className="filter-icon" />
            <span>Filters</span>{" "}
            {hasActiveFilters && (
              <span className="filter-count">
                {
                  [filters.search, filters.jobType, filters.jobMode].filter(
                    Boolean,
                  ).length
                }
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              className="clear-filters-button"
              onClick={onClearFilters}
              title="Clear all filters"
            >
              <FaTimes />
              <span>Clear All</span>
            </button>
          )}
        </div>

        <div className="job-counts">
          {jobCounts && (
            <span className="results-count">
              {jobCounts.total}{" "}
              {jobCounts.total === 1 ? "opportunity" : "opportunities"} found
            </span>
          )}
        </div>
      </div>

      <div
        className={`filter-content ${isExpanded ? "expanded" : ""}`}
        id="filter-content"
      >
        {/* Search Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <FaSearch className="search-icon" />
            Search Opportunities
          </label>
          <input
            type="text"
            className="search-input"
            placeholder="Search by job title, company, or keywords..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        {/* Job Type Filter */}
        <div className="filter-group">
          <label className="filter-label">Type</label>
          <div className="filter-options">
            {jobTypes.map((type) => (
              <button
                key={type.value}
                className={`filter-option ${filters.jobType === type.value ? "active" : ""}`}
                onClick={() => handleFilterChange("jobType", type.value)}
              >
                {type.label}{" "}
              </button>
            ))}
          </div>
        </div>

        {/* Job Mode Filter */}
        <div className="filter-group">
          <label className="filter-label">Work Mode</label>
          <div className="filter-options">
            {jobModes.map((mode) => (
              <button
                key={mode.value}
                className={`filter-option ${filters.jobMode === mode.value ? "active" : ""}`}
                onClick={() => handleFilterChange("jobMode", mode.value)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFilter;
