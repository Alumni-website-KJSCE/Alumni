import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./AdminDashboard.css";
import "./validation-styles.css";
import { useNavigate, useLocation } from "react-router-dom";
import EventForm from "../../components/EventForm/EventForm";
import useScreenSize from "../../hooks/useScreenSize";
import {
  FaPlus,
  FaCalendarAlt,
  FaUsers,
  FaEdit,
  FaTrash,
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillAlt,
  FaClock,
  FaRegClock,
  FaGraduationCap,
  FaLink,
  FaNewspaper,
  FaBullhorn,
  FaImage,
  FaVideo,
  FaUpload,
  FaDownload,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL

// Utility function to validate URLs
const isValidURL = (url) => {
  if (!url) return true; // Allow empty URL
  try {
    new URL(url);
    // Further check if it starts with http:// or https://
    return url.startsWith("http://") || url.startsWith("https://");
  } catch (error) {
    return false;
  }
};

// Article Management Component
const ArticleManagement = ({ actionMessage, setActionMessage }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleFormData, setArticleFormData] = useState({
    title: '',
    description: '',
    linkUrl: '',
    linkText: 'Read more',
    order: 1,
    image: null
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/newsletters/articles');
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setActionMessage({
        type: 'error',
        text: 'Failed to fetch articles'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!articleFormData.title || !articleFormData.description) {
      setActionMessage({
        type: 'error',
        text: 'Title and description are required'
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', articleFormData.title);
    formData.append('description', articleFormData.description);
    formData.append('linkUrl', articleFormData.linkUrl);
    formData.append('linkText', articleFormData.linkText);
    formData.append('order', articleFormData.order);
    
    if (articleFormData.image) {
      formData.append('image', articleFormData.image);
    }

    try {
      if (editingArticle) {
        await axiosInstance.put(`/api/newsletters/articles/${editingArticle._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setActionMessage({
          type: 'success',
          text: 'Article updated successfully'
        });
      } else {
        await axiosInstance.post('/api/newsletters/articles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setActionMessage({
          type: 'success',
          text: 'Article created successfully'
        });
      }
      
      // Reset form
      setArticleFormData({
        title: '',
        description: '',
        linkUrl: '',
        linkText: 'Read more',
        order: 1,
        image: null
      });
      setEditingArticle(null);
      setShowArticleForm(false);
      document.getElementById('article-image-input').value = '';
      
      // Refresh articles
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save article'
      });
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setArticleFormData({
      title: article.title,
      description: article.description,
      linkUrl: article.linkUrl || '',
      linkText: article.linkText || 'Read more',
      order: article.order || 1,
      image: null
    });
    setShowArticleForm(true);
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/newsletters/articles/${articleId}`);
      setActionMessage({
        type: 'success',
        text: 'Article deleted successfully'
      });
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete article'
      });
    }
  };

  const handleCancel = () => {
    setShowArticleForm(false);
    setEditingArticle(null);
    setArticleFormData({
      title: '',
      description: '',
      linkUrl: '',
      linkText: 'Read more',
      order: 1,
      image: null
    });
    document.getElementById('article-image-input').value = '';
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setArticleFormData(prev => ({ ...prev, image: file }));
    } else {
      setActionMessage({
        type: 'error',
        text: 'Please select a valid image file'
      });
      e.target.value = '';
    }
  };

  return (
    <div className="article-management-container">
      <div className="section-header" style={{display:"block",width:"752px"}}>
        <h3 style={{display:"block"}}><FaNewspaper /> Featured Articles Management</h3>
        <button 
          className="approve-button"
          onClick={() => setShowArticleForm(true)}
          aria-label="Add new featured article"
          style={{alignItems:"center"}}
        >
          <FaPlus /> Add New Article
        </button>
      </div>

      {showArticleForm && (
        <div className="article-form-section">
          <h4>{editingArticle ? 'Edit Article' : 'Create New Article'}</h4>
          <form onSubmit={handleFormSubmit} className="article-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="article-title">Title *</label>
                <input
                  id="article-title"
                  type="text"
                  value={articleFormData.title}
                  onChange={(e) => setArticleFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Article title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="article-order">Display Order</label>
                <input
                  id="article-order"
                  type="number"
                  value={articleFormData.order}
                  onChange={(e) => setArticleFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="article-description">Description *</label>
              <textarea
                id="article-description"
                value={articleFormData.description}
                onChange={(e) => setArticleFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Article description"
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="article-link-url">Link URL</label>
                <input
                  id="article-link-url"
                  type="url"
                  value={articleFormData.linkUrl}
                  onChange={(e) => setArticleFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="article-link-text">Link Text</label>
                <input
                  id="article-link-text"
                  type="text"
                  value={articleFormData.linkText}
                  onChange={(e) => setArticleFormData(prev => ({ ...prev, linkText: e.target.value }))}
                  placeholder="Read more"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="article-image-input">Article Image</label>
              <div className="file-input-wrapper">
                <input
                  id="article-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </div>
              <small>Choose an image for the article (max 5MB)</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="approve-button">
                {editingArticle ? 'Update Article' : 'Create Article'}
              </button>
              <button type="button" onClick={handleCancel} className="reject-button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="articles-list">
        <h4>Current Articles</h4>
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <p className="no-articles">No articles found.</p>
        ) : (
          <div className="articles-grid">
            {articles.map(article => (
              <div key={article._id} className="article-card">
                <div className="article-image-preview">
                  {article.imageUrl ? (
                    <img 
                      src={`${API_URL}${article.imageUrl}`} 
                      alt={article.title}
                    />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                </div>
                <div className="article-info">
                  <h5>{article.title}</h5>
                  <p>{article.description.substring(0, 100)}...</p>
                  <div className="article-meta">
                    <span>Order: {article.order}</span>
                    {article.linkUrl && <span>Has Link</span>}
                  </div>
                </div>
                <div className="article-actions">
                  <button
                    onClick={() => handleEdit(article)}
                    className="edit-button"
                    aria-label={`Edit article: ${article.title}`}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(article._id)}
                    className="delete-button"
                    aria-label={`Delete article: ${article.title}`}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Newsletter Management Component
const NewsletterManagement = ({ actionMessage, setActionMessage }) => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeNewsletterTab, setActiveNewsletterTab] = useState("newsletters");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/newsletters');
      setNewsletters(response.data.newsletters);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      setActionMessage({
        type: 'error',
        text: 'Failed to fetch newsletters'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setActionMessage({
        type: 'error',
        text: 'Please select a PDF file'
      });
      e.target.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedMonth || !selectedFile) {
      setActionMessage({
        type: 'error',
        text: 'Please select both month and file'
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('newsletter', selectedFile);
    formData.append('month', selectedMonth);

    try {
      await axiosInstance.post('/api/newsletters/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setActionMessage({
        type: 'success',
        text: `Newsletter for ${selectedMonth} uploaded successfully`
      });
      
      // Reset form
      setSelectedMonth("");
      setSelectedFile(null);
      document.getElementById('newsletter-file').value = '';
      
      // Refresh newsletters list
      fetchNewsletters();
    } catch (error) {
      console.error('Error uploading newsletter:', error);
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload newsletter'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (month) => {
    if (!window.confirm(`Are you sure you want to delete the newsletter for ${month}?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/newsletters/${month.toLowerCase()}`);
      setActionMessage({
        type: 'success',
        text: `Newsletter for ${month} deleted successfully`
      });
      fetchNewsletters();
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      setActionMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete newsletter'
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="newsletter-management-container">
      <div className="dashboard-sidebar">
        <h3>Newsletter Sections</h3>
        <div className="tabs">
          <button
            className={`tab ${activeNewsletterTab === "newsletters" ? "active" : ""}`}
            onClick={() => setActiveNewsletterTab("newsletters")}
            aria-pressed={activeNewsletterTab === "newsletters"}
            aria-label="Manage newsletter PDFs"
          >
            <FaNewspaper /> Newsletter PDFs
          </button>
          <button
            className={`tab ${activeNewsletterTab === "articles" ? "active" : ""}`}
            onClick={() => setActiveNewsletterTab("articles")}
            aria-pressed={activeNewsletterTab === "articles"}
            aria-label="Manage featured articles"
          >
            <FaBullhorn /> Featured Articles
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        {activeNewsletterTab === "newsletters" ? (
          <>
            {/* Upload Section */}
            <div className="upload-section">
              <h3><FaUpload /> Upload Newsletter</h3>
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label htmlFor="month-select">Select Month:</label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                >
                  <option value="">Choose Month</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="newsletter-file">Select PDF File:</label>
                <div className="file-input-wrapper">
                  <input
                    id="newsletter-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    required
                  />
                </div>
                {selectedFile && (
                  <p className="file-info">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              
              <button 
                type="submit" 
                className={`approve-button ${uploading ? 'loading' : ''}`}
                disabled={uploading || !selectedMonth || !selectedFile}
                aria-label={uploading ? 'Uploading newsletter...' : 'Upload newsletter'}
              >
                {uploading ? 'Uploading...' : 'Upload Newsletter'}
              </button>
            </form>
          </div>

          {/* Newsletters List */}
          <div className="newsletters-list">
            <h3><FaNewspaper /> Current Newsletters</h3>
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading newsletters...</p>
              </div>
            ) : newsletters.length === 0 ? (
              <p className="no-newsletters">No newsletters uploaded yet.</p>
            ) : (
              <div className="newsletters-grid">
                {newsletters.map(newsletter => (
                  <div key={newsletter.month} className="newsletter-card">
                    <div className="newsletter-info">
                      <h4>{newsletter.month}</h4>
                      <p>Size: {formatFileSize(newsletter.size)}</p>
                      <p>Uploaded: {new Date(newsletter.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="newsletter-actions">
                      <a
                        href={`/api/newsletters/download/${newsletter.month.toLowerCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="download-button"
                        aria-label={`Download ${newsletter.month} newsletter`}
                      >
                        <FaDownload /> Download
                      </a>
                      <button
                        onClick={() => handleDelete(newsletter.month)}
                        className="delete-button"
                        aria-label={`Delete ${newsletter.month} newsletter`}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <ArticleManagement 
          actionMessage={actionMessage}
          setActionMessage={setActionMessage}
        />
      )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { isMobile } = useScreenSize();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("users");
  const [activeTab, setActiveTab] = useState("pending"); // For users and jobs
  const [siteSettings, setSiteSettings] = useState({
    campusGallery: [],
    featuredVideos: [],
    stayConnected: [],
  });
  const [activeContentManagementTab, setActiveContentManagementTab] =
    useState("gallery"); // For content sub-sections
  const [newVideo, setNewVideo] = useState({
    videoUrl: "",
    title: "",
    description: "",
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [rejectionComment, setRejectionComment] = useState("");
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [jobError, setJobError] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [showJobRejectModal, setShowJobRejectModal] = useState(false);
  const [jobRejectionComment, setJobRejectionComment] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showImageUploadForm, setShowImageUploadForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [imageUploadData, setImageUploadData] = useState({
    file: null,
    caption: "",
    category: "",
    year: "",
  });
  const [alumniVisitUploadData, setAlumniVisitUploadData] = useState({
    file: null,
    caption: "",
    year: "",
  });
  const [newStayConnectedItem, setNewStayConnectedItem] = useState({
    title: "",
    description: "",
    linkUrl: "",
    linkText: "", // Default to empty, placeholder will suggest "Learn More"
    category: "news",
  });
  const [editingStayConnectedItem, setEditingStayConnectedItem] =
    useState(null);
  const [activeStayConnectedTab, setActiveStayConnectedTab] = useState("news"); // For Stay Connected sub-categories
  // Search functionality state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const navigate = useNavigate();

  const clearActionMessage = () => {
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Function to filter users based on search query
  const filterUsers = (users, searchQuery) => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.branch && user.branch.toLowerCase().includes(query)) ||
        (user.graduationYear && user.graduationYear.toString().includes(query)) ||
        (user.highestQualification &&
          user.highestQualification.toLowerCase().includes(query)) ||
        (user.currentPosition && user.currentPosition.toLowerCase().includes(query)) ||
        (user.currentCompany && user.currentCompany.toLowerCase().includes(query)),
    );
  };

  const refreshUserLists = async () => {
    try {
      setLoading(true);
      const pendingResponse = await axiosInstance.get(
        "/api/admin/pending-users",
      );
      const pendingUsersData = pendingResponse.data;
      setPendingUsers(pendingUsersData);

      const usersResponse = await axiosInstance.get("/api/admin/users");
      const allUsersData = usersResponse.data;
      setAllUsers(allUsersData);

      setApprovedUsers(allUsersData.filter((u) => u.isApproved === true));

      const pendingUserIds = pendingUsersData.map((u) => u._id);
      setRejectedUsers(
        allUsersData.filter(
          (u) =>
            u.isApproved === false &&
            !pendingUserIds.includes(u._id) &&
            u.rejectionComment,
        ),
      );
    } catch (error) {
      console.error("Error refreshing user lists:", error);
      setError("Failed to refresh user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/kjsce-admin-login");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await refreshUserLists();
        const eventsResponse = await axiosInstance.get("/api/admin/events");
        setEvents(eventsResponse.data);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/kjsce-admin-login");
        } else {
          setError("Failed to fetch initial admin data");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [navigate]);

  // Handle navigation state from mobile pages
  useEffect(() => {
    if (location.state) {
      const { message, activeSection: navActiveSection } = location.state;

      // Set active section if specified
      if (navActiveSection) {
        setActiveSection(navActiveSection);
      }

      // Set message if specified
      if (message) {
        setActionMessage(message);
        clearActionMessage();
      }

      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  useEffect(() => {
    if (
      activeSection === "jobs" &&
      pendingJobs.length === 0 &&
      approvedJobs.length === 0
    ) {
      setJobError(null);
      setJobsLoading(true);
      axiosInstance
        .get("/api/admin/jobs")
        .then((res) => {
          setPendingJobs(res.data.filter((job) => job.status === "pending"));
          setApprovedJobs(res.data.filter((job) => job.status === "approved"));
          setJobsLoading(false);
        })
        .catch(() => {
          setJobError("Failed to load jobs.");
          setJobsLoading(false);
        });
    }
  }, [activeSection, pendingJobs.length, approvedJobs.length]);

  useEffect(() => {
    if (activeSection === "content") {
      fetchSiteSettings();
    }
  }, [activeSection]);

  const handleApprove = async (userId) => {
    try {
      const response = await axiosInstance.put(
        `/api/admin/approve-user/${userId}`,
      );
      await refreshUserLists();
      if (selectedUser?._id === userId) setSelectedUser(response.data);
      setActionMessage({
        type: "success",
        text: "User approved successfully and added to alumni directory",
      });
      clearActionMessage();
    } catch (error) {
      console.error("Error approving user:", error);
      setActionMessage({ type: "error", text: "Failed to approve user" });
      clearActionMessage();
    }
  };

  const handleReject = async (userId) => {
    if (!rejectionComment.trim()) {
      setActionMessage({
        type: "error",
        text: "Rejection reason is required.",
      });
      clearActionMessage();
      return;
    }
    try {
      const response = await axiosInstance.put(
        `/api/admin/reject-user/${userId}`,
        { rejectionComment },
      );
      await refreshUserLists();
      if (selectedUser?._id === userId) setSelectedUser(response.data);
      setActionMessage({ type: "success", text: "User rejected successfully" });
      setShowRejectModal(false);
      setRejectionComment("");
      clearActionMessage();
    } catch (error) {
      console.error("Error rejecting user:", error);
      setActionMessage({ type: "error", text: "Failed to reject user" });
      clearActionMessage();
    }
  };

  const handleSyncAlumni = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      const response = await axiosInstance.post("/api/admin/sync-alumni");
      const { syncedCount, skippedCount, errors } = response.data;
      let message = `Sync completed! ${syncedCount} users synced.`;
      if (skippedCount > 0)
        message += ` ${skippedCount} skipped (already in alumni).`;
      if (errors.length > 0) message += ` ${errors.length} errors.`;
      setSyncMessage({ type: "success", text: message });
    } catch (error) {
      console.error("Error syncing alumni:", error);
      setSyncMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to sync alumni directory",
      });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 7000);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSelectedUser(null); // Clear selection when changing tabs
    setSelectedJob(null);
    setUserSearchQuery(""); // Clear search when changing tabs
  };

  const handleUserSelect = (user) => setSelectedUser(user);
  const handleJobSelect = (job) => setSelectedJob(job);
  const handleRejectClick = () => setShowRejectModal(true);
  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectionComment("");
  };

  useEffect(() => {
    if (!selectedEvent) return;
    const fetchRegistrations = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/admin/events/${selectedEvent._id}/registrations`,
        );
        setEventRegistrations(response.data);
      } catch {
        setActionMessage({
          type: "error",
          text: "Failed to load registrations",
        });
        clearActionMessage();
      }
    };
    fetchRegistrations();
  }, [selectedEvent]);

  const handleApproveJob = async (jobId) => {
    try {
      const approvedJob = pendingJobs.find((job) => job._id === jobId);
      await axiosInstance.put(`/api/admin/jobs/${jobId}/approve`);
      setPendingJobs((prev) => prev.filter((job) => job._id !== jobId));
      if (approvedJob)
        setApprovedJobs((prev) => [
          ...prev,
          { ...approvedJob, status: "approved" },
        ]);
      setActionMessage({ type: "success", text: "Job approved successfully" });
      if (selectedJob?._id === jobId) setSelectedJob(null);
      clearActionMessage();
    } catch (error) {
      console.error("Error approving job:", error);
      setJobError("Failed to approve job.");
    }
  };

  const handleRejectJob = (jobId) => {
    setSelectedJobId(jobId);
    setShowJobRejectModal(true);
  };

  const handleConfirmJobReject = async () => {
    if (!selectedJobId || !jobRejectionComment.trim()) {
      setJobError("Rejection reason is required.");
      return;
    }
    try {
      await axiosInstance.put(`/api/admin/jobs/${selectedJobId}/reject`, {
        rejectionComment: jobRejectionComment,
      });
      setPendingJobs((prev) => prev.filter((job) => job._id !== selectedJobId));
      // Optionally, move to a 'rejectedJobs' list if you have one
      setActionMessage({ type: "success", text: "Job rejected successfully" });
      setShowJobRejectModal(false);
      setJobRejectionComment("");
      if (selectedJob?._id === selectedJobId) setSelectedJob(null);
      setSelectedJobId(null);
      clearActionMessage();
    } catch (error) {
      console.error("Error rejecting job:", error);
      setJobError("Failed to reject job.");
    }
  };

  const handleCancelJobReject = () => {
    setShowJobRejectModal(false);
    setJobRejectionComment("");
    setSelectedJobId(null);
  };

  const handleDeleteEvent = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event and all its registrations? This action cannot be undone.",
      )
    )
      return;
    try {
      await axiosInstance.delete(`/api/admin/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      if (selectedEvent?._id === eventId) setSelectedEvent(null);
      setActionMessage({ type: "success", text: "Event deleted successfully" });
      clearActionMessage();
    } catch {
      setActionMessage({ type: "error", text: "Failed to delete event" });
      clearActionMessage();
    }
  };

  // Handle event creation/update
  const handleEventCreated = async () => {
    try {
      const eventsResponse = await axiosInstance.get("/api/admin/events");
      setEvents(eventsResponse.data);
      setShowEventForm(false);
      setIsEditingEvent(false);
      setSelectedEvent(null);
      setActionMessage({
        type: "success",
        text: isEditingEvent
          ? "Event updated successfully"
          : "Event created successfully",
      });
      clearActionMessage();
    } catch (error) {
      console.error("Error refreshing events:", error);
      setActionMessage({
        type: "error",
        text: "Event saved but failed to refresh list",
      });
      clearActionMessage();
    }
  };

  // Handle edit event click - responsive behavior
  const handleEditEvent = () => {
    if (isMobile) {
      // On mobile, navigate to dedicated page with event data
      navigate("/admin/events/edit", { state: { event: selectedEvent } });
    } else {
      // On desktop, show modal
      setIsEditingEvent(true);
      setShowEventForm(true);
    }
  };

  // Handle create event click - responsive behavior
  const handleCreateEventClick = () => {
    if (isMobile) {
      // On mobile, navigate to dedicated page
      navigate("/admin/events/create");
    } else {
      // On desktop, show modal
      setIsEditingEvent(false);
      setSelectedEvent(null);
      setShowEventForm(true);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await axiosInstance.get("/api/settings");
      const settingsData = {
        campusGallery: response.data.campusGallery || [],
        featuredVideos: response.data.featuredVideos || [],
        stayConnected: response.data.stayConnected || [],
      };
      if (settingsData.stayConnected) {
        settingsData.stayConnected.sort((a, b) => {
          const categoryOrder = { news: 1, campaigns: 2, career: 3 }; // Define order
          if (categoryOrder[a.category] !== categoryOrder[b.category]) {
            return categoryOrder[a.category] - categoryOrder[b.category];
          }
          return (a.order || 0) - (b.order || 0); // Fallback to order if categories are same
        });
      }
      setSiteSettings(settingsData);
    } catch (error) {
      setError("Failed to load site settings. Please try again.");
      console.error("Error fetching site settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (
      !imageUploadData.file ||
      !imageUploadData.caption ||
      !imageUploadData.category
    ) {
      setActionMessage({
        type: "error",
        text: "Please select a file, enter a caption, and choose a category.",
      });
      clearActionMessage();
      return;
    }

    // Validate year for Alumni Visits
    if (imageUploadData.category === "Alumni Visits") {
      if (!imageUploadData.year || isNaN(imageUploadData.year)) {
        setActionMessage({
          type: "error",
          text: "Year is required for Alumni Visits images.",
        });
        clearActionMessage();
        return;
      }
      const yearNum = parseInt(imageUploadData.year);
      const currentYear = new Date().getFullYear();
      if (yearNum < 1950 || yearNum > currentYear) {
        setActionMessage({
          type: "error",
          text: `Year must be between 1950 and ${currentYear}.`,
        });
        clearActionMessage();
        return;
      }
    }

    const formData = new FormData();
    formData.append("image", imageUploadData.file);
    formData.append("caption", imageUploadData.caption);
    formData.append("category", imageUploadData.category);
    
    // Add year only for Alumni Visits
    if (imageUploadData.category === "Alumni Visits") {
      formData.append("year", imageUploadData.year);
    }

    try {
      await axiosInstance.post("/api/settings/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchSiteSettings();
      setActionMessage({
        type: "success",
        text: "Image uploaded successfully",
      });
      setImageUploadData({ file: null, caption: "", category: "", year: "" });
      setShowImageUploadForm(false);
      const fileInput = document.getElementById("gallery-file-input-form"); // Updated ID
      if (fileInput) fileInput.value = "";
      clearActionMessage();
    } catch (error) {
      setActionMessage({ type: "error", text: "Failed to upload image" });
      console.error("Error uploading image:", error);
      clearActionMessage();
    }
  };

  const handleAlumniVisitUpload = async (e) => {
    e.preventDefault();
    if (
      !alumniVisitUploadData.file ||
      !alumniVisitUploadData.caption ||
      !alumniVisitUploadData.year
    ) {
      setActionMessage({
        type: "error",
        text: "Please select a file, enter a caption, and provide a year.",
      });
      clearActionMessage();
      return;
    }

    // Validate year
    const yearNum = parseInt(alumniVisitUploadData.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear) {
      setActionMessage({
        type: "error",
        text: `Year must be between 1950 and ${currentYear}.`,
      });
      clearActionMessage();
      return;
    }

    const formData = new FormData();
    formData.append("image", alumniVisitUploadData.file);
    formData.append("caption", alumniVisitUploadData.caption);
    formData.append("category", "Alumni Visits");
    formData.append("year", alumniVisitUploadData.year);

    try {
      await axiosInstance.post("/api/settings/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchSiteSettings();
      setActionMessage({
        type: "success",
        text: "Alumni visit image uploaded successfully",
      });
      setAlumniVisitUploadData({ file: null, caption: "", year: "" });
      setShowImageUploadForm(false);
      const fileInput = document.getElementById("alumni-visit-file-input");
      if (fileInput) fileInput.value = "";
      clearActionMessage();
    } catch (error) {
      setActionMessage({ type: "error", text: "Failed to upload alumni visit image" });
      console.error("Error uploading alumni visit image:", error);
      clearActionMessage();
    }
  };

  const handleFileSelect = (e) => { // This function is no longer used by the gallery form.
    const file = e.target.files[0];
    if (file) {
      setImageUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleVideoAdd = async (e) => {
    e.preventDefault();
    if (!newVideo.videoUrl.trim() || !newVideo.title.trim()) {
      setActionMessage({
        type: "error",
        text: "Video URL and Title are required.",
      });
      clearActionMessage();
      return;
    }
    if (
      !isValidURL(newVideo.videoUrl) ||
      (!newVideo.videoUrl.includes("youtube.com/embed/") &&
        !newVideo.videoUrl.includes("player.vimeo.com/video/"))
    ) {
      setActionMessage({
        type: "error",
        text: "Please use a valid YouTube or Vimeo embed URL.",
      });
      clearActionMessage();
      return;
    }
    try {
      await axiosInstance.post("/api/settings/videos", newVideo);
      setNewVideo({ videoUrl: "", title: "", description: "" });
      fetchSiteSettings();
      setActionMessage({ type: "success", text: "Video added successfully" });
      setShowVideoForm(false); // Hide form on successful add
      clearActionMessage();
    } catch (error) {
      setActionMessage({ type: "error", text: "Failed to add video" });
      console.error("Error adding video:", error);
      clearActionMessage();
    }
  };

  const handleVideoDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await axiosInstance.delete(`/api/settings/videos/${videoId}`);
      fetchSiteSettings();
      setActionMessage({ type: "success", text: "Video deleted successfully" });
      clearActionMessage();
    } catch (error) {
      setActionMessage({ type: "error", text: "Failed to delete video" });
      console.error("Error deleting video:", error);
      clearActionMessage();
    }
  };

  const handleImageDelete = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await axiosInstance.delete(`/api/settings/gallery/${imageId}`);
      fetchSiteSettings();
      setActionMessage({ type: "success", text: "Image deleted successfully" });
      clearActionMessage();
    } catch (error) {
      setActionMessage({ type: "error", text: "Failed to delete image" });
      console.error("Error deleting image:", error);
      clearActionMessage();
    }
  };

  const handleAddStayConnectedItem = async (e) => {
    e.preventDefault();
    if (
      !newStayConnectedItem.title.trim() ||
      !newStayConnectedItem.description.trim()
    ) {
      setActionMessage({
        type: "error",
        text: "Title and Description are required",
      });
      clearActionMessage();
      return;
    }
    if (
      newStayConnectedItem.linkUrl &&
      !isValidURL(newStayConnectedItem.linkUrl)
    ) {
      setActionMessage({
        type: "error",
        text: "Please enter a valid URL (starting with http:// or https://) or leave it empty.",
      });
      clearActionMessage();
      return;
    }
    try {
      const itemToAdd = {
        ...newStayConnectedItem,
        category: activeStayConnectedTab,
      };
      await axiosInstance.post("/api/settings/stay-connected", itemToAdd);
      fetchSiteSettings();
      setNewStayConnectedItem({
        title: "",
        description: "",
        linkUrl: "",
        linkText: "",
        category: activeStayConnectedTab,
      });
      setActionMessage({
        type: "success",
        text: "Stay Connected item added successfully",
      });
      clearActionMessage();
    } catch (error) {
      setActionMessage({
        type: "error",
        text: "Failed to add Stay Connected item",
      });
      console.error("Error adding Stay Connected item:", error);
      clearActionMessage();
    }
  };

  const handleUpdateStayConnectedItem = async (e) => {
    e.preventDefault();
    if (
      !editingStayConnectedItem ||
      !editingStayConnectedItem.title.trim() ||
      !editingStayConnectedItem.description.trim()
    ) {
      setActionMessage({
        type: "error",
        text: "Title and Description are required",
      });
      clearActionMessage();
      return;
    }
    if (
      editingStayConnectedItem.linkUrl &&
      !isValidURL(editingStayConnectedItem.linkUrl)
    ) {
      setActionMessage({
        type: "error",
        text: "Please enter a valid URL (starting with http:// or https://) or leave it empty.",
      });
      clearActionMessage();
      return;
    }
    try {
      await axiosInstance.put(
        `/api/settings/stay-connected/${editingStayConnectedItem._id}`,
        editingStayConnectedItem,
      );
      fetchSiteSettings();
      setEditingStayConnectedItem(null);
      setActionMessage({
        type: "success",
        text: "Stay Connected item updated successfully",
      });
      clearActionMessage();
    } catch (error) {
      setActionMessage({
        type: "error",
        text: "Failed to update Stay Connected item",
      });
      console.error("Error updating Stay Connected item:", error);
      clearActionMessage();
    }
  };

  const handleDeleteStayConnectedItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axiosInstance.delete(`/api/settings/stay-connected/${itemId}`);
      fetchSiteSettings();
      if (editingStayConnectedItem?._id === itemId)
        setEditingStayConnectedItem(null);
        setEditingStayConnectedItem(null);
      setActionMessage({
        type: "success",
        text: "Stay Connected item deleted successfully",
      });
      clearActionMessage();
    } catch (error) {
      setActionMessage({
        type: "error",
        text: "Failed to delete Stay Connected item",
      });
      console.error("Error deleting Stay Connected item:", error);
      clearActionMessage();
    }
  };

  const startEditingStayConnectedItem = (item) => {
    setEditingStayConnectedItem({ ...item });
    // Ensure the form's active category matches the item being edited
    setActiveStayConnectedTab(item.category);
  };

  const cancelEditingStayConnectedItem = () => {
    setEditingStayConnectedItem(null);
    // Optionally reset new item form if needed, or leave as is
    setNewStayConnectedItem({
      title: "",
      description: "",
      linkUrl: "",
      linkText: "",
      category: activeStayConnectedTab,
    });
  };

  const handleStayConnectedTabChange = (tab) => {
    setActiveStayConnectedTab(tab);
    setEditingStayConnectedItem(null); // Clear editing state when changing tabs
    setNewStayConnectedItem({
      title: "",
      description: "",
      linkUrl: "",
      linkText: "",
      category: tab,
    });
  };

  const handleContentManagementTabChange = (tab) => {
    setActiveContentManagementTab(tab);
    setActionMessage(null); // Clear messages when switching main content tabs
    setError(null);
    // Reset specific states if needed
    setShowImageUploadForm(false);
    setImageUploadData({ file: null, caption: "", category: "", year: "" });
    setAlumniVisitUploadData({ file: null, caption: "", year: "" });
    const galleryFileInput = document.getElementById("gallery-file-input-form");
    if (galleryFileInput) galleryFileInput.value = "";
    const alumniVisitFileInput = document.getElementById("alumni-visit-file-input");
    if (alumniVisitFileInput) alumniVisitFileInput.value = "";

    setNewVideo({ videoUrl: "", title: "", description: "" });
    setShowVideoForm(false); // Reset video form visibility

    cancelEditingStayConnectedItem(); // Also resets newStayConnectedItem for the current activeStayConnectedTab
  };

  const renderUserList = () => {
    let users = [];
    switch (activeTab) {
      case "pending":
        users = pendingUsers;
        break;
      case "approved":
        users = approvedUsers;
        break;
      case "rejected":
        users = rejectedUsers;
        break;
      case "all":
        users = allUsers;
        break;
      default:
        users = pendingUsers;
    }
    // Apply search filtering
    users = filterUsers(users, userSearchQuery);

    if (loading && activeSection === "users")
      return <div className="loading-state">Loading users...</div>;
    if (users.length === 0 && userSearchQuery.trim()) {
      return <div className="empty-list">No users found matching "{userSearchQuery}".</div>;
    }
    if (users.length === 0)
      return <div className="empty-list">No users found in this category.</div>;
    return (
      <div className="user-list">
        {users.map((user) => (
          <div
            key={user._id}
            className={`user-card ${selectedUser?._id === user._id ? "selected" : ""}`}
            onClick={() => handleUserSelect(user)}
          >
            <div className="user-card-header">
              {user.profilePicture ? (
                <img
                  src={`${API_URL}${user.profilePicture}`}
                  alt={user.name}
                  className="user-card-avatar"
                />
              ) : (
                <div className="user-card-avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h3>{user.name}</h3>
            </div>
            <div className="user-card-details">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Branch:</strong> {user.branch || "N/A"}
              </p>
              <p>
                <strong>Graduation:</strong> {user.graduationYear || "N/A"}
              </p>
              <div
                className={`status-badge ${user.isApproved ? "approved" : user.rejectionComment ? "rejected" : "pending"}`}
              >
                {user.isApproved
                  ? "Approved"
                  : user.rejectionComment
                    ? "Rejected"
                    : "Pending"}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderJobList = () => {
    let jobs = [];
    switch (activeTab) {
      case "pending-jobs":
        jobs = pendingJobs;
        break;
      case "approved-jobs":
        jobs = approvedJobs;
        break;
      default:
        jobs = pendingJobs;
    }
    if (jobsLoading)
      return <div className="loading-state">Loading jobs...</div>;
    if (jobError && activeSection === "jobs")
      return <div className="error-state">{jobError}</div>;
    if (jobs.length === 0)
      return <div className="empty-list">No jobs found in this category.</div>;
    return (
      <div className="user-list">
        {" "}
        {/* Reusing user-list for job cards */}
        {jobs.map((job) => (
          <div
            key={job._id}
            className={`user-card ${selectedJob?._id === job._id ? "selected" : ""}`}
            onClick={() => handleJobSelect(job)}
          >
            <div className="user-card-header">
              <div className="user-card-avatar-placeholder">
                <FaBriefcase />
              </div>
              <h3>{job.role}</h3>
            </div>
            <div className="user-card-details">
              <p>
                <strong>Company:</strong> {job.company}
              </p>
              <p>
                <strong>Type:</strong>{" "}
                {job.jobType === "job" ? "Full-Time" : "Internship"}
              </p>
              <div
                className={`status-badge ${job.status === "approved" ? "approved" : "pending"}`}
              >
                {job.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleEventSelect = (event) => setSelectedEvent(event);

  const renderEventsList = () => {
    if (loading && activeSection === "events" && events.length === 0)
      return <div className="loading-state">Loading events...</div>;
    if (events.length === 0)
      return <div className="empty-list">No events created yet.</div>;
    return (
      <div className="events-list">
        {events.map((event) => (
          <div
            key={event._id}
            className={`event-card ${selectedEvent?._id === event._id ? "selected" : ""}`}
            onClick={() => handleEventSelect(event)}
          >
            <div className="event-card-content">
              <h3>{event.title}</h3>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(event.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEventRegistrations = () => {
    if (!selectedEvent)
      return (
        <div className="no-selection">
          <p>Select an event to view its details and registrations.</p>
        </div>
      );
    if (eventRegistrations.length === 0)
      return (
        <div className="empty-list">No registrations for this event yet.</div>
      );
    return (
      <div className="registrations-list">
        <h3>Registrations for: {selectedEvent.title}</h3>

        {/* Scroll indicator for mobile */}
        <div className="scroll-indicator">
          📱 Swipe left to see more details →
        </div>

        {/* Table layout for larger screens */}
        <div className="table-container">
          <table className="registrations-table registrations-table-responsive">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Batch</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {eventRegistrations.map((reg) => (
                <tr key={reg._id}>
                  <td>{reg.name}</td>
                  <td>{reg.email}</td>
                  <td>{reg.batch}</td>
                  <td>{new Date(reg.registeredAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card layout for mobile screens */}
        <div className="registrations-cards">
          {eventRegistrations.map((reg) => (
            <div key={reg._id} className="registration-card">
              <div className="card-header">
                <div className="card-name">{reg.name}</div>
                <div className="card-batch">Batch {reg.batch}</div>
              </div>
              <div className="card-details">
                <div className="card-detail">
                  <span className="card-detail-label">Email:</span>
                  <span className="card-detail-value">{reg.email}</span>
                </div>
                <div className="card-detail">
                  <span className="card-detail-label">Registered:</span>
                  <span className="card-detail-value">
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      {showEventForm && (
        <div className="modal-overlay">
          <div className="modal-content event-form-modal">
            <EventForm
              onEventCreated={handleEventCreated}
              onCancel={() => {
                setShowEventForm(false);
                setIsEditingEvent(false);
              }}
              editEvent={isEditingEvent ? selectedEvent : null}
            />
          </div>
        </div>
      )}

      <section className="section admin-dashboard">
        <h2 className="section-title">Admin Dashboard</h2>

        <div className="section-tabs">
          <button
            className={`section-tab ${activeSection === "users" ? "active" : ""}`}
            onClick={() => setActiveSection("users")}
          >
            <FaUsers /> User Management
          </button>
          <button
            className={`section-tab ${activeSection === "events" ? "active" : ""}`}
            onClick={() => setActiveSection("events")}
          >
            <FaCalendarAlt /> Event Management
          </button>
          <button
            className={`section-tab ${activeSection === "jobs" ? "active" : ""}`}
            onClick={() => setActiveSection("jobs")}
          >
            <FaBriefcase /> Job Approvals
          </button>
          <button
            className={`section-tab ${activeSection === "content" ? "active" : ""}`}
            onClick={() => setActiveSection("content")}
          >
            <FaEdit /> Manage Website Content
          </button>
          <button
            className={`section-tab ${activeSection === "newsletter" ? "active" : ""}`}
            onClick={() => setActiveSection("newsletter")}
          >
            <FaNewspaper /> Newsletter
          </button>
        </div>

        {/* Centralized Action Message for non-content sections */}
        {activeSection !== "content" && actionMessage && (
          <div
            className={`action-message global-action-message ${typeof actionMessage === "object" ? actionMessage.type : "info"}`}
          >
            {typeof actionMessage === "object"
              ? actionMessage.text
              : actionMessage}
          </div>
        )}

        <div className="dashboard-container">
          {activeSection === "users" && (
            <>
              <div className="dashboard-sidebar">
                {/* Search Input */}
                <div className="search-section">
                  <h3>Search Users</h3>
                  <div className="search-input-container">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search by name, email, branch, year..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                    {userSearchQuery && (
                      <button
                        className="clear-search-btn"
                        onClick={() => setUserSearchQuery("")}
                        title="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {userSearchQuery && (
                    <p className="search-info">
                      Searching for: "{userSearchQuery}"
                    </p>
                  )}
                </div>
                <div className="tabs">
                  <button
                    className={`tab ${activeTab === "pending" ? "active" : ""}`}
                    onClick={() => handleTabChange("pending")}
                  >
                    Pending ({pendingUsers.length})
                  </button>
                  <button
                    className={`tab ${activeTab === "approved" ? "active" : ""}`}
                    onClick={() => handleTabChange("approved")}
                  >
                    Approved ({approvedUsers.length})
                  </button>
                  <button
                    className={`tab ${activeTab === "rejected" ? "active" : ""}`}
                    onClick={() => handleTabChange("rejected")}
                  >
                    Rejected ({rejectedUsers.length})
                  </button>
                  <button
                    className={`tab ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => handleTabChange("all")}
                  >
                    All Users ({allUsers.length})
                  </button>
                </div>
                <div className="sync-alumni-section">
                  <button
                    className="sync-alumni-button"
                    onClick={handleSyncAlumni}
                    disabled={syncing}
                    title="Sync all approved users to the alumni directory"
                  >
                    {syncing ? "Syncing..." : "Sync Alumni Directory"}
                  </button>
                  {syncMessage && (
                    <div className={`sync-message ${syncMessage.type}`}>
                      {syncMessage.text}
                    </div>
                  )}
                </div>
                {renderUserList()}
              </div>
              <div className="dashboard-content">
                {selectedUser ? (
                  <div className="user-details">
                    <h3>User Details</h3>
                    <div className="user-info">
                      <div className="info-group">
                        <label>Name</label>
                        <p>{selectedUser.name}</p>
                      </div>
                      <div className="info-group">
                        <label>Email</label>
                        <p>{selectedUser.email}</p>
                      </div>
                      <div className="info-group">
                        <label>Branch</label>
                        <p>{selectedUser.branch || "N/A"}</p>
                      </div>
                      <div className="info-group">
                        <label>Highest Qualification</label>
                        <p>{selectedUser.highestQualification || "N/A"}</p>
                      </div>
                      <div className="info-group">
                        <label>Graduation Year</label>
                        <p>{selectedUser.graduationYear || "N/A"}</p>
                      </div>
                      <div className="info-group">
                        <label>Current Company</label>
                        <p>{selectedUser.company || "N/A"}</p>
                      </div>
                      <div className="info-group">
                        <label>Current Posting</label>
                        <p>{selectedUser.currentPosting || "N/A"}</p>
                      </div>
                      <div className="info-group">
                        <label>Location</label>
                        <p>{selectedUser.location || "N/A"}</p>
                      </div>
                      <div className="info-group">
                        <label>Contribution Interest</label>
                        <p>{selectedUser.contributionInterest || "N/A"}</p>
                      </div>
                      {selectedUser.contributionDetails && (
                        <div className="info-group">
                          <label>Contribution Details</label>
                          <p>{selectedUser.contributionDetails}</p>
                        </div>
                      )}
                      <div className="info-group">
                        <label>LinkedIn</label>
                        <p>
                          {selectedUser.linkedin ? (
                            <a
                              href={selectedUser.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Profile <FaLink />
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </p>
                      </div>
                      {selectedUser.otherSocialLinks &&
                        Object.keys(selectedUser.otherSocialLinks).length >
                          0 && (
                          <div className="info-group">
                            <label>Other Social Links</label>
                            <div className="social-links-list">
                              {Object.entries(
                                selectedUser.otherSocialLinks,
                              ).map(
                                ([platform, url]) =>
                                  url && (
                                    <div
                                      key={platform}
                                      className="social-link-item"
                                    >
                                      <label>
                                        {platform.charAt(0).toUpperCase() +
                                          platform.slice(1)}
                                      </label>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        View <FaLink />
                                      </a>
                                    </div>
                                  ),
                              )}
                            </div>
                          </div>
                        )}
                      <div className="info-group">
                        <label>Council Member</label>
                        <p>{selectedUser.councilMember ? "Yes" : "No"}</p>
                      </div>
                      {selectedUser.councilMember &&
                        selectedUser.councils &&
                        selectedUser.councils.length > 0 && (
                          <div className="info-group">
                            <label>Council Memberships</label>
                            <div className="council-list">
                              {selectedUser.councils.map((council, index) => (
                                <div key={index} className="council-item-admin">
                                  <p>
                                    <strong>{council.councilName}</strong>:{" "}
                                    {council.councilPosition}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      <div className="info-group">
                        <label>Attendance Proof</label>
                        <p>
                          {selectedUser.attendanceProof ? (
                            <a
                              href={`${API_URL}${selectedUser.attendanceProof}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Document
                            </a>
                          ) : (
                            "N/A"
                          )}
                        </p>
                      </div>
                      <div className="info-group">
                        <label>Profile Picture</label>
                        <div className="profile-picture-container">
                          {selectedUser.profilePicture ? (
                            <img
                              src={`${API_URL}${selectedUser.profilePicture}`}
                              alt={selectedUser.name}
                              className="profile-picture"
                            />
                          ) : (
                            <div className="no-picture">No picture</div>
                          )}
                        </div>
                      </div>
                      <div className="info-group status-group">
                        <label>Status</label>
                        <p
                          className={`status ${selectedUser.isApproved ? "approved" : selectedUser.rejectionComment ? "rejected" : "pending"}`}
                        >
                          {selectedUser.isApproved
                            ? "Approved"
                            : selectedUser.rejectionComment
                              ? "Rejected"
                              : "Pending"}
                        </p>
                      </div>
                      {selectedUser.rejectionComment && (
                        <div className="info-group rejection-reason">
                          <label>Rejection Reason</label>
                          <p className="rejection-comment">
                            {selectedUser.rejectionComment}
                          </p>
                        </div>
                      )}
                    </div>
                    {!selectedUser.isApproved &&
                      !selectedUser.rejectionComment && (
                        <div className="action-buttons">
                          <button
                            className="approve-button"
                            onClick={() => handleApprove(selectedUser._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="reject-button"
                            onClick={handleRejectClick}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    {showRejectModal && (
                      <div className="modal-overlay">
                        <div className="modal-content">
                          <h3>Reject User</h3>
                          <p>
                            Provide a reason for rejecting this user (visible to
                            user).
                          </p>
                          <div className="form-group">
                            <label htmlFor="rejectionComment">
                              Rejection Reason:
                            </label>
                            <textarea
                              id="rejectionComment"
                              value={rejectionComment}
                              onChange={(e) =>
                                setRejectionComment(e.target.value)
                              }
                              placeholder="Explain rejection..."
                              rows="4"
                            ></textarea>
                          </div>
                          <div className="modal-actions">
                            <button
                              className="cancel-button"
                              onClick={handleCancelReject}
                            >
                              Cancel
                            </button>
                            <button
                              className="confirm-button"
                              onClick={() => handleReject(selectedUser._id)}
                              disabled={!rejectionComment.trim()}
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-selection">
                    <p>Select a user to view details.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === "events" && (
            <>
              <div className="dashboard-sidebar">
                <div className="create-event-button-container">
                  <button
                    className="create-event-button"
                    onClick={handleCreateEventClick}
                  >
                    <FaPlus /> Create New Event
                  </button>
                </div>
                {renderEventsList()}
              </div>
              <div className="dashboard-content">
                {selectedEvent && (
                  <div className="event-management-controls">
                    <h3 style={{ color: "var(--text-dark)" }}>
                      Event Management: {selectedEvent.title}
                    </h3>
                    <div className="event-actions-buttons">
                      <button
                        className="event-edit-button-large"
                        onClick={handleEditEvent}
                      >
                        <FaEdit /> Edit Event
                      </button>
                      <button
                        className="event-delete-button-large"
                        onClick={() => handleDeleteEvent(selectedEvent._id)}
                      >
                        <FaTrash /> Delete Event
                      </button>
                    </div>
                  </div>
                )}
                {renderEventRegistrations()}
              </div>
            </>
          )}

          {activeSection === "jobs" && (
            <>
              <div className="dashboard-sidebar">
                <div className="tabs">
                  <button
                    className={`tab ${activeTab === "pending-jobs" ? "active" : ""}`}
                    onClick={() => setActiveTab("pending-jobs")}
                  >
                    <FaRegClock /> Pending ({pendingJobs.length})
                  </button>
                  <button
                    className={`tab ${activeTab === "approved-jobs" ? "active" : ""}`}
                    onClick={() => setActiveTab("approved-jobs")}
                  >
                    <FaCheckCircle /> Approved ({approvedJobs.length})
                  </button>
                </div>
                {renderJobList()}
              </div>
              <div className="dashboard-content">
                {selectedJob ? (
                  <div className="job-details">
                    <div className="job-details-header">
                      <h3>{selectedJob.role}</h3>
                      <span
                        className={`job-type-badge ${selectedJob.jobType === "job" ? "full-time" : "internship"}`}
                      >
                        {selectedJob.jobType === "job"
                          ? "Full-Time"
                          : "Internship"}
                      </span>
                    </div>
                    <div className="job-info">
                      <div className="info-group">
                        <label>Company</label>
                        <p>
                          <FaBuilding className="job-icon" />{" "}
                          {selectedJob.company}
                        </p>
                      </div>
                      <div className="info-group">
                        <label>Category</label>
                        <p>
                          <FaBriefcase className="job-icon" />{" "}
                          {selectedJob.category}
                        </p>
                      </div>
                      <div className="info-group">
                        <label>Location</label>
                        <p>
                          <FaMapMarkerAlt className="job-icon" />{" "}
                          {selectedJob.location}
                        </p>
                      </div>
                      <div className="info-group">
                        <label>Compensation</label>
                        <p>
                          <FaMoneyBillAlt className="job-icon" />{" "}
                          {selectedJob.pay}
                        </p>
                      </div>
                      {selectedJob.jobType === "internship" ? (
                        <div className="info-group">
                          <label>Duration</label>
                          <p>
                            <FaClock className="job-icon" />{" "}
                            {selectedJob.duration}
                          </p>
                        </div>
                      ) : (
                        <div className="info-group">
                          <label>Experience</label>
                          <p>
                            <FaGraduationCap className="job-icon" />{" "}
                            {selectedJob.experience}
                          </p>
                        </div>
                      )}
                      <div className="info-group">
                        <label>Apply By</label>
                        <p>
                          <FaRegClock className="job-icon" />{" "}
                          {new Date(selectedJob.applyBy).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="info-group">
                        <label>Apply Link</label>
                        <p>
                          <FaLink className="job-icon" />
                          <a
                            href={selectedJob.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="job-apply-link"
                          >
                            {selectedJob.applyLink.length > 50
                              ? selectedJob.applyLink.substring(0, 50) + "..."
                              : selectedJob.applyLink}
                          </a>
                        </p>
                      </div>
                      <div className="info-group">
                        <label>Description</label>
                        <div className="job-description-content">
                          <p>{selectedJob.description}</p>
                        </div>
                      </div>
                      <div className="info-group status-group">
                        <label>Status</label>
                        <p
                          className={`status ${selectedJob.status === "approved" ? "approved" : "pending"}`}
                        >
                          {selectedJob.status}
                        </p>
                      </div>
                      {selectedJob.rejectionComment && (
                        <div className="info-group rejection-reason">
                          <label>Rejection Reason</label>
                          <p className="rejection-comment">
                            {selectedJob.rejectionComment}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedJob.status === "pending" && (
                      <div className="action-buttons">
                        <button
                          className="approve-button"
                          onClick={() => handleApproveJob(selectedJob._id)}
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button
                          className="reject-button"
                          onClick={() => handleRejectJob(selectedJob._id)}
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-selection">
                    <p>Select a job to view details.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === "content" && (
            <div className="content-management-container">
              <div className="content-management-sidebar">
                <h3>Content Sections</h3>
                <div className="tabs">
                  <button
                    className={`tab ${activeContentManagementTab === "gallery" ? "active" : ""}`}
                    onClick={() => handleContentManagementTabChange("gallery")}
                  >
                    <FaImage /> Campus Gallery
                  </button>
                  <button
                    className={`tab ${activeContentManagementTab === "alumniVisits" ? "active" : ""}`}
                    onClick={() => handleContentManagementTabChange("alumniVisits")}
                  >
                    <FaUsers /> Alumni Visits
                  </button>
                  <button
                    className={`tab ${activeContentManagementTab === "videos" ? "active" : ""}`}
                    onClick={() => handleContentManagementTabChange("videos")}
                  >
                    <FaVideo /> Featured Videos
                  </button>
                  <button
                    className={`tab ${activeContentManagementTab === "stayConnected" ? "active" : ""}`}
                    onClick={() =>
                      handleContentManagementTabChange("stayConnected")
                    }
                  >
                    <FaLink /> Stay Connected
                  </button>
                </div>
              </div>
              <div className="content-management-main">
                {actionMessage && (
                  <div
                    className={`action-message ${typeof actionMessage === "object" ? actionMessage.type : "info"}`}
                  >
                    {typeof actionMessage === "object"
                      ? actionMessage.text
                      : actionMessage}
                  </div>
                )}
                {loading && <div className="loading-state">Loading...</div>}
                {error && !loading && (
                  <div className="error-state">{error}</div>
                )}

                {!loading && !error && (
                  <>
                    {activeContentManagementTab === "gallery" && (
                      // The gallery-management-wrapper div needs CSS like display: flex; for side-by-side layout.
                      <div className="section-card gallery-management-wrapper">
                        <div className="dashboard-sidebar inner-sidebar">
                          <h3>Gallery Actions</h3>
                          <div className="tabs">
                            <button
                              className={`tab ${!showImageUploadForm ? "active" : ""}`}
                              onClick={() => {
                                setShowImageUploadForm(false);
                              }}
                            >
                              <FaImage /> View Images
                            </button>
                            <button
                              className={`tab ${showImageUploadForm ? "active" : ""}`}
                              onClick={() => {
                                setShowImageUploadForm(true);
                                setImageUploadData({
                                  file: null,
                                  caption: "",
                                  category: "",
                                  year: "",
                                });
                                const fileInput = document.getElementById(
                                  "gallery-file-input-form",
                                );
                                if (fileInput) fileInput.value = "";
                              }}
                            >
                              <FaPlus /> Upload New Image
                            </button>
                          </div>
                        </div>
                        <div className="dashboard-content inner-content">
                          {showImageUploadForm ? (
                            <form
                              onSubmit={handleImageUpload}
                              className="image-upload-form"
                            >
                              <h3>Upload New Image</h3>
                              <div className="form-group">
                                <label htmlFor="gallery-file-input-form">
                                  Select Image File{" "}
                                  <span className="required">*</span>
                                </label>
                                <input
                                  id="gallery-file-input-form"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    setImageUploadData((prev) => ({
                                      ...prev,
                                      file: file || null,
                                    }));
                                  }}
                                  required
                                />
                                {imageUploadData.file && (
                                  <p className="file-name">
                                    Selected: {imageUploadData.file.name}
                                  </p>
                                )}
                                {!imageUploadData.file && (
                                  <p className="file-name-placeholder">
                                    No file selected
                                  </p>
                                )}
                              </div>
                              <div className="form-group">
                                <label htmlFor="image-caption">
                                  Caption <span className="required">*</span>
                                </label>
                                <input
                                  id="image-caption"
                                  type="text"
                                  value={imageUploadData.caption}
                                  onChange={(e) =>
                                    setImageUploadData((prev) => ({
                                      ...prev,
                                      caption: e.target.value,
                                    }))
                                  }
                                  placeholder="Image caption"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="image-category">
                                  Category <span className="required">*</span>
                                </label>
                                <select
                                  id="image-category"
                                  value={imageUploadData.category}
                                  onChange={(e) =>
                                    setImageUploadData((prev) => ({
                                      ...prev,
                                      category: e.target.value,
                                    }))
                                  }
                                  required
                                >
                                  <option value="">Select category</option>
                                  <option value="Academic">Academic</option>
                                  <option value="Sports">Sports</option>
                                  <option value="Cultural">Cultural</option>
                                  <option value="Infrastructure">
                                    Infrastructure
                                  </option>
                                  <option value="Events">Events</option>
                                </select>
                              </div>
                              <div className="form-buttons">
                                <button
                                  type="submit"
                                  className="submit-btn"
                                  disabled={
                                    !imageUploadData.file ||
                                    !imageUploadData.caption ||
                                    !imageUploadData.category
                                  }
                                >
                                  Upload
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowImageUploadForm(false);
                                    setImageUploadData({
                                      file: null,
                                      caption: "",
                                      category: "",
                                      year: "",
                                    });
                                    const fileInput = document.getElementById(
                                      "gallery-file-input-form",
                                    );
                                    if (fileInput) fileInput.value = "";
                                  }}
                                  className="cancel-btn"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <h3>Campus Gallery</h3>
                              <p className="section-description">
                                Browse existing campus images. Use the sidebar to
                                upload new ones.
                              </p>
                              <p className="category-tip">
                                Categories: Academic, Sports, Cultural,
                                Infrastructure, Events
                              </p>
                              <div className="image-boxes">
                                {siteSettings.campusGallery
                                  .filter(image => image.category !== "Alumni Visits")
                                  .map((image) => (
                                  <div key={image._id} className="box">
                                    <img
                                      src={`${API_URL}${image.imageUrl}`}
                                      alt={image.caption}
                                    />
                                    <p>
                                      {image.caption} ({image.category})
                                    </p>
                                    <button
                                      onClick={() =>
                                        handleImageDelete(image._id)
                                      }
                                      className="delete-btn"
                                      style={{ width: "10px" }}
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                ))}
                                {siteSettings.campusGallery.filter(image => image.category !== "Alumni Visits").length === 0 && (
                                  <p>No campus gallery images yet.</p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {activeContentManagementTab === "alumniVisits" && (
                      <div className="section-card alumni-visits-management-wrapper">
                        <div className="dashboard-sidebar inner-sidebar">
                          <h3>Alumni Visits Actions</h3>
                          <div className="tabs">
                            <button
                              className={`tab ${!showImageUploadForm ? "active" : ""}`}
                              onClick={() => {
                                setShowImageUploadForm(false);
                              }}
                            >
                              <FaUsers /> View Alumni Visits
                            </button>
                            <button
                              className={`tab ${showImageUploadForm ? "active" : ""}`}
                              onClick={() => {
                                setShowImageUploadForm(true);
                                setAlumniVisitUploadData({
                                  file: null,
                                  caption: "",
                                  year: "",
                                });
                                const fileInput = document.getElementById(
                                  "alumni-visit-file-input",
                                );
                                if (fileInput) fileInput.value = "";
                              }}
                            >
                              <FaPlus /> Upload Alumni Visit
                            </button>
                          </div>
                        </div>
                        <div className="dashboard-content inner-content">
                          {showImageUploadForm ? (
                            <form
                              onSubmit={handleAlumniVisitUpload}
                              className="image-upload-form"
                            >
                              <h3>Upload Alumni Visit Image</h3>
                              <div className="form-group">
                                <label htmlFor="alumni-visit-file-input">
                                  Select Image File{" "}
                                  <span className="required">*</span>
                                </label>
                                <input
                                  id="alumni-visit-file-input"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    setAlumniVisitUploadData((prev) => ({
                                      ...prev,
                                      file: file || null,
                                    }));
                                  }}
                                  required
                                />
                                {alumniVisitUploadData.file && (
                                  <p className="file-name">
                                    Selected: {alumniVisitUploadData.file.name}
                                  </p>
                                )}
                                {!alumniVisitUploadData.file && (
                                  <p className="file-name-placeholder">
                                    No file selected
                                  </p>
                                )}
                              </div>
                              <div className="form-group">
                                <label htmlFor="alumni-visit-caption">
                                  Caption <span className="required">*</span>
                                </label>
                                <input
                                  id="alumni-visit-caption"
                                  type="text"
                                  value={alumniVisitUploadData.caption}
                                  onChange={(e) =>
                                    setAlumniVisitUploadData((prev) => ({
                                      ...prev,
                                      caption: e.target.value,
                                    }))
                                  }
                                  placeholder="Describe the alumni visit"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label htmlFor="alumni-visit-year">
                                  Year <span className="required">*</span>
                                </label>
                                <input
                                  id="alumni-visit-year"
                                  type="number"
                                  min="1950"
                                  max={new Date().getFullYear()}
                                  value={alumniVisitUploadData.year}
                                  onChange={(e) =>
                                    setAlumniVisitUploadData((prev) => ({
                                      ...prev,
                                      year: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter year (e.g., 2024)"
                                  required
                                />
                                <small className="form-help">
                                  Enter the year when this alumni visit happened
                                </small>
                              </div>
                              <div className="form-buttons">
                                <button
                                  type="submit"
                                  className="submit-btn"
                                  disabled={
                                    !alumniVisitUploadData.file ||
                                    !alumniVisitUploadData.caption ||
                                    !alumniVisitUploadData.year
                                  }
                                >
                                  Upload
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowImageUploadForm(false);
                                    setAlumniVisitUploadData({
                                      file: null,
                                      caption: "",
                                      year: "",
                                    });
                                    const fileInput = document.getElementById(
                                      "alumni-visit-file-input",
                                    );
                                    if (fileInput) fileInput.value = "";
                                  }}
                                  className="cancel-btn"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <h3>Alumni Visits Gallery</h3>
                              <p className="section-description">
                                Browse existing alumni visit images organized by year.
                              </p>
                              <div className="image-boxes">
                                {siteSettings.campusGallery
                                  .filter(image => image.category === "Alumni Visits")
                                  .sort((a, b) => {
                                    // Sort by year descending
                                    if (a.year && b.year) {
                                      return b.year - a.year;
                                    }
                                    return 0;
                                  })
                                  .map((image) => (
                                  <div key={image._id} className="box">
                                    <img
                                      src={`${API_URL}${image.imageUrl}`}
                                      alt={image.caption}
                                    />
                                    <p>
                                      {image.caption}
                                      {image.year && (
                                        <span className="year-badge"> ({image.year})</span>
                                      )}
                                    </p>
                                    <button
                                      onClick={() =>
                                        handleImageDelete(image._id)
                                      }
                                      className="delete-btn"
                                      style={{ width: "10px" }}
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                ))}
                                {siteSettings.campusGallery.filter(image => image.category === "Alumni Visits").length === 0 && (
                                  <p>No alumni visit images yet.</p>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {activeContentManagementTab === "videos" && (
                      // The video-management-wrapper div needs CSS like display: flex; for side-by-side layout.
                      <div className="section-card video-management-wrapper">
                        <div className="dashboard-sidebar inner-sidebar">
                          <h3>Video Actions</h3>
                          <div className="tabs">
                            <button
                              className={`tab ${!showVideoForm ? "active" : ""}`}
                              onClick={() => setShowVideoForm(false)}
                            >
                              <FaVideo /> View Videos
                            </button>
                            <button
                              className={`tab ${showVideoForm ? "active" : ""}`}
                              onClick={() => {
                                setShowVideoForm(true);
                                setNewVideo({
                                  videoUrl: "",
                                  title: "",
                                  description: "",
                                });
                              }}
                            >
                              <FaPlus /> Add New Video
                            </button>
                          </div>
                        </div>
                        <div className="dashboard-content inner-content">
                          {showVideoForm ? (
                            <form
                              onSubmit={handleVideoAdd}
                              className="video-form"
                            >
                              <h3>Add New Video</h3>
                              <div className="form-group">
                                <label>
                                  Video URL: <span className="required">*</span>
                                </label>
                                <input
                                  type="url"
                                  value={newVideo.videoUrl}
                                  onChange={(e) =>
                                    setNewVideo({
                                      ...newVideo,
                                      videoUrl: e.target.value,
                                    })
                                  }
                                  placeholder="YouTube/Vimeo embed URL"
                                  required
                                />
                                <small className="field-hint">
                                  Must be an embed URL.
                                </small>
                              </div>
                              <div className="form-group">
                                <label>
                                  Title: <span className="required">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={newVideo.title}
                                  onChange={(e) =>
                                    setNewVideo({
                                      ...newVideo,
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Video title"
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Description:</label>
                                <textarea
                                  value={newVideo.description}
                                  onChange={(e) =>
                                    setNewVideo({
                                      ...newVideo,
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Short description (optional)"
                                />
                              </div>
                              <div className="form-buttons">
                                <button type="submit" className="submit-btn">
                                  Add Video
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowVideoForm(false);
                                    setNewVideo({
                                      videoUrl: "",
                                      title: "",
                                      description: "",
                                    });
                                  }}
                                  className="cancel-btn"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <h3>Featured Videos</h3>
                              <p className="section-description">
                                Manage videos for the home page. Use the sidebar
                                to add new ones.
                              </p>
                              <div className="video-instructions">
                                <h4>
                                  <FaLink /> Video Link Instructions
                                </h4>
                                <div className="instructions-content">
                                  <p>
                                    <strong>Supported:</strong> YouTube (
                                    <code>
                                      https://www.youtube.com/embed/VIDEO_ID
                                    </code>
                                    ), Vimeo (
                                    <code>
                                      https://player.vimeo.com/video/VIDEO_ID
                                    </code>
                                    )
                                  </p>
                                  <p className="note">Use embed URLs only.</p>
                                  <div className="detailed-instructions">
                                    <p>
                                      <strong>How to get embed URLs:</strong>
                                    </p>
                                    <p>
                                      <strong>For YouTube:</strong>
                                    </p>
                                    <ol>
                                      <li>Go to the YouTube video</li>
                                      <li>Click "Share" below the video</li>
                                      <li>Click "Embed"</li>
                                      <li>
                                        Copy the URL from the src attribute in
                                        the iframe code (starts with
                                        https://www.youtube.com/embed/)
                                      </li>
                                    </ol>
                                    <p>
                                      <strong>For Vimeo:</strong>
                                    </p>
                                    <ol>
                                      <li>Go to the Vimeo video</li>
                                      <li>Click "Share" button</li>
                                      <li>Click "Embed" tab</li>
                                      <li>
                                        Copy the URL from the src attribute in
                                        the iframe code (starts with
                                        https://player.vimeo.com/video/)
                                      </li>
                                    </ol>
                                  </div>
                                </div>
                              </div>

                              {/* Current Videos Display */}
                              <div className="current-videos-section">
                                <h4>Current Featured Videos ({siteSettings.featuredVideos.length})</h4>
                                {siteSettings.featuredVideos.length > 0 ? (
                                  <div className="video-grid">
                                    {siteSettings.featuredVideos.map((video) => (
                                      <div key={video._id} className="video-card">
                                        <div className="video-wrapper">
                                          <iframe
                                            src={video.videoUrl}
                                            title={video.title}
                                            frameBorder="0"
                                            allowFullScreen
                                          ></iframe>
                                        </div>
                                        <div className="video-info">
                                          <h5>{video.title}</h5>
                                          {video.description && (
                                            <p>{video.description}</p>
                                          )}
                                          <div className="video-actions">
                                            <button
                                              onClick={() => handleVideoDelete(video._id)}
                                              className="delete-btn"
                                              title="Delete Video"
                                            >
                                              <FaTrash />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="empty-videos">
                                    <p>No featured videos yet. Add some using the sidebar.</p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {activeContentManagementTab === "stayConnected" && (
                      <div className="section-card stay-connected-wrapper">
                        <div className="dashboard-sidebar inner-sidebar">
                          <h3>Categories</h3>
                          <div className="tabs">
                            <button
                              className={`tab ${activeStayConnectedTab === "news" ? "active" : ""}`}
                              onClick={() =>
                                handleStayConnectedTabChange("news")
                              }
                            >
                              <FaNewspaper /> News (
                              {
                                siteSettings.stayConnected.filter(
                                  (item) => item.category === "news",
                                ).length
                              }
                              )
                            </button>
                            <button
                              className={`tab ${activeStayConnectedTab === "campaigns" ? "active" : ""}`}
                              onClick={() =>
                                handleStayConnectedTabChange("campaigns")
                              }
                            >
                              <FaBullhorn /> Campaigns (
                              {
                                siteSettings.stayConnected.filter(
                                  (item) => item.category === "campaigns",
                                ).length
                              }
                              )
                            </button>
                            <button
                              className={`tab ${activeStayConnectedTab === "career" ? "active" : ""}`}
                              onClick={() =>
                                handleStayConnectedTabChange("career")
                              }
                            >
                              <FaBriefcase /> Career (
                              {
                                siteSettings.stayConnected.filter(
                                  (item) => item.category === "career",
                                ).length
                              }
                              )
                            </button>
                          </div>
                          <div className="category-content-list">
                            {siteSettings.stayConnected.filter(
                              (item) =>
                                item.category === activeStayConnectedTab,
                            ).length > 0 ? (
                              <div className="item-list">
                                {siteSettings.stayConnected
                                  .filter(
                                    (item) =>
                                      item.category === activeStayConnectedTab,
                                  )
                                  .map((item) => (
                                    <div
                                      className="user-card item-card"
                                      key={item._id}
                                      onClick={() =>
                                        startEditingStayConnectedItem(item)
                                      }
                                    >
                                      <div className="user-card-header">
                                        <div className="user-card-avatar-placeholder">
                                          {item.category === "news" ? (
                                            <FaNewspaper />
                                          ) : item.category === "campaigns" ? (
                                            <FaBullhorn />
                                          ) : (
                                            <FaBriefcase />
                                          )}
                                        </div>
                                        <h3>{item.title}</h3>
                                      </div>
                                      <div className="user-card-details">
                                        <p className="item-description-preview">
                                          {item.description.substring(0, 70)}
                                          {item.description.length > 70
                                            ? "..."
                                            : ""}
                                        </p>
                                        {item.linkUrl && (
                                          <p>
                                            <strong>Link:</strong>{" "}
                                            <a
                                              href={item.linkUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              {item.linkText || "View"}
                                            </a>
                                          </p>
                                        )}
                                      </div>
                                      <div className="item-actions-inline">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            startEditingStayConnectedItem(item);
                                          }}
                                          className="edit-btn icon-btn"
                                          title="Edit"
                                        >
                                          <FaEdit />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteStayConnectedItem(
                                              item._id,
                                            );
                                          }}
                                          className="delete-btn icon-btn"
                                          title="Delete"
                                        >
                                          <FaTrash />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="empty-list">
                                <p>No items in this category.</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="dashboard-content inner-content">
                          <div className="user-details stay-connected-form-container">
                            <h3>
                              {editingStayConnectedItem
                                ? "Edit Item"
                                : `Add New ${activeStayConnectedTab.charAt(0).toUpperCase() + activeStayConnectedTab.slice(1)} Item`}
                            </h3>
                            <form
                              onSubmit={
                                editingStayConnectedItem
                                  ? handleUpdateStayConnectedItem
                                  : handleAddStayConnectedItem
                              }
                              className="info-form"
                            >
                              <div className="form-group">
                                <label htmlFor="item-title">
                                  Title: <span className="required">*</span>
                                </label>
                                <input
                                  id="item-title"
                                  type="text"
                                  value={
                                    editingStayConnectedItem
                                      ? editingStayConnectedItem.title
                                      : newStayConnectedItem.title
                                  }
                                  onChange={(e) =>
                                    editingStayConnectedItem
                                      ? setEditingStayConnectedItem({
                                          ...editingStayConnectedItem,
                                          title: e.target.value,
                                        })
                                      : setNewStayConnectedItem({
                                          ...newStayConnectedItem,
                                          title: e.target.value,
                                        })
                                  }
                                  placeholder="Item title"
                                  required
                                  minLength="3"
                                  maxLength="100"
                                />
                                <div className="char-count">
                                  {editingStayConnectedItem
                                    ? editingStayConnectedItem.title.length
                                    : newStayConnectedItem.title.length}
                                  /100
                                </div>
                              </div>
                              <div className="form-group">
                                <label htmlFor="item-description">
                                  Description:{" "}
                                  <span className="required">*</span>
                                </label>
                                <textarea
                                  id="item-description"
                                  value={
                                    editingStayConnectedItem
                                      ? editingStayConnectedItem.description
                                      : newStayConnectedItem.description
                                  }
                                  onChange={(e) =>
                                    editingStayConnectedItem
                                      ? setEditingStayConnectedItem({
                                          ...editingStayConnectedItem,
                                          description: e.target.value,
                                        })
                                      : setNewStayConnectedItem({
                                          ...newStayConnectedItem,
                                          description: e.target.value,
                                        })
                                  }
                                  placeholder="Item description"
                                  required
                                  minLength="10"
                                  maxLength="500"
                                />
                                <div className="char-count">
                                  {editingStayConnectedItem
                                    ? editingStayConnectedItem.description
                                        .length
                                    : newStayConnectedItem.description.length}
                                  /500
                                </div>
                              </div>
                              <div className="form-group">
                                <label htmlFor="item-link-url">Link URL:</label>
                                <input
                                  id="item-link-url"
                                  type="url"
                                  value={
                                    editingStayConnectedItem
                                      ? editingStayConnectedItem.linkUrl
                                      : newStayConnectedItem.linkUrl
                                  }
                                  onChange={(e) =>
                                    editingStayConnectedItem
                                      ? setEditingStayConnectedItem({
                                          ...editingStayConnectedItem,
                                          linkUrl: e.target.value,
                                        })
                                      : setNewStayConnectedItem({
                                          ...newStayConnectedItem,
                                          linkUrl: e.target.value,
                                        })
                                  }
                                  placeholder="https://example.com (optional)"
                                />
                                <small className="field-hint">
                                  Full URL (optional)
                                </small>
                              </div>
                              <div className="form-group">
                                <label htmlFor="item-link-text">
                                  Link Text:
                                </label>
                                <input
                                  id="item-link-text"
                                  type="text"
                                  value={
                                    editingStayConnectedItem
                                      ? editingStayConnectedItem.linkText
                                      : newStayConnectedItem.linkText
                                  }
                                  onChange={(e) =>
                                    editingStayConnectedItem
                                      ? setEditingStayConnectedItem({
                                          ...editingStayConnectedItem,
                                          linkText: e.target.value,
                                        })
                                      : setNewStayConnectedItem({
                                          ...newStayConnectedItem,
                                          linkText: e.target.value,
                                        })
                                  }
                                  placeholder="Learn More (optional)"
                                  maxLength="50"
                                />
                                <small className="field-hint">
                                  Button text (optional)
                                </small>
                              </div>
                              <div className="action-buttons">
                                <button
                                  type="submit"
                                  className="approve-button"
                                >
                                  {editingStayConnectedItem
                                    ? "Update Item"
                                    : "Add Item"}
                                </button>
                                {editingStayConnectedItem && (
                                  <button
                                    type="button"
                                    onClick={cancelEditingStayConnectedItem}
                                    className="reject-button"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === "newsletter" && (
            <div className="newsletter-management">
              <NewsletterManagement 
                actionMessage={actionMessage}
                setActionMessage={setActionMessage}
              />
            </div>
          )}
        </div>
      </section>

      {showJobRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content job-rejection-modal">
            <div className="modal-header">
              <h3>
                <FaTimesCircle className="modal-icon" /> Reject Job Listing
              </h3>
              <p className="modal-subtitle">
                Provide a reason for rejecting this job (visible to user).
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="jobRejectionComment">Rejection Reason</label>
              <textarea
                id="jobRejectionComment"
                value={jobRejectionComment}
                onChange={(e) => setJobRejectionComment(e.target.value)}
                placeholder="Explain rejection..."
                rows="4"
              ></textarea>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={handleCancelJobReject}>
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={handleConfirmJobReject}
                disabled={!jobRejectionComment.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
