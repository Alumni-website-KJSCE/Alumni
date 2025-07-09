import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig";
import Campus from "../../assets/images/campus.jpg";
import "./Home.css";
import "./stay-connected-styles.css";

const API_URL = import.meta.env.VITE_API_URL

const GallerySection = ({ title, images }) => (
  <div className="gallery-section">
    <h3>{title}</h3>
    <div className="image-boxes">
      {images && images.length > 0 ? (
        images.map((image, index) => (
          <div className="box" key={index}>
            <img
              src={`${API_URL}${image.imageUrl}`}
              alt={image.caption || "Campus image"}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.textContent = "Image not available";
              }}
            />
            <p>{image.caption || "No caption available"}</p>
          </div>
        ))
      ) : (
        <div className="no-images-message">
          <p>No images available for this category.</p>
        </div>
      )}
    </div>
  </div>
);

const Home = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [newsContent, setNewsContent] = useState([]);
  const [campaignsContent, setCampaignsContent] = useState([]);
  const [careerContent, setCareerContent] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get("/api/settings");
        if (response.data) {
          // Handle campus gallery
          if (Array.isArray(response.data.campusGallery)) {
            setGalleryImages(response.data.campusGallery);
          } else {
            setGalleryImages([]);
          }
          // Handle multiple featured videos
          if (
            Array.isArray(response.data.featuredVideos) &&
            response.data.featuredVideos.length
          ) {
            setFeaturedVideos(response.data.featuredVideos);
          } else {
            setFeaturedVideos([]);
          }
          // Handle stay connected content
          if (
            Array.isArray(response.data.stayConnected) &&
            response.data.stayConnected.length
          ) {
            // Group items by category
            const stayConnectedByCategory = response.data.stayConnected.reduce(
              (acc, item) => {
                if (!acc[item.category]) {
                  acc[item.category] = [];
                }
                acc[item.category].push(item);
                return acc;
              },
              {},
            );

            setNewsContent(stayConnectedByCategory.news || []);
            setCampaignsContent(stayConnectedByCategory.campaigns || []);
            setCareerContent(stayConnectedByCategory.career || []);
          }
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
        // Set empty defaults on error
        setGalleryImages([]);
        setFeaturedVideos([]);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/events");
        // Sort events by date (closest first) and take first 4
        const sortedEvents = response.data
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 4);
        setEvents(sortedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  // Group images by category, excluding "Alumni Visits" which has its own dedicated page
  const categories = galleryImages
    .filter((image) => image.category !== "Alumni Visits") // Filter out Alumni Visits images
    .reduce((acc, image) => {
      const category = image.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(image);
      return acc;
    }, {});

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <img src={Campus} alt="KJSCE Campus" className="hero-image" />
        <div className="hero-content">
          <h1 className="hero-title">Welcome to the Alumni Network</h1>
          <p className="hero-subtitle">
            Connect with fellow alumni, stay updated with campus news, and
            explore exciting opportunities.
          </p>
          <a href="/signup" className="hero-button">
            Register Now
          </a>
        </div>
      </section>
      {/* Tabs Section */}{" "}
      <section className="section">
        <h2 className="section-title">Stay Connected</h2>
        <div className="tabs-container">
          <div className="scrollable-tabs-container">
            <div className="scrollable-tabs tabs">
              <div
                className={`tab ${activeTab === "news" ? "active" : ""}`}
                onClick={() => handleTabClick("news")}
              >
                News & Updates
              </div>
              <div
                className={`tab ${activeTab === "events" ? "active" : ""}`}
                onClick={() => handleTabClick("events")}
              >
                Upcoming Events
              </div>
              <div
                className={`tab ${activeTab === "campaigns" ? "active" : ""}`}
                onClick={() => handleTabClick("campaigns")}
              >
                Campaigns
              </div>
              <div
                className={`tab ${activeTab === "career" ? "active" : ""}`}
                onClick={() => handleTabClick("career")}
              >
                Career Centre
              </div>
            </div>
            <div className="tab-indicators">
              <div
                className={`indicator ${activeTab === "news" ? "active" : ""}`}
              ></div>
              <div
                className={`indicator ${activeTab === "events" ? "active" : ""}`}
              ></div>
              <div
                className={`indicator ${activeTab === "campaigns" ? "active" : ""}`}
              ></div>
              <div
                className={`indicator ${activeTab === "career" ? "active" : ""}`}
              ></div>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === "news" && (
              <div className="card-grid">
                {newsContent.length > 0 ? (
                  newsContent.map((newsItem, index) => (
                    <div className="card" key={index}>
                      <div className="card-content">
                        <div className="card-badge">News</div>
                        <h3 className="card-title">{newsItem.title}</h3>
                        <p className="card-text">{newsItem.description}</p>
                        <div className="card-meta">
                          <span>{new Date().toLocaleDateString("en-GB")}</span>
                        </div>
                        <Link
                          to={`/news/${newsItem._id}`}
                          className="card-link"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-content-message">
                    <p>No news updates available at the moment.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "events" && (
              <div className="card-grid">
                {loading ? (
                  <div className="loading-container">Loading events...</div>
                ) : error ? (
                  <div className="error-container">{error}</div>
                ) : events.length === 0 ? (
                  <div className="no-events-container">
                    No upcoming events at this time. Please check back later.
                  </div>
                ) : (
                  events.map((event) => (
                    <div className="card" key={event._id}>
                      <div className="card-content">
                        <div className="card-badge">Event</div>
                        <h3 className="card-title">{event.title}</h3>
                        <p className="card-text">{event.description}</p>
                        <div className="event-details">
                          <p className="event-date">
                            Date: {formatDate(event.date)}
                          </p>
                          <p className="event-time">Time: {event.time}</p>
                          <p className="event-venue">Venue: {event.venue}</p>
                        </div>
                        <Link to={`/events`} className="card-link">
                          Register
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "campaigns" && (
              <div className="card-grid">
                {campaignsContent.length > 0 ? (
                  campaignsContent.map((campaign, index) => (
                    <div className="card" key={index}>
                      <div className="card-content">
                        <div className="card-badge">Campaign</div>
                        <h3 className="card-title">{campaign.title}</h3>
                        <p className="card-text">{campaign.description}</p>
                        <a
                          href={campaign.linkUrl}
                          className="card-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {campaign.linkText || "Learn More"}
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-content-message">
                    <p>No campaigns available at the moment.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "career" && (
              <div className="card-grid">
                {careerContent.length > 0 ? (
                  careerContent.map((careerItem, index) => (
                    <div className="card" key={index}>
                      <div className="card-content">
                        <div className="card-badge">Career</div>
                        <h3 className="card-title">{careerItem.title}</h3>
                        <p className="card-text">{careerItem.description}</p>
                        {careerItem.linkUrl ? (
                          <a
                            href={careerItem.linkUrl}
                            className="card-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {careerItem.linkText || "View Opportunities"}
                          </a>
                        ) : (
                          <Link to="/careers" className="card-link">
                            View Opportunities
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-content-message">
                    <p>No career opportunities available at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Campus Gallery Section */}
      <section className="section">
        <h2 className="section-title">Campus Gallery</h2>
        <div className="gallery-container">
          {galleryImages && galleryImages.length > 0 ? (
            Object.entries(categories).map(([category, images]) => (
              <GallerySection key={category} title={category} images={images} />
            ))
          ) : (
            <div className="no-gallery-message">
              <p>
                Campus gallery is being updated. Please check back later for
                photos!
              </p>
            </div>
          )}
        </div>
      </section>
      {/* Videos Section */}
      <section className="section">
        <h2 className="section-title">Featured Videos</h2>
        {featuredVideos.length > 0 ? (
          <div className="video-boxes">
            {featuredVideos.map((video) => (
              <div key={video._id} className="box">
                <iframe
                  src={video.videoUrl}
                  title={video.title || "Featured Video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onError={(e) => {
                    console.error("Video loading error:", e);
                  }}
                ></iframe>
                <div className="video-content">
                  <h3>{video.title || "Featured Video"}</h3>
                  <p>{video.description || "No description available"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-video-message">
            <p>Featured videos will be available soon. Stay tuned!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
