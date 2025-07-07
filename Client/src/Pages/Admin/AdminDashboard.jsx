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
  FaGlobe,
  FaBullhorn,
  FaImage,
  FaVideo,
} from "react-icons/fa";

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
  const [actionMessage, setActionMessage] = useState(null); // Can be string or {type, text}
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
  const [showVideoForm, setShowVideoForm] = useState(false); // New state for video form
  const [imageUploadData, setImageUploadData] = useState({
    file: null,
    caption: "",
    category: "",
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
    const formData = new FormData();
    formData.append("image", imageUploadData.file);
    formData.append("caption", imageUploadData.caption);
    formData.append("category", imageUploadData.category);
    try {
      await axiosInstance.post("/api/settings/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchSiteSettings();
      setActionMessage({
        type: "success",
        text: "Image uploaded successfully",
      });
      setImageUploadData({ file: null, caption: "", category: "" });
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

  // const handleFileSelect = (e) => { // This function is no longer used by the gallery form.
  //   const file = e.target.files[0];
  //   if (file) {
  //     setImageUploadData(prev => ({ ...prev, file }));
  //   }
  // };

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
    setImageUploadData({ file: null, caption: "", category: "" });
    const galleryFileInput = document.getElementById("gallery-file-input-form");
    if (galleryFileInput) galleryFileInput.value = "";

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
                  src={`http://localhost:3001${user.profilePicture}`}
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
                <div className="user-search">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="search-input"
                  />
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
                              href={`http://localhost:3001${selectedUser.attendanceProof}`}
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
                              src={`http://localhost:3001${selectedUser.profilePicture}`}
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
                <div className="tabs vertical-tabs">
                  <button
                    className={`tab ${activeContentManagementTab === "gallery" ? "active" : ""}`}
                    onClick={() => handleContentManagementTabChange("gallery")}
                  >
                    <FaImage /> Campus Gallery And Alumni Visit
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
                                  <option value="Alumni Visits">
                                    Alumni Visits
                                  </option>
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
                              <h3>Campus Gallery & Alumni Visits</h3>
                              <p className="section-description">
                                Browse existing images. Use the sidebar to
                                upload new ones.
                              </p>
                              <p className="category-tip">
                                Categories: Academic, Sports, Cultural,
                                Infrastructure, Events, Alumni Visits
                              </p>
                              <div className="image-boxes">
                                {siteSettings.campusGallery.map((image) => (
                                  <div key={image._id} className="box">
                                    <img
                                      src={`http://localhost:3001${image.imageUrl}`}
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
                                {siteSettings.campusGallery.length === 0 && (
                                  <p>No images in the gallery yet.</p>
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
                          <div className="tabs vertical-tabs">
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
              <label htmlFor="jobRejectionComment">Rejection Reason:</label>
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
