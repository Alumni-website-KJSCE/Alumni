import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { FaTimes, FaBriefcase, FaExclamationCircle } from "react-icons/fa";
import { JOB_MODES } from "../../utils/constants.js";
import "./EditJobForm.css";

const EditJobForm = ({
  jobData,
  onJobUpdated,
  onCancel,
  showCloseButton = true,
}) => {
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

  // Populate form with existing job data
  useEffect(() => {
    if (jobData) {
      const applyByDate = jobData.applyBy
        ? new Date(jobData.applyBy).toISOString().split("T")[0]
        : "";
      setFormData({
        role: jobData.role || "",
        company: jobData.company || "",
        description: jobData.description || "",
        pay: jobData.pay || "",
        experience: jobData.experience || "",
        location: jobData.location || "",
        applyBy: applyByDate,
        applyLink: jobData.applyLink || "",
        jobType: jobData.jobType || "job",
        jobMode: jobData.jobMode || JOB_MODES.REMOTE,
        duration: jobData.duration || "",
      });
    }
  }, [jobData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate required fields
      const requiredFields = [
        "role",
        "company",
        "description",
        "pay",
        "location",
        "applyBy",
        "applyLink",
      ];

      if (formData.jobType === "job") {
        requiredFields.push("experience");
      } else if (formData.jobType === "internship") {
        requiredFields.push("duration");
      }

      for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === "") {
          throw new Error(
            `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
          );
        }
      }

      // Validate apply by date
      const applyByDate = new Date(formData.applyBy);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (applyByDate < today) {
        throw new Error("Apply by date must be today or in the future");
      }

      // Validate URL
      const urlPattern =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.applyLink)) {
        throw new Error("Please enter a valid application link");
      }

      // Update the job
      const response = await axiosInstance.put(
        `/api/jobs/${jobData._id}`,
        formData,
      );

      if (response.status === 200) {
        onJobUpdated(response.data);
      }
    } catch (err) {
      console.error("Error updating job:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update job. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "Software Engineering",
    "Data Science",
    "Product Management",
    "Marketing",
    "Sales",
    "Finance",
    "Human Resources",
    "Design",
    "Operations",
    "Consulting",
    "Research",
    "Other",
  ];

  return (
    <div className="edit-job-form-container">
      <div className="edit-job-form">
        <div className="form-header">
          <div className="form-title-section">
            <FaBriefcase className="form-icon" />
            <h2>
              Edit {formData.jobType === "job" ? "Job" : "Internship"} Posting
            </h2>
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onCancel}
              className="close-button"
              aria-label="Close form"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {error && (
          <div className="error-message" role="alert">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="job-form">
          {/* Job Type Selection */}
          <div className="form-group">
            <label htmlFor="jobType">Type*</label>
            <select
              id="jobType"
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              required
            >
              <option value="job">Job</option>
              <option value="internship">Internship</option>
            </select>
          </div>{" "}
          {/* Role and Company */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Role/Position*</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Software Engineer, Marketing Manager"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company*</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company name"
                required
              />
            </div>
          </div>
          {/* Pay */}
          <div className="form-group">
            <label htmlFor="pay">
              {formData.jobType === "job" ? "Salary*" : "Stipend*"}
            </label>
            <input
              type="text"
              id="pay"
              name="pay"
              value={formData.pay}
              onChange={handleChange}
              placeholder={
                formData.jobType === "job"
                  ? "e.g., ₹12-15 LPA"
                  : "e.g., ₹15,000/month"
              }
              required
            />
          </div>
          {/* Experience and Duration */}
          <div className="form-row">
            {formData.jobType === "job" && (
              <div className="form-group">
                <label htmlFor="experience">Experience Required*</label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 2-5 years, Entry Level"
                  required
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
                  placeholder="e.g., 3 months, 6 months"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="jobMode">Work Mode*</label>
              <select
                id="jobMode"
                name="jobMode"
                value={formData.jobMode}
                onChange={handleChange}
                required
              >
                <option value={JOB_MODES.REMOTE}>Remote</option>
                <option value={JOB_MODES.ONSITE}>On-site</option>
                <option value={JOB_MODES.HYBRID}>Hybrid</option>
              </select>
            </div>
          </div>
          {/* Location and Apply By */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location*</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Bangalore, Mumbai, Remote"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="applyBy">Apply By*</label>
              <input
                type="date"
                id="applyBy"
                name="applyBy"
                value={formData.applyBy}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>
          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Job Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Provide detailed job description, requirements, responsibilities..."
              required
            />
          </div>
          {/* Apply Link */}
          <div className="form-group">
            <label htmlFor="applyLink">Application Link*</label>
            <input
              type="url"
              id="applyLink"
              name="applyLink"
              value={formData.applyLink}
              onChange={handleChange}
              placeholder="https://company.com/apply or email link"
              required
            />
          </div>
          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Updating...
                </>
              ) : (
                `Update ${formData.jobType === "job" ? "Job" : "Internship"}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobForm;
