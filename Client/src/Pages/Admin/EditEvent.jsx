import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import EventForm from "../../components/EventForm/EventForm";
import "./AdminMobile.css";

const EditEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Get event data from navigation state
  const event = location.state?.event;

  const handleEventCreated = () => {
    // Navigate back to admin dashboard with success message
    navigate("/admin", {
      state: {
        message: { type: "success", text: "Event updated successfully" },
        activeSection: "events",
      },
    });
  };

  const handleCancel = () => {
    navigate("/admin", { state: { activeSection: "events" } });
  };

  // If no event data, redirect back to admin
  if (!event) {
    navigate("/admin", { state: { activeSection: "events" } });
    return null;
  }

  return (
    <div className="admin-mobile-page">
      <div className="admin-mobile-header">
        <button className="back-button" onClick={handleCancel}>
          <FaArrowLeft />
        </button>
        <div className="header-title">
          <FaCalendarAlt />
          <h1>Edit Event</h1>
        </div>
      </div>

      <div className="admin-mobile-content">
        <EventForm
          onEventCreated={handleEventCreated}
          onCancel={handleCancel}
          editEvent={event}
        />
      </div>
    </div>
  );
};

export default EditEvent;
