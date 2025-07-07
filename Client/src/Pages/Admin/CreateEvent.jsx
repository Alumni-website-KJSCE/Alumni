import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import EventForm from "../../components/EventForm/EventForm";
import "./AdminMobile.css";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleEventCreated = () => {
    // Navigate back to admin dashboard with success message
    navigate("/admin", {
      state: {
        message: { type: "success", text: "Event created successfully" },
        activeSection: "events",
      },
    });
  };

  const handleCancel = () => {
    navigate("/admin", { state: { activeSection: "events" } });
  };

  return (
    <div className="admin-mobile-page">
      <div className="admin-mobile-header">
        <button className="back-button" onClick={handleCancel}>
          <FaArrowLeft />
        </button>
        <div className="header-title">
          <FaCalendarAlt />
          <h1>Create Event</h1>
        </div>
      </div>

      <div className="admin-mobile-content">
        <EventForm
          onEventCreated={handleEventCreated}
          onCancel={handleCancel}
          editEvent={null}
        />
      </div>
    </div>
  );
};

export default CreateEvent;
