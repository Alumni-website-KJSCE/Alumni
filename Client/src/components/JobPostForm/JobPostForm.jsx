import React, { useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaBriefcase, FaExclamationCircle } from "react-icons/fa";
import { JOB_MODES } from "../../utils/constants.js";
import { useAuth } from "../../contexts/AuthContext";
import "./JobPostForm.css";

const JobPostForm = ({ onJobPosted, onCancel, showCloseButton = true }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    role: "",
    company: "",
    description: "",
    pay: "",
    experience: "",
    location: "",
    applyBy: "",
    applyLink: "",
    jobType: "job",
    jobMode: JOB_MODES.REMOTE,
    duration: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Create updated form data based on the changed field
    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    // If changing job type to internship, set a default for experience field
    if (name === "jobType" && value === "internship") {
      updatedFormData.experience = "Not Applicable";
    } else if (
      name === "jobType" &&
      value === "job" &&
      formData.experience === "Not Applicable"
    ) {
      // If changing from internship to job, clear the default value
      updatedFormData.experience = "";
    }

    setFormData(updatedFormData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("JobPostForm: user from AuthContext:", user);
      console.log("JobPostForm: user._id:", user?._id);

      if (!user || !user._id) {
        setError("You must be logged in to post a job");
        setIsLoading(false);
        return;
      } // Validate form data
      const requiredFields = [
        "role",
        "company",
        "description",
        "pay",
        "location",
        "applyBy",
        "applyLink",
        "jobMode",
      ];
      if (formData.jobType !== "internship") {
        requiredFields.push("experience");
      }

      const missingFields = requiredFields.filter((field) => !formData[field]);
      if (missingFields.length > 0) {
        setError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // If it's an internship, duration is required
      if (formData.jobType === "internship" && !formData.duration) {
        setError("Duration is required for internships");
        setIsLoading(false);
        return;
      } // Format data for submission
      const submissionData = {
        ...formData,
        // If applyBy is a date object or in date format, convert it to readable format
        applyBy: formData.applyBy
          ? new Date(formData.applyBy).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
        // Make sure experience has a value for internships to satisfy backend validation
        experience:
          formData.jobType === "internship"
            ? "Not Applicable"
            : formData.experience,
      };

      console.log("JobPostForm: Submitting job data:", submissionData);

      // Send request to create job
      const response = await axiosInstance.post("/api/jobs", submissionData);

      console.log("JobPostForm: Job posted successfully:", response.data); // Handle success
      if (onJobPosted) {
        onJobPosted(response.data);
      } else {
        navigate("/careers?posted=true");
      }
    } catch (err) {
      console.error("JobPostForm: Error posting job:", err);
      console.error("JobPostForm: Error response:", err.response?.data);
      console.error("JobPostForm: Error status:", err.response?.status);
      console.error("JobPostForm: Error headers:", err.response?.headers);

      // Show the actual error message from backend
      const errorMessage =
        err.response?.data?.message || "Failed to post job. Please try again.";
      console.error("JobPostForm: Setting error message:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="job-post-form-container">
      {" "}
      <div className="form-header">
        <h2>
          <FaBriefcase
            style={{ marginRight: "10px", verticalAlign: "middle" }}
          />{" "}
          Post a New Job
        </h2>
        {showCloseButton && (
          <button
            type="button"
            className="close-button"
            onClick={onCancel}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        )}
      </div>
      {error && (
        <div className="error-message">
          <FaExclamationCircle style={{ marginRight: "10px" }} />
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="job-post-form">
        <div className="form-group">
          <label htmlFor="jobType">Job Type</label>
          <select
            id="jobType"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
          >
            <option value="job">Full-time Job</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="role">Job Title/Role*</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g. Software Engineer"
            required
          />{" "}
        </div>

        <div className="form-group">
          <label htmlFor="company">Company*</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. TechCorp Inc."
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Job Description*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the job responsibilities, requirements, etc."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="pay">
            {formData.jobType === "internship" ? "Stipend" : "Salary"}*
          </label>
          <input
            type="text"
            id="pay"
            name="pay"
            value={formData.pay}
            onChange={handleChange}
            placeholder={
              formData.jobType === "internship"
                ? "e.g. INR 15,000 per month"
                : "e.g. INR 10,00,000-15,00,000 annually"
            }
            required
          />
        </div>

        {formData.jobType !== "internship" && (
          <div className="form-group">
            <label htmlFor="experience">Experience Required*</label>
            <input
              type="text"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g. 2 years, Entry level"
              required={formData.jobType !== "internship"}
            />
          </div>
        )}

        {formData.jobType === "internship" && (
          <div className="form-group">
            <label htmlFor="duration">Duration*</label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 3 months, 6 months"
              required={formData.jobType === "internship"}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="location">Location*</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Mumbai, India"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="applyLink">Application Link/Email*</label>
          <input
            type="text"
            id="applyLink"
            name="applyLink"
            value={formData.applyLink}
            onChange={handleChange}
            placeholder="e.g. https://company.com/careers or hr@company.com"
            required
          />
          <small className="form-hint">
            Enter a URL or email where candidates can apply
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="applyBy">Apply By Date*</label>
          <input
            type="date"
            id="applyBy"
            name="applyBy"
            value={formData.applyBy}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            required
            className="date-picker"
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobMode">Job Mode*</label>
          <select
            id="jobMode"
            name="jobMode"
            value={formData.jobMode}
            onChange={handleChange}
            required
          >
            {Object.values(JOB_MODES).map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
            aria-live="polite"
          >
            {isLoading ? (
              <>
                <span className="spin-loader"></span> Posting...
              </>
            ) : (
              "Post Job"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPostForm;
