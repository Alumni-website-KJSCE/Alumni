import React, { useState } from 'react';
import './Newletter.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const newsletters = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October',
    'November', 'December'
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribed(true);
  };

  const openPDF = (filename) => {
    window.open(filename, '_blank');
  };

  return (
    <div>
      <main className="container">
      <div className="search-container">
          <input 
            type="text" 
            placeholder="Search newsletters..." 
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <section className="newsletter-section">
          <h1>Monthly Newsletters</h1>
          <p>Stay updated with our latest news and stories. Click on a month to view the newsletter.</p>
          <div className="newsletter-buttons">
            {newsletters.map(month => (
              month.toLowerCase().includes(searchTerm) && (
                <button key={month} onClick={() => openPDF(`${month.toLowerCase()}.pdf`)}>
                  {month}
                </button>
              )
            ))}
          </div>
        </section>

        <section className="featured-articles">
          <h2>Featured Articles</h2>

          <div className="article">
            <div className="article-content">
              <h3>Datathon: A 24-Hour Data Science Extravaganza</h3>
              <p>Datathon was a 24-hour event that brought together India's brightest young minds to innovate and collaborate in data science, spanning domains like NLP, generative AI, and MLOps. Participants showcased their expertise and learned from seasoned professionals, paving the way for future innovations. <a href="datathon.pdf" target="_blank" className="read-more">Read more...</a></p>
            </div>
            <div className="article-image">
              <img src="datathon.png" alt="Datathon Event" />
            </div>
          </div>

          <div className="article">
            <div className="article-content">
              <h3>Rhapsody: KJSCE's Premier Drama Club Inspiring Through Stage and Screen</h3>
              <p>Rhapsody, the versatile Drama Club of KJSCE, excels in street, screen, and stage plays, winning accolades like the BITS Hyderabad Street Play Competition. They connect deeply with their audience through events like Naree and Teacher’s Day, and continue to inspire through workshops and auditions for aspiring performers. <a href="December.pdf" target="_blank" className="read-more">Read more...</a></p>
            </div>
            <div className="article-image">
              <img src="rhapsody.png" alt="Rhapsody Drama Club" />
            </div>
          </div>

          <div className="article">
            <div className="article-content">
              <h3>Exploring Nature's Treasures: World Environment Day at Somaiya Vidyavihar Campus</h3>
              <p>Students at Somaiya Vidyavihar Campus in Mumbai celebrated World Environment Day with a Tree Treasure Hunt, fostering a deepened connection with nature and emphasizing the importance of biodiversity and conservation. <a href="environment.pdf" target="_blank" className="read-more">Read more...</a></p>
            </div>
            <div className="article-image">
              <img src="environment.png" alt="World Environment Day" />
            </div>
          </div>
        </section>
        
        <section className="subscribe-section">
          <h2>Subscribe to Our Newsletter</h2>
          <form id="subscribe-form" onSubmit={handleSubscribe}>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <button type="submit">Subscribe</button>
          </form>
          {subscribed && <p>Thank you for subscribing!</p>}
        </section>
      </main>
    </div>
  );
}

export default App;
