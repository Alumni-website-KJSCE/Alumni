import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../utils/axiosConfig";
const API_URL = import.meta.env.VITE_API_URL
import "./AlumniVisits.css";

const AlumniVisits = () => {
  const [alumniVisitImages, setAlumniVisitImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    const fetchAlumniVisits = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/settings");

        if (response.data && Array.isArray(response.data.campusGallery)) {
          // Filter and sort alumni visit images
          const alumniVisits = response.data.campusGallery
            .filter((image) => image.category === "Alumni Visits")
            .sort((a, b) => {
              // Sort by year (descending) first, then by date if available
              if (a.year && b.year) {
                if (a.year !== b.year) return b.year - a.year;
              }
              if (!a.date || !b.date) return 0;
              return new Date(b.date) - new Date(a.date);
            });
          setAlumniVisitImages(alumniVisits);
        } else {
          setAlumniVisitImages([]);
        }
      } catch (error) {
        console.error("Error fetching alumni visit images:", error);
        setError("Failed to load alumni visit images. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniVisits();
  }, []);

  // Get unique years for filtering
  const availableYears = [...new Set(alumniVisitImages.map(image => image.year).filter(year => year))].sort((a, b) => b - a);

  // Filter images by selected year
  const filteredImages = selectedYear === "all" 
    ? alumniVisitImages 
    : alumniVisitImages.filter(image => image.year === parseInt(selectedYear));

  // Group images by year for display
  const groupedImages = filteredImages.reduce((acc, image) => {
    const year = image.year || 'Unknown';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(image);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(groupedImages).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return b - a;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="alumni-visits-container modern-section">
      <div className="modern-page-container">
        <section className="page-header">
          <motion.h1
            className="modern-heading"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Alumni Visits Gallery
          </motion.h1>
          <motion.p
            className="page-subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Memories from our distinguished alumni visits
          </motion.p>
        </section>

        <section className="alumni-visits-gallery">
          {loading ? (
            <div className="loading-container modern-card">
              <div className="loading-spinner" />
              <span>Loading images...</span>
            </div>
          ) : error ? (
            <div className="error-container modern-card">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="modern-button primary-btn"
              >
                Retry
              </button>
            </div>
          ) : alumniVisitImages.length === 0 ? (
            <div className="no-images-message modern-card">
              <p>No alumni visit images available at this time.</p>
            </div>
          ) : (
            <>
              {/* Year Filter */}
              {availableYears.length > 0 && (
                <div className="year-filter modern-card">
                  <label htmlFor="year-select">Filter by Year:</label>
                  <select
                    id="year-select"
                    className="modern-input"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Images grouped by year */}
              <motion.div
                className="years-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {sortedYears.map(year => (
                  <div key={year} className="year-section">
                    <h2 className="year-title">{year}</h2>
                    <motion.div
                      className="gallery-grid"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {groupedImages[year].map((image, index) => (
                        <motion.div
                          className="gallery-item modern-card"
                          key={`${year}-${index}`}
                          variants={itemVariants}
                          whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        >
                          <div className="image-wrapper">
                            <img
                              src={`${API_URL}${image.imageUrl}`}
                              alt={image.title || "Alumni visit"}
                              onClick={() => setSelectedImage(image)}
                              onError={(e) => {
                                e.target.src = "/fallback-image.jpg";
                                e.target.onerror = null;
                              }}
                            />
                            <div className="image-overlay">
                              <button 
                                className="view-btn"
                                onClick={() => setSelectedImage(image)}
                              >
                                <span>🔍</span> View
                              </button>
                            </div>
                          </div>
                          {image.title && (
                            <div className="caption">
                              <h3>{image.title}</h3>
                              {image.year && <span className="year-badge">{image.year}</span>}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </>
          )}
        </section>
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="lightbox-content modern-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="close-btn"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
              <img
                src={`${API_URL}${selectedImage.imageUrl}`}
                alt={selectedImage.title || "Alumni visit"}
              />
              {(selectedImage.title || selectedImage.year) && (
                <div className="lightbox-caption">
                  {selectedImage.title && <h3>{selectedImage.title}</h3>}
                  {selectedImage.year && (
                    <span className="lightbox-year">{selectedImage.year}</span>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlumniVisits;
