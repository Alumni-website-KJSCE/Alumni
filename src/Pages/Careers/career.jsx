import React, { useState } from 'react';
import './career.css';
import { FaMapLocation } from "react-icons/fa6";

const alumniData = {
    jobs: [
      { role: 'Backend Developer', category: 'Software', pay: 'INR 7,00,000-32,00,000 annually', experience: '2 yrs', location: 'Pune, India', applyBy: 'June 30' },
      { role: 'Software Development Engineer', category: 'Software', pay: 'INR 9,00,000-38,00,000 annually', experience: 'Not specified', location: 'Bangalore, India', applyBy: 'June 30' },
      { role: 'Business Analyst', category: 'Analytics', pay: 'INR 10,00,000-48,00,000 annually', experience: '3 yrs', location: 'Bangalore, India', applyBy: 'June 25' },
      { role: 'Full Stack Web Developer Intern', category: 'Software', pay: 'Not specified', experience: '1/2 yrs', location: 'Gurgaon, India', applyBy: 'July 30' },
    ],
    cities: [
      { city: 'Bangalore', alumniCount: 7687 },
      { city: 'Hyderabad', alumniCount: 4877 },
      { city: 'Mumbai', alumniCount: 3100 },
    ],
  };
  
  const Career = () => {
    return (
      <div className="career-container">
        <header className="career-header">
          <h1>Jobs and Internships</h1>
          <button className="view-all-jobs">View All Jobs</button>
        </header>
        <div className="job-cards">
          {alumniData.jobs.map((job, index) => (
            <div key={index} className="job-card">
              <h2>{job.role}</h2>
              <p>{job.category}</p>
              <p>Pay - {job.pay}</p>
              <p>Experience - {job.experience}</p>
              <p>Location - {job.location}</p>
              <p>Apply by - {job.applyBy}</p>
              <button className="apply-button">Apply Now</button>
            </div>
          ))}
        </div>
        <h2 className="cities-heading">Top Cities Where Our Alumni Work</h2>
        <div className="city-list">
          {alumniData.cities.map((city, index) => (
            <div key={index} className="city-item">
              <span className="city-icon"><FaMapLocation /></span> 
              <span className="city-name">{city.city}</span>
                <span className="alumni-count">{city.alumniCount}+ alumni</span>
            </div>
          ))}
        </div>
        <button className="view-map-button">View in Map</button>
      </div>
    );
  };
  
  export default Career;