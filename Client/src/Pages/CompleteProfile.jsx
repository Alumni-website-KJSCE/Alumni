import React, { useState, useCallback, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  BRANCHES,
  QUALIFICATIONS,
  CONTRIBUTION_TYPES,
} from "../utils/constants";
import "./CompleteProfile.css";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [form, setForm] = useState({
    branch: "",
    highestQualification: "",
    graduationYear: "",
    company: "",
    currentPosting: "",
    location: "",
    councilMember: false,
    councils: [],
    linkedin: "",
    otherSocialLinks: {},
    attendanceProof: null,
    profilePicture: null,
    contributionInterest: "",
    contributionDetails: "",
  });

  // Track form loading and error states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Define addCouncil first before using it in the useEffect below
  const addCouncil = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      councils: [...prev.councils, { councilName: "", councilPosition: "" }],
    }));
  }, []); // No dependencies needed as it only uses setForm

  // Initialize council if needed
  useEffect(() => {
    if (form.councilMember && form.councils.length === 0) {
      addCouncil();
    }
  }, [form.councilMember, form.councils.length, addCouncil]);
  const validateFile = (file, allowPdf = false) => {
    if (!file) return true;
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
    ];
    const allowedTypes = allowPdf
      ? [...allowedImageTypes, "application/pdf"]
      : allowedImageTypes;

    if (!allowedTypes.includes(file.type)) {
      const allowedTypesText = allowPdf
        ? "JPG, JPEG, PNG, GIF images or PDF files"
        : "JPG, JPEG, PNG and GIF images";
      setError(
        `Invalid file type. Only ${allowedTypesText} are allowed. Selected: ${file.type}`,
      );
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0];
      const allowPdf = name === "attendanceProof";
      if (validateFile(file, allowPdf)) {
        setForm((prev) => ({ ...prev, [name]: file }));
        setError(""); // Clear any previous errors
      } else {
        e.target.value = ""; // Reset the file input
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeCouncil = useCallback((index) => {
    setForm((prev) => ({
      ...prev,
      councils: prev.councils.filter((_, i) => i !== index),
    }));
  }, []);

  const updateCouncil = useCallback((index, field, value) => {
    setForm((prev) => {
      const updatedCouncils = [...prev.councils];
      updatedCouncils[index] = {
        ...updatedCouncils[index],
        [field]: value,
      };
      return { ...prev, councils: updatedCouncils };
    });
  }, []);

  const validateLinkedInUrl = (url) => {
    if (!url) return true; // Optional field
    const linkedInPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    return linkedInPattern.test(url);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true); // Validate LinkedIn URL
    if (form.linkedin && !validateLinkedInUrl(form.linkedin)) {
      setError(
        "Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)",
      );
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("branch", form.branch);
      formData.append("highestQualification", form.highestQualification);
      formData.append("graduationYear", form.graduationYear);
      formData.append("contributionInterest", form.contributionInterest);
      formData.append("contributionDetails", form.contributionDetails);
      if (form.company) formData.append("company", form.company);
      if (form.currentPosting)
        formData.append("currentPosting", form.currentPosting);
      if (form.location) formData.append("location", form.location);

      formData.append("councilMember", form.councilMember);

      // Add councils as JSON string
      if (form.councilMember && form.councils.length > 0) {
        formData.append("councils", JSON.stringify(form.councils));
      }

      if (form.linkedin) formData.append("linkedin", form.linkedin);
      if (form.attendanceProof)
        formData.append("attendanceProof", form.attendanceProof);
      if (form.profilePicture)
        formData.append("profilePicture", form.profilePicture);

      // Add other social links as JSON
      if (Object.keys(form.otherSocialLinks).length > 0) {
        formData.append(
          "otherSocialLinks",
          JSON.stringify(form.otherSocialLinks),
        );
      }

      // Let browser set Content-Type boundary
      const config = { headers: { "Content-Type": undefined } };
      await axiosInstance.put("/api/user/profile", formData, config);

      setSuccess("Profile updated successfully! Redirecting...");
      // 2) refresh auth/context
      await checkAuth();
      // 3) navigate away
      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response?.data?.errors) {
        const msgs = err.response.data.errors.map((e) => e.msg).join(", ");
        setError(`Validation failed: ${msgs}`);
      } else {
        setError(
          err.response?.data?.message || err.message || "An error occurred.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Complete Your Profile</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="input-field">
            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              required
            >
              <option value="">Select Branch</option>
              {BRANCHES.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <label>Branch Attended</label>
          </div>
          <div className="input-field">
            <select
              name="highestQualification"
              value={form.highestQualification}
              onChange={handleChange}
              required
            >
              <option value="">Select Qualification</option>
              {QUALIFICATIONS.map((qual) => (
                <option key={qual} value={qual}>
                  {qual}
                </option>
              ))}
            </select>
            <label>Highest Qualification from KJSCE</label>
          </div>
          <div className="input-field">
            <input
              type="text"
              name="graduationYear"
              value={form.graduationYear}
              onChange={handleChange}
              required
              placeholder="Graduation Year (e.g., 2022)"
            />
            <label>Graduation Year</label>
          </div>
          <div className="section-title">Work & Contributions</div>{" "}
          <div className="input-field">
            <select
              name="contributionInterest"
              value={form.contributionInterest}
              onChange={handleChange}
              required
            >
              <option value="">How would you like to contribute?</option>
              {CONTRIBUTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <label>Contribution Interest</label>
          </div>
          {form.contributionInterest && (
            <div className="input-field">
              <textarea
                name="contributionDetails"
                value={form.contributionDetails}
                onChange={handleChange}
                placeholder="Please provide more details about how you would like to contribute..."
                required
              />
              <label>Contribution Details</label>
            </div>
          )}{" "}
          <div className="input-field file-field">
            <label>Proof of Attendance (required)</label>
            <input
              type="file"
              name="attendanceProof"
              accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
              onChange={handleChange}
              required
            />
            <small className="helper-text">
              Please upload a JPEG, JPG, PNG, GIF image file, or PDF document
            </small>
          </div>
          <div className="input-field">
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company (optional)"
            />
            <label>Company</label>
          </div>{" "}
          <div className="input-field">
            <input
              type="text"
              name="currentPosting"
              value={form.currentPosting}
              onChange={handleChange}
              placeholder="Current Role/Designation (optional)"
            />
            <label>Current Role/Designation</label>
          </div>
          <div className="input-field">
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City/Location (optional)"
            />
            <label>City/Location</label>
          </div>
          <div className="input-field file-field">
            <label>Profile Image (optional)</label>
            <input
              type="file"
              name="profilePicture"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleChange}
            />
            <small className="helper-text">
              Please upload a JPEG, JPG, PNG, or GIF image file
            </small>
          </div>{" "}
          <div className="input-field">
            <label>
              <input
                type="checkbox"
                name="councilMember"
                checked={form.councilMember}
                onChange={handleChange}
              />
              Part of any council?
            </label>
          </div>
          {form.councilMember && (
            <div className="councils-section">
              <div className="section-title">Council Memberships</div>

              {form.councils.map((council, index) => (
                <div key={index} className="council-item">
                  <div className="input-field">
                    <input
                      type="text"
                      value={council.councilName}
                      onChange={(e) =>
                        updateCouncil(index, "councilName", e.target.value)
                      }
                      placeholder="Council Name"
                      required
                    />
                    <label>Council Name</label>
                  </div>

                  <div className="input-field">
                    <input
                      type="text"
                      value={council.councilPosition}
                      onChange={(e) =>
                        updateCouncil(index, "councilPosition", e.target.value)
                      }
                      placeholder="Position in Council"
                      required
                    />
                    <label>Position</label>
                  </div>

                  <button
                    type="button"
                    className="remove-council-btn"
                    onClick={() => removeCouncil(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="add-council-btn"
                onClick={addCouncil}
              >
                Add Another Council
              </button>

              {form.councils.length === 0 && (
                <div className="helper-text">
                  Please add at least one council membership.
                </div>
              )}
            </div>
          )}{" "}
          <div className="input-field">
            <input
              type="url"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn Profile URL (optional)"
            />
            <label>LinkedIn Profile URL</label>
            <small className="helper-text">
              e.g., https://www.linkedin.com/in/username
            </small>
          </div>
          <div className="section-title">Other Social Links (Optional)</div>
          <div className="social-links-section">
            {/* We can add more social links in the future if needed */}
            <div className="input-field">
              <input
                type="url"
                name="twitter"
                value={form.otherSocialLinks.twitter || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    otherSocialLinks: {
                      ...prev.otherSocialLinks,
                      twitter: e.target.value,
                    },
                  }))
                }
                placeholder="Twitter/X Profile URL (optional)"
              />
              <label>Twitter/X Profile</label>
            </div>

            <div className="input-field">
              <input
                type="url"
                name="github"
                value={form.otherSocialLinks.github || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    otherSocialLinks: {
                      ...prev.otherSocialLinks,
                      github: e.target.value,
                    },
                  }))
                }
                placeholder="GitHub Profile URL (optional)"
              />
              <label>GitHub Profile</label>
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save & Continue"}
          </button>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
