import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../utils/axiosConfig";
import "./AlumniVisits.css";

const AlumniVisits = () => {
  const [alumniVisitImages, setAlumniVisitImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
    <div className="alumni-visits-container">
      <section className="page-header">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Alumni Visits Gallery
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          Explore moments captured during visits from our distinguished alumni
          to their alma mater
        </motion.p>
      </section>

      <section className="alumni-visits-gallery">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span>Loading alumni visit images...</span>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Retry Loading
            </button>
          </div>
        ) : alumniVisitImages.length === 0 ? (
          <div className="no-images-message">
            <p>No alumni visit images available at this time.</p>
            <p>
              Check back later for updates on alumni visits and interactions!
            </p>
          </div>
        ) : (
          <motion.div
            className="gallery-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {alumniVisitImages.map((image, index) => (
              <motion.div
                className="gallery-item"
                key={index}
                variants={itemVariants}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
              >
                <div className="image-wrapper">
                  <img
                    src={`http://localhost:3001${image.imageUrl}`}
                    alt={image.title || "Visit photo"}
                    onClick={() => setSelectedImage(image)}
                    onError={(e) => {
                      e.target.src = "/fallback-image.jpg";
                      e.target.onerror = null;
                    }}
                  />
                </div>{" "}
                <div className="caption">
                  <h3>{image.title}</h3>
                  <p className="visit-description">
                    {image.caption || "No description available"}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

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
              className="lightbox-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`http://localhost:3001${selectedImage.imageUrl}`}
                alt={selectedImage.title || "Visit photo"}
              />
              <div className="lightbox-caption">
                <h3>{selectedImage.title}</h3>
                <p>{selectedImage.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlumniVisits;
