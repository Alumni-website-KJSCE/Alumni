import { useState, useEffect } from "react";
import "./Newletter.css";
import axiosInstance from "../../utils/axiosConfig";

const API_URL = import.meta.env.VITE_API_URL

const Newsletter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [availableNewsletters, setAvailableNewsletters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingMonth, setDownloadingMonth] = useState(null);
  const [articles, setArticles] = useState([]);

  const newsletters = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Fetch available newsletters on component mount
  useEffect(() => {
    fetchAvailableNewsletters();
    fetchArticles();
  }, []);

  const fetchAvailableNewsletters = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/newsletters');
      const newsletterMonths = response.data.newsletters.map(nl => nl.month);
      setAvailableNewsletters(newsletterMonths);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await axiosInstance.get('/api/newsletters/articles');
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
  };

  const downloadPDF = async (month) => {
    if (!availableNewsletters.includes(month)) {
      alert(`Newsletter for ${month} is not available yet.`);
      return;
    }

    setDownloadingMonth(month);
    try {
      const response = await axiosInstance.get(`/api/newsletters/download/${month.toLowerCase()}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${month}_Newsletter.pdf`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading newsletter:', error);
      alert(`Failed to download ${month} newsletter. Please try again.`);
    } finally {
      setDownloadingMonth(null);
    }
  };

  return (
    <div className="page-container">
      <section className="section">
        <h2 className="section-title">Monthly Newsletters</h2>
        <p>
          Stay updated with our latest news and stories. Click on a month to
          download the newsletter.
        </p>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search newsletters..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="newsletter-buttons">
          {newsletters
            .filter((month) => month.toLowerCase().includes(searchTerm))
            .map((month) => (
              <button
                key={month}
                onClick={() => downloadPDF(month)}
                className={`${availableNewsletters.includes(month) ? 'available' : 'unavailable'} ${downloadingMonth === month ? 'downloading' : ''}`}
                disabled={downloadingMonth === month}
              >
                {downloadingMonth === month ? 'Downloading...' : month}
                {!availableNewsletters.includes(month) && ' (Coming Soon)'}
              </button>
            ))}
          {newsletters.filter((month) =>
            month.toLowerCase().includes(searchTerm),
          ).length === 0 && (
            <p className="no-results">
              No newsletters found matching your search.
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Featured Articles</h2>
        <p>
          Discover the latest stories, achievements, and highlights from our
          vibrant alumni community.
        </p>
        <div className="articles-container">
          {articles.map((article) => (
            <div key={article._id} className="article">
              <div className="article-image">
                <img 
                  src={article.imageUrl ? `${API_URL}${article.imageUrl}` : "/default-article.jpg"} 
                  alt={article.title} 
                />
              </div>
              <div className="article-content">
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                {article.linkUrl && (
                  <a 
                    href={article.linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="card-link"
                  >
                    {article.linkText || 'Read more'}
                  </a>
                )}
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <p className="no-articles">No articles available at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Newsletter;
