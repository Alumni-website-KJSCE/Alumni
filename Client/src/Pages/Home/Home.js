import React, { useState } from 'react';
import Campus from '../../Assets/campus.jpg';
import './Home.css';

const GallerySection = ({ title, images }) => (
  <section className="gallery-section">
    <h2>{title}</h2>
    <div className="image-boxes">
      {images.map((image, index) => (
        <div className="box" key={index}>
          <img src={image.src} alt={image.alt} />
        </div>
      ))}
    </div>
  </section>
);

const VideoSection = ({ title, videos }) => (
  <section className="video-section">
    <h2>{title}</h2>
    <div className="video-boxes">
      {videos.map((video, index) => (
        <div className="box" key={index}>
          <iframe
            width="560"
            height="315"
            src={video.src}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      ))}
    </div>
  </section>
);

const Home = () => {
  const [activeTab, setActiveTab] = useState('news');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const architectureImages = [
    { src: '/kjsce library.jpeg', alt: 'Architecture 1' },
    { src: '/kjsce canteen.jpg', alt: 'Architecture 2' },
    { src: '/kjsce lab.jpg', alt: 'Architecture 3' },
    { src: '/kjsce front.jpg', alt: 'Architecture 4' },
  ];

  const sportsImages = [
    { src: '/kjsce athletic track.jpg', alt: 'Sports 1' },
    { src: '/kjsce basketball.jpg', alt: 'Sports 2' },
    { src: '/kjsce cricket ground.jpg', alt: 'Sports 3' },
    { src: '/kjsce swimming pool.jpg', alt: 'Sports 4' },
  ];

  const eventsImages = [
    { src: '/kjsce ashneer.jpeg', alt: 'Events 1' },
    { src: '/kjsce kk.jpg', alt: 'Events 2' },
    { src: '/kjsce shaan.jpg', alt: 'Events 3' },
    { src: '/kjsce sukhwinder.jpg', alt: 'Events 4' },
  ];

  const videos = [
    { src: 'https://www.youtube.com/embed/4ZMgEG6rPiY?si=niNyprQSdC45NMlK', title: 'YouTube video player 1' },
    { src: 'https://www.youtube.com/embed/maPvMNHPG2Q?si=01gkHiNXPWPIVDJV', title: 'YouTube video player 2' },
  ];

  return (
    <>
      <div className="home-container">
        <div className="image-container">
          <img src={Campus} alt="KJSCE Campus" className="Img" />
          <div className="overlay">
            <h1>Welcome to the alumni network</h1>
            <a href="#" className="register-button">Register Now</a>
          </div>
        </div>
      </div>
      <div className="about">
        <div className="content-section">
          <div className="tabs">
            <div className={`tab ${activeTab === 'news' ? 'active' : ''}`} onClick={() => handleTabClick('news')}>
              News & Updates
            </div>
            <div className={`tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => handleTabClick('events')}>
              Upcoming Events
            </div>
            <div className={`tab ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => handleTabClick('campaigns')}>
              Campaigns
            </div>
            <div className={`tab ${activeTab === 'career' ? 'active' : ''}`} onClick={() => handleTabClick('career')}>
              Career Centre
            </div>
          </div>
          <div className="tab-content">
            {activeTab === 'news' && (
              <div className="section">
                <div className="card">
                  <h3>Alumni Meet 2023</h3>
                  <p>Join us for the annual alumni meet and reconnect with your batchmates!</p>
                </div>
                <div className="card">
                  <h3>New Campus Wing</h3>
                  <p>Exciting news! A new wing dedicated to advanced research is opening soon.</p>
                </div>
              </div>
            )}
            {activeTab === 'events' && (
              <div className="section">
                <div className="card">
                  <h3>Webinar on AI</h3>
                  <p>Learn about the latest trends in AI from industry experts.</p>
                </div>
                <div className="card">
                  <h3>Networking Night</h3>
                  <p>A perfect opportunity to network with professionals and expand your connections.</p>
                </div>
              </div>
            )}
            {activeTab === 'campaigns' && (
              <div className="section">
                <div className="card">
                  <h3>Scholarship Fund</h3>
                  <p>Contribute to our scholarship fund to help support deserving students.</p>
                </div>
                <div className="card">
                  <h3>Green Campus Initiative</h3>
                  <p>Join us in our efforts to make our campus more sustainable and green.</p>
                </div>
              </div>
            )}
            {activeTab === 'career' && (
              <div className="section">
                <div className="card">
                  <h3>Resume Workshop</h3>
                  <p>Sign up for our resume workshop and get your resume reviewed by experts.</p>
                </div>
                <div className="card">
                  <h3>Job Openings</h3>
                  <p>Check out the latest job openings and opportunities shared by our alumni.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="Alumnis">
        <h1>Notable Alumnis</h1>
      </div>
      <main className="container">
        <GallerySection title="Architecture" images={architectureImages} />
        <GallerySection title="Sports" images={sportsImages} />
        <GallerySection title="Events" images={eventsImages} />
        <VideoSection title="Videos" videos={videos} />
      </main>
    </>
  );
};

export default Home;
