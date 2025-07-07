import React from "react";
import { useNavigate } from "react-router-dom";
import EventForm from "../../components/EventForm/EventForm";
import { FaArrowLeft } from "react-icons/fa";
import "./CreateEvent.css";

const CreateEvent = () => {
  const navigate = useNavigate();

  const handleEventCreated = () => {
    // Navigate back to events page with success message
    navigate("/events?created=true");
  };

  const handleCancel = () => {
    navigate("/events");
  };

  return (
    <div className="create-event-page">
      <div className="create-event-header">
        <button
          className="back-button"
          onClick={handleCancel}
          aria-label="Go back to events"
        >
          <FaArrowLeft />
          <span>Back to Events</span>
        </button>
        <h1>Create New Event</h1>
      </div>
      <div className="create-event-content">
        <EventForm
          onEventCreated={handleEventCreated}
          onCancel={handleCancel}
          showCloseButton={false}
        />
      </div>
    </div>
  );
};

export default CreateEvent;
