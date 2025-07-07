import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import {
  FaUser,
  FaBuilding,
  FaGraduationCap,
  FaLinkedin,
  FaEdit,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaEnvelope,
  FaIdCard,
  FaLink,
} from "react-icons/fa";
import ImageUpload from "../../components/ImageUpload/ImageUpload";
import {
  CONTRIBUTION_TYPES,
  BRANCH_OPTIONS,
  QUALIFICATION_OPTIONS,
} from "../../utils/constants";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    currentPosting: "",
    company: "",
    graduationYear: "",
    branch: "",
    highestQualification: "",
    location: "",
    linkedin: "",
    otherSocialLinks: {
      twitter: "",
      github: "",
    },
    councilMember: false,
    councils: [],
    attendanceProof: "",
    contributionInterest: "",
    contributionDetails: "",
  });

  const navigate = useNavigate();

  // Add required styles
  const styles = `
    .council-memberships {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .council-item {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 1rem;
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid #eee;
      border-radius: 4px;
    }

    .remove-council-btn {
      height: fit-content;
      align-self: end;
      margin-bottom: 8px;
      padding: 0.5rem 1rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .add-council-btn {
      padding: 0.5rem 1rem;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }

    .council-entry {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .council-entry:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
  `;

  useEffect(() => {
    // Add styles to document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [styles]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setFormData({
          name: response.data.name || "",
          jobTitle: response.data.jobTitle || "",
          company: response.data.company || "",
          graduationYear: response.data.graduationYear || "",
          branch: response.data.branch || "",
          highestQualification: response.data.highestQualification || "",
          location: response.data.location || "",
          linkedin: response.data.linkedin || "",
          otherSocialLinks: response.data.otherSocialLinks || {
            twitter: "",
            github: "",
          },
          councilMember: response.data.councilMember || false,
          councils: response.data.councils || [],
          contributionInterest: response.data.contributionInterest || "",
          contributionDetails: response.data.contributionDetails || "",
          attendanceProof: response.data.attendanceProof || "",
        });
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch profile data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Create FormData object
      const formDataToSend = new FormData();

      // Add all text and boolean fields
      Object.entries({
        name: formData.name,
        jobTitle: formData.jobTitle,
        company: formData.company,
        graduationYear: parseInt(formData.graduationYear),
        branch: formData.branch,
        highestQualification: formData.highestQualification,
        location: formData.location,
        linkedin: formData.linkedin,
        contributionInterest: formData.contributionInterest,
        contributionDetails: formData.contributionDetails,
        councilMember: formData.councilMember,
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formDataToSend.append(key, value);
        }
      });

      // Add councils as JSON string
      if (formData.councilMember && formData.councils.length > 0) {
        formDataToSend.append("councils", JSON.stringify(formData.councils));
      }

      // Add other social links as JSON
      if (Object.keys(formData.otherSocialLinks).length > 0) {
        formDataToSend.append(
          "otherSocialLinks",
          JSON.stringify(formData.otherSocialLinks),
        );
      }

      // Add file if it's a new file upload
      if (
        formData.attendanceProof &&
        formData.attendanceProof instanceof File
      ) {
        formDataToSend.append("attendanceProof", formData.attendanceProof);
      }

      const response = await axiosInstance.put(
        "/api/user/profile",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUser(response.data);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to update profile");
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      jobTitle: user.jobTitle || "",
      company: user.company || "",
      graduationYear: user.graduationYear || "",
      branch: user.branch || "",
      highestQualification: user.highestQualification || "",
      location: user.location || "",
      linkedin: user.linkedin || "",
      otherSocialLinks: user.otherSocialLinks || { twitter: "", github: "" },
      councilMember: user.councilMember || false,
      councils: user.councils || [],
      attendanceProof: user.attendanceProof || "",
      contributionInterest: user.contributionInterest || "",
      contributionDetails: user.contributionDetails || "",
    });
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
  };

  const handleImageSelect = async (file) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !file) return;

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axiosInstance.put("/api/user/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser((prev) => ({
        ...prev,
        profilePicture: response.data.profilePicture,
      }));

      setSuccessMessage("Profile image updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile image:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to update profile image");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  // Council management functions
  const addCouncil = () => {
    setFormData((prev) => ({
      ...prev,
      councils: [...prev.councils, { councilName: "", councilPosition: "" }],
    }));
  };

  const removeCouncil = (index) => {
    setFormData((prev) => ({
      ...prev,
      councils: prev.councils.filter((_, i) => i !== index),
    }));
  };

  const updateCouncil = (index, field, value) => {
    setFormData((prev) => {
      const updatedCouncils = [...prev.councils];
      updatedCouncils[index] = {
        ...updatedCouncils[index],
        [field]: value,
      };
      return { ...prev, councils: updatedCouncils };
    });
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-wrapper">
        <section className="section-card">
          <div className="profile-header-banner">
            <h2 className="section-title">My Profile</h2>
            <div className="profile-status-indicator">
              <span className={`status-badge ${user?.isApproved}`}>
                {user?.isApproved ? "Approved" : "Pending Approval"}
              </span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {/* Rejected Profile Message */}
          {!user?.isApproved && user?.rejectionComment && (
            <div className="rejected-profile-message">
              <FaExclamationTriangle className="rejected-icon" />
              <div className="rejected-content">
                <h3>Your profile has been rejected</h3>
                {user.rejectionComment ? (
                  <>
                    <p className="rejection-reason-title">
                      Reason for rejection:
                    </p>
                    <p className="rejection-reason-text">
                      "{user.rejectionComment}"
                    </p>
                  </>
                ) : (
                  <p>
                    Unfortunately, your profile verification was not approved.
                    This could be due to insufficient or incorrect information
                    provided during registration.
                  </p>
                )}
                <p>
                  Please contact the administrator for more information and to
                  discuss next steps.
                </p>
              </div>
            </div>
          )}

          <div className="section-content">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.profilePicture ? (
                  <img
                    src={`http://localhost:3001${user.profilePicture}`}
                    alt={user?.name}
                    className="avatar-image"
                  />
                ) : (
                  <FaUser className="avatar-icon" />
                )}
              </div>
              <div className="profile-info">
                <div className="profile-title">
                  <h3>{user?.name}</h3>
                  <div className="profile-subtitle">
                    <FaEnvelope className="subtitle-icon" /> {user?.email}
                  </div>
                  {user?.isApproved && (
                    <div className="profile-subtitle">
                      <FaIdCard className="subtitle-icon" />{" "}
                      {user.isApproved ? "Admin" : "Alumni"}
                    </div>
                  )}
                </div>
                {!isEditing && user?.isApproved !== "rejected" && (
                  <button
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="section-divider" />

            {/* Profile Form/Details */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="jobTitle">Job Title</label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">City/Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Mumbai, India"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="graduationYear">Graduation Year</label>
                    <input
                      type="text"
                      id="graduationYear"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="branch">Branch</label>
                    <select
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Branch</option>
                      {BRANCH_OPTIONS.map((branch) => (
                        <option key={branch.value} value={branch.value}>
                          {branch.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="highestQualification">
                      Highest Qualification from KJSCE
                    </label>
                    <select
                      id="highestQualification"
                      name="highestQualification"
                      value={formData.highestQualification}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Qualification</option>
                      {QUALIFICATION_OPTIONS.map((qualification) => (
                        <option
                          key={qualification.value}
                          value={qualification.value}
                        >
                          {qualification.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="attendanceProof">
                      Attendance Proof Document
                    </label>
                    <input
                      type="file"
                      id="attendanceProof"
                      name="attendanceProof"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData((prev) => ({
                          ...prev,
                          attendanceProof: file,
                        }));
                      }}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {formData.attendanceProof && (
                      <p className="file-selected">
                        File selected:{" "}
                        {typeof formData.attendanceProof === "string"
                          ? formData.attendanceProof.split("/").pop()
                          : formData.attendanceProof.name}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="linkedin">LinkedIn URL</label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contributionInterest">
                      Contribution Interest
                    </label>
                    <select
                      id="contributionInterest"
                      name="contributionInterest"
                      value={formData.contributionInterest}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        How would you like to contribute?
                      </option>
                      {CONTRIBUTION_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.contributionInterest && (
                    <div className="form-group">
                      <label htmlFor="contributionDetails">
                        Contribution Details
                      </label>
                      <textarea
                        id="contributionDetails"
                        name="contributionDetails"
                        value={formData.contributionDetails}
                        onChange={handleChange}
                        placeholder="Please provide more details about how you would like to contribute..."
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="twitter">Twitter/X Profile</label>
                    <input
                      type="url"
                      id="twitter"
                      name="twitter"
                      value={formData.otherSocialLinks.twitter}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          otherSocialLinks: {
                            ...prev.otherSocialLinks,
                            twitter: e.target.value,
                          },
                        }))
                      }
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="github">GitHub Profile</label>
                    <input
                      type="url"
                      id="github"
                      name="github"
                      value={formData.otherSocialLinks.github}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          otherSocialLinks: {
                            ...prev.otherSocialLinks,
                            github: e.target.value,
                          },
                        }))
                      }
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div
                    className="form-group"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-around",
                    }}
                  >
                    <label style={{ display: "inline", width: "65%" }}>
                      Council Member
                    </label>
                    <input
                      type="checkbox"
                      name="councilMember"
                      style={{ display: "inline", width: "25%" }}
                      checked={formData.councilMember}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          councilMember: e.target.checked,
                        }))
                      }
                    />
                  </div>

                  {formData.councilMember && (
                    <div className="council-memberships">
                      <h4>Council Memberships</h4>
                      {formData.councils.map((council, index) => (
                        <div key={index} className="council-item">
                          <div className="form-group">
                            <label>Council Name</label>
                            <input
                              type="text"
                              value={council.councilName}
                              onChange={(e) =>
                                updateCouncil(
                                  index,
                                  "councilName",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., Student Council, Alumni Council"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Council Position</label>
                            <input
                              type="text"
                              value={council.councilPosition}
                              onChange={(e) =>
                                updateCouncil(
                                  index,
                                  "councilPosition",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., President, Vice President"
                              required
                            />
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
                        Add Council Membership
                      </button>
                    </div>
                  )}

                  {/* Council Details - Dynamic Fields */}
                  {formData.councils.length > 0 && (
                    <div className="form-group">
                      <label>Council Details</label>
                      {formData.councils.map((council, index) => (
                        <div key={index} className="council-detail">
                          <input
                            type="text"
                            value={council.councilName}
                            onChange={(e) =>
                              updateCouncil(
                                index,
                                "councilName",
                                e.target.value,
                              )
                            }
                            placeholder="Council Name"
                            required
                          />
                          <input
                            type="text"
                            value={council.councilPosition}
                            onChange={(e) =>
                              updateCouncil(
                                index,
                                "councilPosition",
                                e.target.value,
                              )
                            }
                            placeholder="Position"
                            required
                          />
                          <button
                            type="button"
                            className="remove-council-button"
                            onClick={() => removeCouncil(index)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancel}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button type="submit" className="save-button">
                    <FaSave /> Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="profile-card">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaGraduationCap />
                    </div>
                    <div className="detail-content">
                      <h4>Education</h4>
                      <p>
                        <strong>Branch:</strong>{" "}
                        {user?.branch || "Not specified"}
                      </p>
                      <p>
                        <strong>Highest Qualification:</strong>{" "}
                        {user?.highestQualification || "Not specified"}
                      </p>
                      <p>
                        <strong>Graduation Year:</strong>{" "}
                        {user?.graduationYear || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="profile-card">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaBuilding />
                    </div>
                    <div className="detail-content">
                      <h4>Work</h4>
                      <p>
                        <strong>Job Title:</strong>{" "}
                        {user?.jobTitle || "Not specified"}
                      </p>
                      <p>
                        <strong>Company:</strong>{" "}
                        {user?.company || "Not specified"}
                      </p>
                      <p>
                        <strong>Location:</strong>{" "}
                        {user?.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {user?.councilMember &&
                  user?.councils &&
                  user.councils.length > 0 && (
                    <div className="profile-card">
                      <div className="detail-item">
                        <div className="detail-icon">
                          <FaIdCard />
                        </div>
                        <div className="detail-content">
                          <h4>Council Memberships</h4>
                          {user.councils.map((council, index) => (
                            <div key={index} className="council-entry">
                              <p>
                                <strong>Council:</strong> {council.councilName}
                              </p>
                              <p>
                                <strong>Position:</strong>{" "}
                                {council.councilPosition}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                <div className="profile-card">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <FaLink />
                    </div>
                    <div className="detail-content">
                      <h4>Social Links</h4>
                      {user?.linkedin && (
                        <a
                          href={user.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                        >
                          <FaLinkedin /> LinkedIn Profile
                        </a>
                      )}
                      {user?.otherSocialLinks?.twitter && (
                        <a
                          href={user.otherSocialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                        >
                          <i className="fab fa-twitter" /> Twitter/X Profile
                        </a>
                      )}
                      {user?.otherSocialLinks?.github && (
                        <a
                          href={user.otherSocialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-link"
                        >
                          <i className="fab fa-github" /> GitHub Profile
                        </a>
                      )}
                      {!user?.linkedin &&
                        !user?.otherSocialLinks?.twitter &&
                        !user?.otherSocialLinks?.github && (
                          <p>No social links provided</p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Profile Picture Section */}
        <section className="section-card">
          <div className="section-content">
            <div className="section-header">
              <h2>Profile Picture</h2>
              <p className="section-description">
                Add a profile picture to personalize your profile. This will be
                visible to other alumni.
              </p>
            </div>
            <div className="upload-container">
              <ImageUpload
                onImageSelect={handleImageSelect}
                initialImage={
                  user?.profilePicture
                    ? `http://localhost:3001${user.profilePicture}`
                    : null
                }
              />
              <p className="upload-hint">
                * Recommended: Square image, at least 400x400 pixels
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
