import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaMapLocation,
  FaBuilding,
  FaMoneyBillWave,
  FaClock,
  FaLocationDot,
  FaCalendarDays,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { FaGlobe } from "react-icons/fa";
import "./career.css"; // Import the CSS file for styling
import axiosInstance from "../../utils/axiosConfig"; // Use the configured axios instance
import JobPostForm from "../../components/JobPostForm/JobPostForm";
import JobFilter from "../../components/JobFilter/JobFilter";
import EditJobForm from "../../components/EditJobForm/EditJobForm";
import { useAuth } from "../../contexts/AuthContext";
import useScreenSize from "../../hooks/useScreenSize";

const Career = () => {
  const { user } = useAuth(); // Use AuthContext instead of localStorage
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMobile } = useScreenSize();
  const [activeTab, setActiveTab] = useState("opportunities");
  const [allOpportunities, setAllOpportunities] = useState([]); // Store all opportunities (jobs + internships)
  const [filteredOpportunities, setFilteredOpportunities] = useState([]); // Store filtered opportunities
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    jobType: "",
    jobMode: "",
  });

  const [isUserApprovedForPosting, setIsUserApprovedForPosting] =
    useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  // Derive state from AuthContext
  const isLoggedIn = !!user;
  const userId = user?._id;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Filter function
  const filterOpportunities = (opportunities, filters) => {
    return opportunities.filter((opportunity) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          opportunity.role,
          opportunity.company,
          opportunity.description,
          opportunity.location,
        ].map((field) => (field || "").toLowerCase());

        if (!searchableFields.some((field) => field.includes(searchTerm))) {
          return false;
        }
      }

      // Job type filter
      if (filters.jobType && opportunity.jobType !== filters.jobType) {
        return false;
      } // Job mode filter
      if (filters.jobMode && opportunity.jobMode !== filters.jobMode) {
        return false;
      }

      return true;
    });
  };

  // Apply filters using useMemo for performance
  const filteredOpportunitiesData = useMemo(() => {
    return filterOpportunities(allOpportunities, filters);
  }, [allOpportunities, filters]);

  // Update displayed data when filters change
  useEffect(() => {
    setFilteredOpportunities(filteredOpportunitiesData);
  }, [filteredOpportunitiesData]);

  // Filter handlers
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };
  const handleClearFilters = () => {
    setFilters({
      search: "",
      jobType: "",
      jobMode: "",
    });
  };

  // Edit job handlers
  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowEditForm(true);
  };

  const handleJobUpdated = (updatedJob) => {
    // Update the job in the opportunities list
    setAllOpportunities((prev) =>
      prev.map((opportunity) =>
        opportunity._id === updatedJob._id ? updatedJob : opportunity,
      ),
    );

    setShowEditForm(false);
    setEditingJob(null);
    setSuccessMessage("Job updated successfully!");

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingJob(null);
  };

  // Handle apply now button click
  const handleApplyNow = (applyLink) => {
    if (!applyLink) {
      console.error('No application link provided');
      return;
    }
    
    // Clean the link - remove extra whitespace
    const cleanLink = applyLink.trim();
    
    // Check if it's an email address (more comprehensive regex)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (emailRegex.test(cleanLink)) {
      // It's an email - open email client with mailto
      window.location.href = `mailto:${cleanLink}`;
    } else {
      // It's a URL - open in new tab
      let url = cleanLink;
      
      // Check if URL already has a protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Add https:// if no protocol is specified
        url = `https://${url}`;
      }
      
      try {
        // Validate URL before opening
        new URL(url);
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Invalid URL:', url);
        // Fallback: try to open it anyway, browser will handle it
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Handle success message from URL params (when returning from post job page)
  useEffect(() => {
    if (searchParams.get("posted") === "true") {
      setSuccessMessage(
        "Job posted successfully! It will be visible after admin approval.",
      );
      setTimeout(() => {
        setSuccessMessage("");
        // Clean up URL
        navigate("/careers", { replace: true });
      }, 5000);
    }
  }, [searchParams, navigate]);

  // Handle post job button click - responsive behavior
  const handlePostJobClick = () => {
    if (isMobile) {
      // On mobile, navigate to dedicated page
      navigate("/careers/post-job");
    } else {
      // On larger screens, show modal
      setShowJobForm(true);
    }
  };

  // Effect for fetching profile and determining approval status
  useEffect(() => {
    if (user) {
      setIsUserApprovedForPosting(user.isApproved || false);
    } else {
      setIsUserApprovedForPosting(false);
    }
    setProfileLoaded(true);
  }, [user]); // Re-run when user changes

  // Effect for fetching jobs, depends on profileLoaded
  useEffect(() => {
    // If user is logged in and profile isn't loaded yet, keep showing loading.
    // If not logged in, profileLoaded will be true by the first effect, so this won't block.
    if (user && !profileLoaded) {
      setIsLoading(true); // Ensure loading is true while waiting for profile
      return; // Wait for profile to load
    }

    setIsLoading(true); // Set loading true before fetching jobs
    setError(""); // Clear previous errors

    const fetchJobsAndInternships = async () => {
      try {
        console.log("Fetching all opportunities with userId:", userId);

        // Fetch both jobs and internships in parallel
        const [jobsResponse, internshipsResponse] = await Promise.all([
          axiosInstance.get("/api/jobs?jobType=job"),
          axiosInstance.get("/api/jobs?jobType=internship"),
        ]);

        console.log("Jobs response:", jobsResponse.data);
        console.log("Internships response:", internshipsResponse.data);

        let jobs = [];
        if (jobsResponse.data && jobsResponse.data.jobs) {
          jobs = jobsResponse.data.jobs;
        } else if (Array.isArray(jobsResponse.data)) {
          jobs = jobsResponse.data;
        }

        let internships = [];
        if (internshipsResponse.data && internshipsResponse.data.jobs) {
          internships = internshipsResponse.data.jobs;
        } else if (Array.isArray(internshipsResponse.data)) {
          internships = internshipsResponse.data;
        }

        // Combine all opportunities
        const allOpps = [...jobs, ...internships];
        setAllOpportunities(allOpps);
        setFilteredOpportunities(allOpps);

        // Only show approval error if logged in, profile is loaded, and not approved for posting
        if (user && profileLoaded && !isUserApprovedForPosting) {
          setError(
            "Your account is pending approval. You can view jobs but cannot post new ones.",
          );
        }
      } catch (fetchError) {
        console.error("Error fetching jobs:", fetchError);
        setError("Failed to fetch jobs. Please try again later.");
      }
    };

    fetchJobsAndInternships().finally(() => {
      setIsLoading(false);
    });
  }, [profileLoaded, isUserApprovedForPosting, user, userId]); // Re-run if profileLoaded, approval status, or user changes

  // Handle job posting
  const handleJobPosted = () => {
    setShowJobForm(false);
    setSuccessMessage(
      "Job posted successfully! It will be visible after admin approval.",
    );

    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  // Handle job deletion
  const handleDeleteJob = async (jobId, jobType) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      setError("");

      await axiosInstance.delete(`/api/jobs/${jobId}`);

      // Update the opportunities list
      setAllOpportunities((prev) =>
        prev.filter((opportunity) => opportunity._id !== jobId),
      );
      setFilteredOpportunities((prev) =>
        prev.filter((opportunity) => opportunity._id !== jobId),
      );

      setSuccessMessage("Job deleted successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error deleting job:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete job. Please try again.",
      );
    }
  };

  // City data
  const citiesData = [
    { city: "Bangalore", alumniCount: 7687 },
    { city: "Hyderabad", alumniCount: 4877 },
    { city: "Mumbai", alumniCount: 3100 },
    { city: "Delhi", alumniCount: 2450 },
    { city: "Pune", alumniCount: 1980 },
  ];

  // Conditional rendering for top-level error (excluding the pending approval message)
  if (
    error &&
    error !==
      "Your account is pending approval. You can view jobs but cannot post new ones."
  ) {
    console.log("Top-level error:", error);
    return (
      <div className="career-container">
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      </div>
    );
  }

  // Debug: Log user and approval status before rendering
  console.log("Render Career: user:", user);
  console.log("Render Career: isLoggedIn:", isLoggedIn);
  console.log(
    "Render Career: isUserApprovedForPosting:",
    isUserApprovedForPosting,
  );
  console.log("Render Career: showJobForm:", showJobForm);
  console.log(
    "Render Career: token in localStorage:",
    localStorage.getItem("token") ? "present" : "missing",
  );

  return (
    <div className="page-container">
      {/* Success Message */}
      {successMessage && (
        <div className="success-message" role="alert">
          {successMessage}
        </div>
      )}

      {/* Job Posting Form Modal - Only show on larger screens */}
      {showJobForm && !isMobile && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay") {
              setShowJobForm(false);
              console.log("Modal closed by overlay click");
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-form-title"
        >
          {console.log("JobPostForm modal opened")}
          <JobPostForm
            style={{ width: "fit-content" }}
            onJobPosted={() => {
              handleJobPosted();
              console.log("Job posted successfully (handleJobPosted called)");
            }}
            onCancel={() => {
              setShowJobForm(false);
              console.log("JobPostForm cancelled");
            }}
          />
        </div>
      )}

      {/* Edit Job Form Modal */}
      {showEditForm && editingJob && (
        <EditJobForm
          jobData={editingJob}
          onJobUpdated={handleJobUpdated}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Main Content */}
      <section className="section" aria-label="careers section">
        {/* Hero Section */}
        <div className="career-hero">
          <h1>Career Opportunities</h1>
          <p>
            Find your next career opportunity or share job openings with the
            alumni community
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-container">
          <nav className="tabs" role="tablist" aria-label="career sections">
            <button
              role="tab"
              aria-selected={activeTab === "opportunities"}
              aria-controls="opportunities-panel"
              className={`tab ${activeTab === "opportunities" ? "active" : ""}`}
              onClick={() => handleTabClick("opportunities")}
              id="opportunities-tab"
            >
              All Opportunities
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "alumni-map"}
              aria-controls="alumni-map-panel"
              className={`tab ${activeTab === "alumni-map" ? "active" : ""}`}
              onClick={() => handleTabClick("alumni-map")}
              id="alumni-map-tab"
            >
              Alumni Map
            </button>
          </nav>

          {/* Post Job Button */}
          {isLoggedIn && isUserApprovedForPosting && !showJobForm && (
            <div className="post-job-button-container">
              <button
                className="post-job-button"
                onClick={handlePostJobClick}
                aria-label="Post a new job or internship"
              >
                <FaPlus className="post-icon" aria-hidden="true" /> Post a
                Job/Internship
              </button>
            </div>
          )}

          {/* Message States */}
          {successMessage && (
            <div className="success-message" role="alert" aria-live="polite">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="error-state" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {/* Job Filter Component */}
          <JobFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            jobCounts={{
              total: filteredOpportunities.length,
            }}
          />

          {/* All Opportunities Tab Panel */}
          <div
            role="tabpanel"
            id="opportunities-panel"
            aria-labelledby="opportunities-tab"
            hidden={activeTab !== "opportunities"}
          >
            <div className="opportunities-container">
              <div className="section-header">
                <h2 className="section-title">All Career Opportunities</h2>
                {filteredOpportunities && filteredOpportunities.length > 0 && (
                  <button
                    className="view-all-button"
                    aria-label="View all opportunities"
                  >
                    View All ({filteredOpportunities.length})
                  </button>
                )}
              </div>

              {isLoading ? (
                <div
                  className="loading-container"
                  role="status"
                  aria-live="polite"
                >
                  <div className="loading-spinner" aria-hidden="true"></div>
                  <p>Loading opportunities...</p>
                </div>
              ) : filteredOpportunities &&
                filteredOpportunities.length === 0 ? (
                <div className="no-jobs-message" role="status">
                  <p>No opportunities available at the moment.</p>
                  {isLoggedIn && !error && (
                    <p>Be the first to post an opportunity!</p>
                  )}
                </div>
              ) : (
                <div className="job-cards" role="list">
                  {filteredOpportunities &&
                    filteredOpportunities.map((opportunity, index) => {
                      console.log("=== OPPORTUNITY OWNERSHIP DEBUG ===");
                      console.log("Opportunity data:", opportunity);
                      console.log(
                        "Opportunity postedBy:",
                        opportunity.postedBy,
                      );
                      console.log(
                        "Opportunity postedBy type:",
                        typeof opportunity.postedBy,
                      );
                      console.log("Current user from AuthContext:", user);
                      console.log("Current userId from AuthContext:", userId);
                      console.log("Current userId type:", typeof userId);

                      if (
                        opportunity.postedBy &&
                        typeof opportunity.postedBy === "object" &&
                        opportunity.postedBy._id
                      ) {
                        console.log("postedBy._id:", opportunity.postedBy._id);
                        console.log(
                          "postedBy._id type:",
                          typeof opportunity.postedBy._id,
                        );
                        console.log(
                          "postedBy._id toString():",
                          opportunity.postedBy._id.toString(),
                        );
                      }

                      const isOwner =
                        opportunity.postedBy &&
                        userId &&
                        ((typeof opportunity.postedBy === "object" &&
                          opportunity.postedBy._id &&
                          opportunity.postedBy._id.toString() ===
                            userId.toString()) ||
                          (typeof opportunity.postedBy === "string" &&
                            opportunity.postedBy === userId.toString()));
                      console.log("Is owner result:", isOwner);
                      console.log("=== END DEBUG ===");

                      return (
                        <div
                          key={opportunity._id || index}
                          className="job-card"
                        >
                          {/* Job Type Badge */}
                          <div className="job-type-badge">
                            {opportunity.jobType === "job"
                              ? "Job"
                              : "Internship"}
                          </div>

                          {/* Job Management Options */}
                          {isOwner && (
                            <div className="job-management">
                              <button
                                className="edit-job-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditJob(opportunity);
                                }}
                                title={`Edit ${opportunity.jobType}`}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="delete-job-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteJob(
                                    opportunity._id,
                                    opportunity.jobType,
                                  );
                                }}
                                title={`Delete ${opportunity.jobType}`}
                              >
                                <FaTrash style={{ color: "red" }} />
                              </button>
                            </div>
                          )}

                          <h3 className="job-title">{opportunity.role}</h3>
                          <p className="job-company">{opportunity.company}</p>
                          <p className="job-description">
                            {opportunity.description}
                          </p>

                          <div className="job-details">
                            <div className="job-detail">
                              <FaMoneyBillWave className="job-icon" />
                              <span>{opportunity.pay}</span>
                            </div>
                            <div className="job-detail">
                              <FaClock className="job-icon" />
                              <span>
                                {opportunity.jobType === "internship"
                                  ? `Duration: ${opportunity.duration}`
                                  : `Experience: ${opportunity.experience}`}
                              </span>
                            </div>
                            <div className="job-detail">
                              <FaLocationDot className="job-icon" />
                              <span>{opportunity.location}</span>
                            </div>
                            <div className="job-detail">
                              <FaCalendarDays className="job-icon" />
                              <span>Apply by: {opportunity.applyBy}</span>
                            </div>
                            <div className="job-detail">
                              <FaGlobe className="job-icon" />
                              <span>Mode: {opportunity.jobMode}</span>
                            </div>
                          </div>

                          <div className="job-actions">
                            <button
                              onClick={() => handleApplyNow(opportunity.applyLink)}
                              className="apply-button"
                            >
                              Apply Now
                            </button>
                            {isOwner && (
                              <div className="posted-by-badge">
                                Created by you
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Alumni Map Tab Panel */}
          <div
            role="tabpanel"
            id="alumni-map-panel"
            aria-labelledby="alumni-map-tab"
            hidden={activeTab !== "alumni-map"}
          >
            <div className="alumni-map-container">
              <h2 className="section-title">
                Top Cities Where Our Alumni Work
              </h2>

              <div className="city-list">
                {citiesData.map((city, index) => (
                  <div key={index} className="city-item">
                    <div className="city-icon-container">
                      <FaMapLocation className="city-icon" />
                    </div>
                    <div className="city-info">
                      <span className="city-name">{city.city}</span>
                      <span className="alumni-count">
                        {city.alumniCount}+ alumni
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="view-map-button">View Full Map</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Career;
