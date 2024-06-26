import React, { useState } from 'react';
import Campus from '../../Assets/campus.jpg';
import './Home.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState('news');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="home-container">
        <div className="image-container">
          <img src={Campus} alt="KJSCE Campus" className="Img"/>
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
      <div className="Gallery">
        <h1>Gallery</h1>
      </div>
    </>
  );
}
