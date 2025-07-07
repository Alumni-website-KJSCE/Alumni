import { useState } from "react";
import "./Newletter.css";

const Newsletter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
  };

  const viewPDF = (month) => {
    setLoading(true);
    setPdfError(false);
    setSelectedMonth(month);
    setShowPdf(true);

    // Check if the PDF file exists
    fetch(`/newsletters/${month.toLowerCase()}.pdf`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("PDF not found");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading PDF:", error);
        setPdfError(true);
        setLoading(false);
      });

    // Scroll to the PDF viewer
    setTimeout(() => {
      document
        .getElementById("pdf-viewer")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const closePDF = () => {
    setShowPdf(false);
    setSelectedMonth(null);
  };

  return (
    <div className="page-container">
      <section className="section">
        <h2 className="section-title">Monthly Newsletters</h2>
        <p>
          Stay updated with our latest news and stories. Click on a month to
          view the newsletter.
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
                onClick={() => viewPDF(month)}
                className={selectedMonth === month ? "active" : ""}
              >
                {month}
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

        {showPdf && selectedMonth && (
          <div id="pdf-viewer" className="pdf-viewer">
            <div className="pdf-header">
              <h3>{selectedMonth} Newsletter</h3>
              <button className="close-btn" onClick={closePDF}>
                ×
              </button>
            </div>

            {loading && (
              <div className="pdf-loading">
                <div className="loading-spinner"></div>
                <p>Loading newsletter...</p>
              </div>
            )}

            {pdfError ? (
              <div className="pdf-error">
                <p>
                  Sorry, the newsletter for {selectedMonth} is not available.
                </p>
                <p>Please check back later or contact the administrator.</p>
              </div>
            ) : (
              <iframe
                src={`/newsletters/${selectedMonth.toLowerCase()}.pdf`}
                title={`${selectedMonth} Newsletter`}
                width="100%"
                height="600px"
                style={{ display: loading ? "none" : "block" }}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setPdfError(true);
                  setLoading(false);
                }}
              ></iframe>
            )}
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Featured Articles</h2>
        <p>
          Discover the latest stories, achievements, and highlights from our
          vibrant alumni community.
        </p>
        <div className="articles-container">
          <div className="article">
            <div className="article-image" >
              <img src="datathon.png" alt="Datathon Event" />
            </div>
            <div className="article-content">
              <h3>Datathon: A 24-Hour Data Science Extravaganza</h3>
              <p>
                Datathon was a 24-hour event that brought together India's
                brightest young minds to innovate and collaborate in data
                science, spanning domains like NLP, generative AI, and MLOps.
                Participants showcased their expertise and learned from seasoned
                professionals, paving the way for future innovations.
              </p>
              <a href="datathon.pdf" target="_blank" className="card-link">
                Read more
              </a>
            </div>
          </div>

          <div className="article">
            <div className="article-image">
              <img src="rhapsody.png" alt="Rhapsody Drama Club" />
            </div>
            <div className="article-content">
              <h3>Rhapsody: KJSCE's Premier Drama Club</h3>
              <p>
                Rhapsody, the versatile Drama Club of KJSCE, excels in street,
                screen, and stage plays, winning accolades like the BITS
                Hyderabad Street Play Competition. They connect deeply with
                their audience through events like Naree and Teacher's Day.
              </p>
              <a href="December.pdf" target="_blank" className="card-link">
                Read more
              </a>
            </div>
          </div>

          <div className="article">
            <div className="article-image">
              <img src="environment.png" alt="World Environment Day" />
            </div>
            <div className="article-content">
              <h3>Exploring Nature's Treasures: World Environment Day</h3>
              <p>
                Students at Somaiya Vidyavihar Campus in Mumbai celebrated World
                Environment Day with a Tree Treasure Hunt, fostering a deepened
                connection with nature and emphasizing the importance of
                biodiversity and conservation.
              </p>
              <a href="environment.pdf" target="_blank" className="card-link">
                Read more
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section subscribe-section">
        <h2 className="section-title" style={{ color: "var(--primary-red)" }}>
          Subscribe to Our Newsletter
        </h2>
        <form id="subscribe-form" onSubmit={handleSubscribe}>
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <button type="submit">Subscribe</button>
        </form>
        {subscribed && (
          <p className="success-message">Thank you for subscribing!</p>
        )}
      </section>
    </div>
  );
};

export default Newsletter;
