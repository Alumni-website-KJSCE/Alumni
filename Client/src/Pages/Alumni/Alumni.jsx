import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./Alumni.css";

const API_URL = import.meta.env.VITE_API_URL

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        {question} {isOpen ? "−" : "+"}
      </button>
      {isOpen && <div className="faq-answer">{answer}</div>}
    </div>
  );
};

// Function to format names properly
const formatName = (name) => {
  if (!name) return "";

  // Handle names with extra spaces
  const trimmedName = name.trim().replace(/\s+/g, " ");

  // Capitalize first letter of each word
  return trimmedName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const AlumniPage = () => {
  const [searchParams, setSearchParams] = useState({
    name: "",
    "Year of Passing": "",
    branch: "",
    company: "",
    designation: "",
    generalSearch: "",
  });
  const [alumniList, setAlumniList] = useState([]);
  const [years, setYears] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(10);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const toggleCardExpansion = (index) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(index)) {
      newExpandedCards.delete(index);
    } else {
      newExpandedCards.add(index);
    }
    setExpandedCards(newExpandedCards);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For year fields, always store as string to match backend format
    const finalValue =
      name === "Year of Passing" && value !== "" ? value.toString() : value;

    setSearchParams((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  // Fetch unique years from alumni data
  const fetchYears = async () => {
    try {
      const response = await axiosInstance.get("/api/alumni");

      console.log("Years fetch response:", response.data);

      // Handle new response format with alumni array and total
      if (
        response.data &&
        response.data.alumni &&
        Array.isArray(response.data.alumni)
      ) {
        const uniqueYears = [
          ...new Set(
            response.data.alumni
              .map((alum) => {
                const year = alum["Year of Passing"];
                return typeof year === "string" ? parseInt(year, 10) : year;
              })
              .filter((year) => !isNaN(year)),
          ),
        ].sort((a, b) => b - a); // Sort in descending order
        setYears(uniqueYears);
        console.log("Extracted years:", uniqueYears);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for old response format
        const uniqueYears = [
          ...new Set(
            response.data
              .map((alum) => {
                const year = alum["Year of Passing"];
                return typeof year === "string" ? parseInt(year, 10) : year;
              })
              .filter((year) => !isNaN(year)),
          ),
        ].sort((a, b) => b - a); // Sort in descending order
        setYears(uniqueYears);
        console.log("Extracted years (fallback):", uniqueYears);
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Unable to fetch years data.");
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      setError("Failed to fetch available years. Please try again later.");
    }
  };

  // Fetch unique branches from alumni data
  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get("/api/alumni");

      console.log("Branches fetch response:", response.data);

      // Handle new response format with alumni array and total
      if (
        response.data &&
        response.data.alumni &&
        Array.isArray(response.data.alumni)
      ) {
        const uniqueBranches = [
          ...new Set(
            response.data.alumni
              .map((alum) => alum.Branch)
              .filter(
                (branch) => branch && branch.trim() !== "" && branch !== "N/A",
              ),
          ),
        ].sort(); // Sort alphabetically
        setBranches(uniqueBranches);
        console.log("Extracted branches:", uniqueBranches);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for old response format
        const uniqueBranches = [
          ...new Set(
            response.data
              .map((alum) => alum.Branch)
              .filter(
                (branch) => branch && branch.trim() !== "" && branch !== "N/A",
              ),
          ),
        ].sort(); // Sort alphabetically
        setBranches(uniqueBranches);
        console.log("Extracted branches (fallback):", uniqueBranches);
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Unable to fetch branches data.");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError("Failed to fetch available branches. Please try again later.");
    }
  };

  const fetchAlumni = async (params = {}) => {
    try {
      setLoading(true);
      setError("");
      setItemsToShow(10); // Reset pagination when fetching new data

      // Map client parameters to server parameters
      const mappedParams = {};

      // Map 'name' to 'name' for name-only search (backend searches only in Name field)
      if (params.name && params.name.trim() !== "") {
        mappedParams.name = params.name.trim();
        console.log("Searching for name:", params.name.trim());
      }

      // Map 'generalSearch' to 'search' for the server (general text search)
      if (params.generalSearch && params.generalSearch.trim() !== "") {
        mappedParams.search = params.generalSearch.trim();
        console.log("General search for text:", params.generalSearch.trim());
      }

      // Map other parameters directly
      if (params["Year of Passing"] && params["Year of Passing"] !== "") {
        mappedParams.year = params["Year of Passing"];
        console.log("Filtering by year:", params["Year of Passing"]);
      }

      if (params.branch && params.branch.trim() !== "") {
        mappedParams.branch = params.branch.trim();
        console.log("Filtering by branch:", params.branch.trim());
      }

      if (params.company && params.company.trim() !== "") {
        mappedParams.company = params.company.trim();
        console.log("Filtering by company:", params.company.trim());
      }

      if (params.designation && params.designation.trim() !== "") {
        mappedParams.designation = params.designation.trim();
        console.log("Filtering by designation:", params.designation.trim());
      }

      console.log("Sending search params:", mappedParams);
      const response = await axiosInstance.get("/api/alumni", {
        params: mappedParams,
        timeout: 5000, // 5-second timeout
      });

      console.log("Alumni fetch response:", response.data);

      // Handle new response format (all data, no pagination)
      if (response.data && response.data.alumni) {
        setAlumniList(response.data.alumni);
        console.log(
          `Successfully loaded ${response.data.alumni.length} alumni`,
        );
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for old format
        setAlumniList(response.data);
        console.log(
          `Successfully loaded ${response.data.length} alumni (fallback format)`,
        );
      } else {
        setAlumniList([]);
        setError("No alumni data found matching your criteria.");
        console.log("No alumni data found in response");
      }
    } catch (error) {
      console.error("Error fetching alumni:", error);
      if (error.code === "ECONNABORTED") {
        setError(
          "Request timed out. Please check your internet connection and try again.",
        );
      } else if (!error.response) {
        setError(
          "Unable to connect to the server. Please ensure the backend service is running.",
        );
      } else {
        setError(
          error.response.data?.message ||
            "An error occurred while fetching alumni data. Please try again later.",
        );
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear any previous errors
    setError("");

    // Fetch alumni with current search parameters (including empty ones to get all alumni)
    fetchAlumni(searchParams);
  };

  useEffect(() => {
    const initialFetch = async () => {
      try {
        await fetchYears(); // First fetch the available years
        await fetchBranches(); // Fetch the available branches
        await fetchAlumni({}); // Fetch all alumni initially (empty search = all alumni)
      } catch (error) {
        console.error("Initial fetch error:", error);
      }
    };
    initialFetch();
  }, []);

  // Notable Alumni Data
  // structure: { name, title, imgSrc }
  const notableAlumni = [];

  // FAQ Data
  const faqs = [
    {
      question: "What can I expect at Reunion?",
      answer:
        "You can expect various activities including keynote speeches, networking events, and more.",
    },
    {
      question: "How can I Register?",
      answer:
        "You can register on our official website under the registration section.",
    },
    {
      question:
        "I am undecided on my travel plans for the reunion, should I still Register?",
      answer:
        "Yes, it is recommended to register to secure your spot. Travel plans can be finalized later.",
    },
    {
      question:
        "I want special arrangements for the Reunion, How can I request for the same?",
      answer:
        "You can request special arrangements by contacting the event organizers directly through our contact page.",
    },
  ];

  return (
    <div className="page-container">
      <section className="section">
        <h2 className="section-title">Find Alumni</h2>
        {error && <div className="error-message">{error}</div>}
        <form id="alumni-search-form" onSubmit={handleSubmit}>
          <div className="search-grid">
            <div className="search-field">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Search by name..."
                value={searchParams.name}
                onChange={handleChange}
              />
            </div>

            <div className="search-field">
              <label htmlFor="year">Graduation Year</label>
              <select
                id="year"
                name="Year of Passing"
                value={searchParams["Year of Passing"]}
                onChange={handleChange}
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-field">
              <label htmlFor="branch">Branch</label>
              <select
                id="branch"
                name="branch"
                value={searchParams.branch}
                onChange={handleChange}
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="advanced-filters-toggle">
            <button
              type="button"
              className="toggle-advanced-button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? "Hide Advanced Filters" : "Show Advanced Filters"}
              <i className={`fas ${showAdvancedFilters ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
            </button>
          </div>

          {/* Advanced Filters Section */}
          {showAdvancedFilters && (
            <div className="advanced-filters">
              <h4 className="advanced-filters-title">Advanced Search Options</h4>
              <div className="search-grid">
                <div className="search-field">
                  <label htmlFor="generalSearch">General Search</label>
                  <input
                    type="text"
                    id="generalSearch"
                    name="generalSearch"
                    placeholder="Search in all fields..."
                    value={searchParams.generalSearch}
                    onChange={handleChange}
                  />
                </div>

                <div className="search-field">
                  <label htmlFor="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Search by company..."
                    value={searchParams.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="search-field">
                  <label htmlFor="designation">Designation</label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    placeholder="Search by designation..."
                    value={searchParams.designation}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="button-group">
            <button type="submit" className="search-button">
              Search Alumni
            </button>
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setSearchParams({
                  name: "",
                  "Year of Passing": "",
                  branch: "",
                  company: "",
                  designation: "",
                  generalSearch: "",
                });
                setError("");
                fetchAlumni({ 
                  name: "", 
                  "Year of Passing": "", 
                  branch: "",
                  company: "",
                  designation: "",
                  generalSearch: "",
                });
              }}
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="search-results">
          <h3 className="results-title">
            {alumniList.length > 0
              ? `Showing ${Math.min(itemsToShow, alumniList.length)} of ${alumniList.length} alumni`
              : initialLoad
                ? "Alumni Directory"
                : "No results found"}
          </h3>
          {alumniList.length > 0 ? (
            <>
              <div className="card-grid">
                {alumniList.slice(0, itemsToShow).map((alum, index) => {
                  const isExpanded = expandedCards.has(index);
                  return (
                    <div
                      className={`card ${isExpanded ? "expanded" : ""}`}
                      key={index}
                      onClick={() => toggleCardExpansion(index)}
                    >
                      <div className="card-content">
                        <div className="profile-image-container">
                          {alum.profileImage ? (
                            <img
                              src={`${API_URL}${alum.profileImage}`}
                              alt={alum.Name}
                            />
                          ) : (
                            <div className="default-profile-icon">
                              <i className="fas fa-user"/>
                            </div>
                          )}
                        </div>
                        <h3 className="card-title">{formatName(alum.Name)}</h3>
                        <p className="card-text">
                          <strong>Branch:</strong> {alum.Branch || "N/A"}
                        </p>
                        <p className="card-text">
                          <strong>Year:</strong>{" "}
                          {alum["Year of Passing"]
                            ? parseInt(alum["Year of Passing"], 10)
                            : "N/A"}
                        </p>
                        <p className="card-text">
                          <strong>Position:</strong>{" "}
                          {alum.Designation && alum.Designation !== "NA"
                            ? alum.Designation
                            : "N/A"}
                        </p>
                        <p className="card-text">
                          <strong>Company:</strong> {alum.Company || "N/A"}
                        </p>

                        {/* Show council membership indicator on basic card */}
                        {(alum.councilMember ||
                          (alum.councils && alum.councils.length > 0)) && (
                          <div className="council-indicator">
                            <span className="council-badge-small">
                              <i className="fas fa-star"></i> Member in{" "}
                              {alum.councils.length} Council
                            </span>
                          </div>
                        )}

                        {/* Expandable content */}
                        {isExpanded && (
                          <div className="expanded-content">
                            <div className="expanded-details">
                              {alum.Location && (
                                <p className="card-text">
                                  <strong>Location:</strong> {alum.Location}
                                </p>
                              )}

                              {/* Enhanced Council Information */}
                              {(alum.councilMember ||
                                (alum.councils &&
                                  alum.councils.length > 0)) && (
                                <div className="council-info">
                                  <p className="card-text">
                                    <strong>Council Memberships:</strong>
                                  </p>
                                  {alum.councils && alum.councils.length > 0 ? (
                                    alum.councils.map(
                                      (council, councilIndex) => (
                                        <div
                                          key={councilIndex}
                                          className="council-item"
                                          style={{ justifyContent: "center" }}
                                        >
                                          <span
                                            className="council-badge"
                                            style={{ justifyContent: "center" }}
                                          >
                                            <i className="fas fa-users"></i>
                                            <span className="council-name">
                                              {council.councilName || "Council"}
                                            </span>
                                            <span className="council-separator">
                                              -
                                            </span>
                                            <span className="council-position">
                                              {council.councilPosition ||
                                                "Member"}
                                            </span>
                                          </span>
                                        </div>
                                      ),
                                    )
                                  ) : (
                                    <div className="council-item">
                                      <span className="council-badge">
                                        <i className="fas fa-users"></i>
                                        <span className="council-position">
                                          Council Member
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {alum.email && (
                                <p className="card-text">
                                  <strong>Email:</strong> {alum.email}
                                </p>
                              )}
                              {alum.phone && (
                                <p className="card-text">
                                  <strong>Phone:</strong> {alum.phone}
                                </p>
                              )}
                              {alum.highestQualification && (
                                <p className="card-text">
                                  <strong>Qualification:</strong>{" "}
                                  {alum.highestQualification}
                                </p>
                              )}
                              {alum.linkedin && (
                                <p className="card-text">
                                  <strong>LinkedIn:</strong>
                                  <a
                                    href={alum.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-link"
                                  >
                                    View Profile
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div
                          className="card-actions"
                          style={{ justifyContent: "center" }}
                        >
                          {(() => {
                            const link = alum["LinkedIn Profile Link"];
                            return link && link !== "N/A" ? (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Connect on LinkedIn
                              </a>
                            ) : (
                              <span
                                className="card-link disabled"
                                title="LinkedIn profile not available"
                              >
                                Profile Not Linked
                              </span>
                            );
                          })()}

                          <div className="expand-indicator">
                            <i
                              className={`fas ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}`}
                            ></i>
                            <span>
                              {isExpanded
                                ? "Click to show less"
                                : "Click to show more"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Load more button for pagination */}
              {itemsToShow < alumniList.length && (
                <div className="pagination-controls">
                  <button
                    className="load-more-button"
                    onClick={() => setItemsToShow((prev) => prev + 10)}
                  >
                    Load More ({Math.min(10, alumniList.length - itemsToShow)}{" "}
                    more)
                  </button>
                  {itemsToShow > 10 && (
                    <button
                      className="load-more-button"
                      onClick={() => setItemsToShow((prev) => prev - 10)}
                    >
                      Load 10 Less
                    </button>
                  )}
                </div>
              )}

            </>
          ) : (
            <p className="no-results">
              No alumni found matching your criteria.
            </p>
          )}
        </div>
      </section>

      {/* Notable Alumni Section */}
      <section className="section">
        <h2 className="section-title">Notable Alumni</h2>
        <div className="card-grid">
          {notableAlumni.map((alum, index) => (
            <div className="card" key={index}>
              <img src={alum.imgSrc} alt={alum.name} className="card-image" />
              <div className="card-content">
                <h3 className="card-title">{alum.name}</h3>
                <p className="card-text">{alum.title}</p>
                <a href="#" className="card-link">
                  View Profile
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section">
        <h2 className="section-title">FAQ & Reunions</h2>
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AlumniPage;
