import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import "./EventForm.css";
import {
  FaPlus,
  FaTrash,
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaImage,
  FaInfoCircle,
  FaCheck,
  FaArrowRight,
  FaArrowLeft,
  FaSave,
} from "react-icons/fa";

const EventForm = ({ onEventCreated, onCancel, editEvent = null }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    imageUrl: "",
    isActive: true,
    schedule: [{ time: "", title: "", description: "" }],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [previewUrl, setPreviewUrl] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // If we're editing an existing event, load its data
  useEffect(() => {
    if (editEvent) {
      const formattedDate = editEvent.date
        ? new Date(editEvent.date).toISOString().split("T")[0]
        : "";

      setFormData({
        ...editEvent,
        date: formattedDate,
        schedule:
          editEvent.schedule?.length > 0
            ? editEvent.schedule
            : [{ time: "", title: "", description: "" }],
      });

      if (editEvent.imageUrl) {
        setPreviewUrl(editEvent.imageUrl);
      }
    }
  }, [editEvent]);

  const validateField = (name, value) => {
    let errorMessage = "";

    switch (name) {
      case "title":
        if (!value.trim()) errorMessage = "Title is required";
        else if (value.length < 3)
          errorMessage = "Title must be at least 3 characters";
        break;
      case "description":
        if (!value.trim()) errorMessage = "Description is required";
        else if (value.length < 10)
          errorMessage = "Description must be at least 10 characters";
        break;
      case "date":
        if (!value) errorMessage = "Date is required";
        break;
      case "time":
        if (!value.trim()) errorMessage = "Time is required";
        break;
      case "venue":
        if (!value.trim()) errorMessage = "Venue is required";
        break;
      case "imageUrl":
        if (value.trim() && !/^https?:\/\/.+\..+/.test(value)) {
          errorMessage = "Please enter a valid URL";
        }
        break;
      default:
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));

    return !errorMessage;
  };

  const validateForm = () => {
    // Validate all fields
    const fields = ["title", "description", "date", "time", "venue"];
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);

    // Update preview URL if imageUrl is changed
    if (name === "imageUrl") {
      setPreviewUrl(value);
    }
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index] = {
      ...updatedSchedule[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      schedule: updatedSchedule,
    }));
  };

  const addScheduleItem = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { time: "", title: "", description: "" }],
    }));
  };

  const removeScheduleItem = (index) => {
    if (formData.schedule.length === 1) return;

    const updatedSchedule = formData.schedule.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      schedule: updatedSchedule,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!validateForm()) {
      setError("Please correct the errors before submitting");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Ensure user is logged in (token present)
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to create an event");
        setIsLoading(false);
        return;
      }

      // Format date for MongoDB
      const formattedDate = new Date(formData.date);

      // Filter out empty schedule items
      const cleanedSchedule = formData.schedule.filter(
        (item) => item.time.trim() && item.title.trim(),
      );

      // Request URL and method based on whether we're editing or creating
      const url = editEvent ? `/api/events/${editEvent._id}` : "/api/events";

      const method = editEvent ? "put" : "post";

      // Send request
      const response = await axios[method](url, {
        ...formData,
        date: formattedDate,
        schedule:
          cleanedSchedule.length > 0 ? cleanedSchedule : formData.schedule,
      });

      // Set success message
      setSuccess(
        editEvent
          ? "Event updated successfully!"
          : "Event created successfully!",
      );

      // Notify parent component
      if (onEventCreated) {
        onEventCreated(response.data);
      }

      // Clear form if creating new event
      if (!editEvent) {
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          venue: "",
          imageUrl: "",
          isActive: true,
          schedule: [{ time: "", title: "", description: "" }],
        });
        setPreviewUrl("");
      }

      // Reset to basic tab
      setActiveTab("basic");
    } catch (err) {
      console.error("Error with event:", err);
      setError(
        err.response?.data?.message ||
          `Failed to ${editEvent ? "update" : "create"} event. Please try again.`,
      );
    } finally {
      setIsLoading(false);

      // Scroll to top to show error/success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="event-form-container">
      <div className="form-header">
        <h2>{editEvent ? "Edit Event" : "Create New Event"}</h2>
        <button
          type="button"
          className="close-button"
          onClick={onCancel}
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>

      {error && (
        <div className="error-message">
          <FaInfoCircle className="message-icon" /> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <FaCheck className="message-icon" /> {success}
        </div>
      )}

      <div className="form-tabs">
        <button
          type="button"
          className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic Info
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Details & Schedule
        </button>
      </div>

      <form onSubmit={handleSubmit} className="event-form">
        {activeTab === "basic" && (
          <div className="tab-content">
            <div className="form-group">
              <label htmlFor="title">
                <FaInfoCircle className="field-icon" /> Event Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Alumni Meet 2025"
                className={validationErrors.title ? "error" : ""}
                required
              />
              {validationErrors.title && (
                <div className="field-error">{validationErrors.title}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="date">
                <FaCalendarAlt className="field-icon" /> Event Date*
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={validationErrors.date ? "error" : ""}
                required
              />
              {validationErrors.date && (
                <div className="field-error">{validationErrors.date}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="time">
                <FaClock className="field-icon" /> Event Time*
              </label>
              <input
                type="text"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="e.g. 10:00 AM - 5:00 PM"
                className={validationErrors.time ? "error" : ""}
                required
              />
              {validationErrors.time && (
                <div className="field-error">{validationErrors.time}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="venue">
                <FaMapMarkerAlt className="field-icon" /> Venue*
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. KJSCE Auditorium"
                className={validationErrors.venue ? "error" : ""}
                required
              />
              {validationErrors.venue && (
                <div className="field-error">{validationErrors.venue}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">
                <FaInfoCircle className="field-icon" /> Event Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the event details, purpose, etc."
                rows="4"
                className={validationErrors.description ? "error" : ""}
                required
              />
              {validationErrors.description && (
                <div className="field-error">
                  {validationErrors.description}
                </div>
              )}
            </div>

            <div className="form-group full-width image-input-container">
              <label htmlFor="imageUrl">
                <FaImage className="field-icon" /> Event Banner Image URL
              </label>
              <div className="image-input-wrapper">
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={validationErrors.imageUrl ? "error" : ""}
                />
                {validationErrors.imageUrl && (
                  <div className="field-error">{validationErrors.imageUrl}</div>
                )}
              </div>

              {previewUrl && (
                <div className="image-preview">
                  <img
                    src={previewUrl}
                    alt="Event banner preview"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/600x200?text=Image+Not+Found";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="isActive">Event Status</label>
              <select
                id="isActive"
                name="isActive"
                value={formData.isActive.toString()}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.value === "true",
                  }))
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="tab-content">
            <div className="form-group full-width">
              <label className="schedule-label">
                <FaClock className="field-icon" /> Event Schedule
              </label>
              <div className="schedule-info">
                Add the timeline for your event. You can include multiple
                sessions, breaks, or activities.
              </div>
              <div className="schedule-items">
                {formData.schedule.map((item, index) => (
                  <div key={index} className="schedule-item">
                    <div className="schedule-inputs">
                      <div className="schedule-item-header">
                        <div className="schedule-item-title">
                          <div className="schedule-item-number">
                            {index + 1}
                          </div>
                          Schedule Item {index + 1}
                        </div>
                      </div>

                      <div className="schedule-input-row">
                        <div className="schedule-input-group">
                          <label>
                            <FaClock /> Time
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 10:00 AM"
                            value={item.time}
                            onChange={(e) =>
                              handleScheduleChange(
                                index,
                                "time",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="schedule-input-group">
                          <label>
                            <FaInfoCircle /> Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Registration"
                            value={item.title}
                            onChange={(e) =>
                              handleScheduleChange(
                                index,
                                "title",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="schedule-input-group">
                        <label>
                          <FaInfoCircle /> Description
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Check-in and collect name badges"
                          value={item.description}
                          onChange={(e) =>
                            handleScheduleChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="remove-schedule-button"
                      onClick={() => removeScheduleItem(index)}
                      disabled={formData.schedule.length === 1}
                      aria-label="Remove schedule item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="add-schedule-button"
                  onClick={addScheduleItem}
                >
                  <FaPlus /> Add Schedule Item
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions2">
          {activeTab === "basic" ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="cancel-button2"
              >
                <FaTimes /> Cancel
              </button>
              <button
                type="button"
                className="next-button"
                onClick={() => setActiveTab("details")}
              >
                Next: Schedule <FaArrowRight />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="cancel-button2 cancel-button-small"
                style={{ marginRight: "10px", marginTop: "40px" }}
              >
                <FaTimes /> Cancel
              </button>
              <div className="action-buttons">
                <button
                  type="button"
                  className="back-button"
                  onClick={() => setActiveTab("basic")}
                >
                  <FaArrowLeft /> Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-button"
                >
                  {isLoading ? (
                    editEvent ? (
                      "Updating..."
                    ) : (
                      "Creating..."
                    )
                  ) : editEvent ? (
                    <>
                      <FaSave /> Update Event
                    </>
                  ) : (
                    <>
                      <FaSave /> Create Event
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default EventForm;
