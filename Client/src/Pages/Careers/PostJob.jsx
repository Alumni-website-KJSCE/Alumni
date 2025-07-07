import React from "react";
import { useNavigate } from "react-router-dom";
import JobPostForm from "../../components/JobPostForm/JobPostForm";
import { FaArrowLeft } from "react-icons/fa";
import "./PostJob.css";

const PostJob = () => {
  const navigate = useNavigate();

  const handleJobPosted = () => {
    // Navigate back to careers page with success message
    navigate("/careers?posted=true");
  };

  const handleCancel = () => {
    navigate("/careers");
  };

  return (
    <div className="post-job-page">
      <div className="post-job-header">
        <button
          className="back-button"
          onClick={handleCancel}
          aria-label="Go back to careers"
        >
          <FaArrowLeft />
          <span>Back to Careers</span>
        </button>
        <h1>Post a Job/Internship</h1>
      </div>
      <div className="post-job-content">
        <JobPostForm
          onJobPosted={handleJobPosted}
          onCancel={handleCancel}
          showCloseButton={false}
        />
      </div>
    </div>
  );
};

export default PostJob;
