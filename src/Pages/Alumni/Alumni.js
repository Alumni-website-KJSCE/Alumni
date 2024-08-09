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
  );
};

const AlumniSection = () => {
  const alumni = [
    { name: 'Arvind Sharma', title: 'Sr. HR Director, Black & Veatch', imgSrc: 'arvind sharma.jpg' },
    { name: 'Rohan Joshi', title: 'Actor, YouTuber', imgSrc: 'rohan joshi.jpg' },
    { name: 'Vikram Malhotra', title: 'CEO of Abundantia Entertainment', imgSrc: 'vikram malhotra.jpg' },
    { name: 'Ajay Kapur', title: 'Former Managing Director of Ambuja Cement', imgSrc: 'Ajay Kapur.png' },
  ];

  return (
    <div className="alumni-section">
      <h2>Notable Alumni</h2>
      <div className="image-boxes">
        {alumni.map((alum, index) => (
          <div className="box" key={index}>
            <img src={alum.imgSrc} alt={`Alumni ${index + 1}`} />
            <p>
              <b>{alum.name}<br />{alum.title}</b>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  return (
    <div className="faq-item">
      <button className="faq-question">{question}</button>
      <div className="faq-answer">{answer}</div>
    </div>
  );
};

const FAQSection = () => {
  const faqs = [
    { question: 'What can I expect at Reunion?', answer: 'You can expect various activities including keynote speeches, networking events, and more.' },
    { question: 'How can I Register?', answer: 'You can register on our official website under the registration section.' },
    { question: 'I am undecided on my travel plans for the reunion, should I still Register?', answer: 'Yes, it is recommended to register to secure your spot. Travel plans can be finalized later.' },
    { question: 'I want special arrangements for the Reunion, How can I request for the same?', answer: 'You can request special arrangements by contacting the event organizers directly through our contact page.' },
  ];

  return (
    <div className="faq-section">
      <h2>FAQ & Reunions</h2>
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

const LoginSection = () => {
  return (
    <div className="login-section">
      <h2>Join/Login KJSCE Network</h2>
      <div className="login-box">
        <a href="https://www.facebook.com" className="login-button">Connect By Facebook</a>
        <a href="https://www.linkedin.com" className="login-button">Connect By LinkedIn</a>
        <a href="https://www.google.com" className="login-button">Connect By Google</a>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <main className="container">
      <Alumni />
      <AlumniSection />
      <FAQSection />
      <LoginSection />
    </main>
  );
};

export default App;
