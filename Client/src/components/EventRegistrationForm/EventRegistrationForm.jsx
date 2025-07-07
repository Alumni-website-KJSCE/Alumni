import React, { useState } from "react";
import axiosInstance from "../../utils/axiosConfig";

import "./EventRegistrationForm.css";

const EventRegistrationForm = ({ eventId }) => {
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    phone: "",
    batch: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!registrationForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!registrationForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(registrationForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (registrationForm.phone && !phoneRegex.test(registrationForm.phone)) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!registrationForm.batch) {
      errors.batch = "Please select your graduation batch";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!eventId) {
      setResponseMessage("Event not found. Please try refreshing the page.");
      setMessageType("error");
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        `/api/events/${eventId}/register`,
        registrationForm,
      );

      setResponseMessage(response.data.message);
      setMessageType("success");

      // Reset form
      setRegistrationForm({
        name: "",
        email: "",
        phone: "",
        batch: "",
      });

      // Scroll to the response message
      setTimeout(() => {
        const responseElement = document.querySelector(".response-message");
        if (responseElement) {
          responseElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    } catch (err) {
      console.error("Registration error:", err);
      setResponseMessage(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setRegistrationForm({
      name: "",
      email: "",
      phone: "",
      batch: "",
    });
    setFormErrors({});
    setResponseMessage("");
  };

  return (
    <div className="registration-form-container">
      <h2 className="section-title">Register Now</h2>
      <form id="registrationForm" onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">
            Full Name <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={registrationForm.name}
            onChange={handleInputChange}
            className={formErrors.name ? "error-input" : ""}
            placeholder="Enter your full name"
            required
          />
          {formErrors.name && (
            <div className="error-message">{formErrors.name}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="email">
            Email Address <span className="required-asterisk">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={registrationForm.email}
            onChange={handleInputChange}
            className={formErrors.email ? "error-input" : ""}
            placeholder="Enter your email address"
            required
          />
          {formErrors.email && (
            <div className="error-message">{formErrors.email}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={registrationForm.phone}
            onChange={handleInputChange}
            className={formErrors.phone ? "error-input" : ""}
            placeholder="Enter your 10-digit number"
          />
          {formErrors.phone && (
            <div className="error-message">{formErrors.phone}</div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="batch">
            Graduation Batch <span className="required-asterisk">*</span>
          </label>
          <select
            id="batch"
            name="batch"
            value={registrationForm.batch}
            onChange={handleInputChange}
            className={formErrors.batch ? "error-input" : ""}
            required
          >
            <option value="">Select your batch</option>
            <option value="2005-2009">2005-2009</option>
            <option value="2006-2010">2006-2010</option>
            <option value="2007-2011">2007-2011</option>
            <option value="2008-2012">2008-2012</option>
            <option value="2009-2013">2009-2013</option>
            <option value="2010-2014">2010-2014</option>
            <option value="2011-2015">2011-2015</option>
            <option value="2012-2016">2012-2016</option>
            <option value="2013-2017">2013-2017</option>
            <option value="2014-2018">2014-2018</option>
            <option value="2015-2019">2015-2019</option>
            <option value="2016-2020">2016-2020</option>
            <option value="2017-2021">2017-2021</option>
            <option value="2018-2022">2018-2022</option>
            <option value="2019-2023">2019-2023</option>
            <option value="2020-2024">2020-2024</option>
          </select>
          {formErrors.batch && (
            <div className="error-message">{formErrors.batch}</div>
          )}
        </div>{" "}
        <div className="button-group">
          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register Now"}
          </button>

          <button type="button" className="clear-button" onClick={clearForm}>
            Clear Form
          </button>
        </div>
      </form>

      {responseMessage && (
        <div className={`response-message ${messageType}`}>
          <div className="response-icon">
            {messageType === "success" ? "✓" : "✕"}
          </div>
          <div className="response-text">
            {responseMessage}
            {messageType === "success" && (
              <p className="response-subtext">
                We'll send you event updates via email.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrationForm;
