import React, { useState } from 'react';
import './Alumni.css';

const Alumni = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    industry: '',
    location: '',
    graduationYear: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your search logic here
    console.log(searchParams);
  };

  return (
    <main className="container">
      <section className="search-section">
        <h1>Alumni Networking</h1>
        <form id="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Search by name..."
            value={searchParams.name}
            onChange={handleChange}
          />
          <select
            name="industry"
            value={searchParams.industry}
            onChange={handleChange}
          >
            <option value="">Select Industry</option>
            <option value="IT">Information Technology</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
          </select>
          <select
            name="location"
            value={searchParams.location}
            onChange={handleChange}
          >
            <option value="">Select Location</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Delhi">Delhi</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Gurgaon">Gurgaon</option>
          </select>
          <select
            name="graduationYear"
            value={searchParams.graduationYear}
            onChange={handleChange}
          >
            <option value="">Select Graduation Year</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
            <option value="2018">2018</option>
            <option value="2017">2017</option>
            <option value="2016">2016</option>
            <option value="2015">2015</option>
            <option value="2014">2014</option>
          </select>
          <button type="submit">Search</button>
        </form>
      </section>

      <section className="results-section">
        <h2>Search Results</h2>
        <div className="results-container">
          {/* Render search results here */}
        </div>
      </section>
    </main>
  );
};

export default Alumni;
