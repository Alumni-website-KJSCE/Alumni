import React from "react";
import { useAuth } from "../../hooks/useAuth";
import "./PendingApproval.css";

const PendingApproval = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="page-container">
        <div className="section loading-section">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="section pending-section">
        <h2 className="section-title">Account Pending Approval</h2>

        {user.rejectionComment ? (
          <div className="error-message">
            <p>Your account has been rejected.</p>
            <p>
              <strong>Reason:</strong> {user.rejectionComment}
            </p>
            <p>Please contact the administrator for more information.</p>
          </div>
        ) : (
          <>
            <div className="pending-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="64"
                height="64"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z"
                  fill="#F57F17"
                />
              </svg>
            </div>

            <div className="pending-message">
              <p>Thank you for registering, {user.name}!</p>
              <p>Your account is currently pending administrator approval.</p>
              <p>
                We'll review your information and proof document as soon as
                possible.
              </p>
              <p>
                You'll receive an email notification once your account has been
                approved.
              </p>
            </div>

            <div className="pending-info">
              <h3>Your Registration Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{user.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                {user.jobTitle && (
                  <div className="info-item">
                    <span className="info-label">Job Title:</span>
                    <span className="info-value">{user.jobTitle}</span>
                  </div>
                )}
                {user.company && (
                  <div className="info-item">
                    <span className="info-label">Company:</span>
                    <span className="info-value">{user.company}</span>
                  </div>
                )}{" "}
                <div className="info-item">
                  <span className="info-label">Branch:</span>
                  <span className="info-value">{user.branch}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Graduation Year:</span>
                  <span className="info-value">{user.graduationYear}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value status-pending">
                    Pending Approval
                  </span>
                </div>
              </div>
            </div>

            <div className="pending-actions">
              <p>
                If you have any questions, please contact us at{" "}
                <a href="mailto:alumni@example.com">alumni@example.com</a>
              </p>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default PendingApproval;
