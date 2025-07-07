import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Events.css";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaRegClock,
  FaTimes,
} from "react-icons/fa";
import EventRegistrationForm from "../../components/EventRegistrationForm/EventRegistrationForm";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState("");

  // Fetch events from the server
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/events");

        // Sort events by date (closest first)
        const sortedEvents = response.data.sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        );

        setEvents(sortedEvents);

        // Select the first event by default if available
        if (sortedEvents.length > 0) {
          setSelectedEvent(sortedEvents[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Set up countdown timer for the selected event
  useEffect(() => {
    if (!selectedEvent) return;

    const countdownTimer = setInterval(() => {
      const eventDate = new Date(selectedEvent.date).getTime();
      const now = new Date().getTime();
      const distance = eventDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        setCountdown("The event has started!");
      } else {
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [selectedEvent]);
  // Handle event selection
  const handleEventSelect = (event) => {
    setSelectedEvent(event);

    // Smooth scroll to event details
    setTimeout(() => {
      const eventDetailsSection = document.querySelector(".event-details-card");
      if (eventDetailsSection) {
        eventDetailsSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  return (
    <div className="page-container">
      {loading ? (
        <div className="loading-container">
          <p>Loading events...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="no-events-container">
          <p>No upcoming events at this time. Please check back later.</p>
        </div>
      ) : (
        <>
          <div className="events-list-container">
            <h2 className="section-title">Upcoming Events</h2>
            <div className="events-list">
              {events.map((event) => (
                <div
                  key={event._id}
                  className={`event-list-item ${selectedEvent && selectedEvent._id === event._id ? "active" : ""}`}
                  onClick={() => handleEventSelect(event)}
                >
                  <h3>{event.title}</h3>
                  <p>
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {selectedEvent && (
            <>
              <div
                className="event-hero"
                style={
                  selectedEvent.imageUrl
                    ? {
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${selectedEvent.imageUrl})`,
                      }
                    : {}
                }
              >
                <div className="countdown-banner">
                  <h1>{selectedEvent.title}</h1>
                  <div className="countdown-display">
                    <FaRegClock className="countdown-icon" />
                    <span>{countdown}</span>
                  </div>
                </div>
              </div>

              <main className="events-container">
                <section className="event-details-card">
                  <h2 className="section-title">Event Details</h2>
                  <div className="event-info">
                    <div className="info-item">
                      <FaCalendarAlt className="info-icon" />
                      <div>
                        <h3>Date</h3>
                        <p>
                          {new Date(selectedEvent.date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="info-item">
                      <FaClock className="info-icon" />
                      <div>
                        <h3>Time</h3>
                        <p>{selectedEvent.time}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <FaMapMarkerAlt className="info-icon" />
                      <div>
                        <h3>Venue</h3>
                        <p>{selectedEvent.venue}</p>
                      </div>
                    </div>

                    <div className="info-item">
                      <FaUsers className="info-icon" />
                      <div>
                        <h3>Participants</h3>
                        <p>Alumni from all batches</p>
                      </div>
                    </div>
                  </div>

                  <div className="event-description">
                    <h3>About This Event</h3>
                    <p>{selectedEvent.description}</p>
                  </div>
                </section>

                <div className="two-column-layout">
                  {selectedEvent.schedule &&
                    selectedEvent.schedule.length > 0 && (
                      <section className="event-schedule-card">
                        <h2 className="section-title">Event Schedule</h2>
                        <div className="timeline">
                          {selectedEvent.schedule.map((item, index) => (
                            <div className="timeline-item" key={index}>
                              <div className="timeline-time">{item.time}</div>
                              <div className="timeline-content">
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                  <section className="registration-card">
                    <EventRegistrationForm eventId={selectedEvent._id} />
                  </section>
                </div>

                <section className="location-section">
                  <h2 className="section-title">Event Location</h2>
                  <div className="map-container">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.792650630278!2d72.89735127583775!3d19.072852052070022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c627a20bcaa9%3A0xb2fd3bcfeac0052a!2sK.%20J.%20Somaiya%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1720426028384!5m2!1sen!2sin"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <div className="location-info">
                    <h3>K. J. Somaiya College of Engineering</h3>
                    <p>Vidyavihar, Mumbai, Maharashtra 400077</p>
                    <p>Parking available on campus</p>
                  </div>
                </section>
              </main>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default EventsPage;
