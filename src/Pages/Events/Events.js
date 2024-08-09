import React, { useState, useEffect } from 'react';
import './Events.css';

const AlumniMeet = () => {
  const [responseMessage, setResponseMessage] = useState('');
  const [countdown, setCountdown] = useState('');

  const handleRegister = (event) => {
    event.preventDefault();
    setResponseMessage('Thank you for registering!');
  };

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      const eventDate = new Date('July 20, 2024 10:00:00').getTime();
      const now = new Date().getTime();
      const distance = eventDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        setCountdown('The event has started!');
      } else {
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  return (
    <div>
      <main className="container">
        <section className="event-details">
          <h2>Alumni Meet 2024</h2>
          <p>Date: July 20, 2024</p>
          <p>Time: 10:00 AM - 5:00 PM</p>
          <p>Venue: KJSCE Auditorium</p>
        </section>

        <section className="registration-form">
          <h2>Register for the Event</h2>
          <form id="registrationForm" onSubmit={handleRegister}>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" required />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="batch">Batch:</label>
            <select id="batch" name="batch" required>
              <option value="">Select your batch</option>
              <option value="2005-2009">2005-2009</option>
              <option value="2006-2010">2006-2010</option>
              <option value="2007-2011">2007-2011</option>
              <option value="2008-2012">2008-2012</option>
              <option value="2009-2013">2009-2013</option>
              <option value="2010-2014">2010-2014</option>
              <option value="2011-2015">2011-2015</option>
              <option value="2012-2016">2012-2016</option>
              <option value="2013-2017">2013-2017</option>
              <option value="2014-2018">2014-2018</option>
              <option value="2015-2019">2015-2019</option>
              <option value="2016-2020">2016-2020</option>
              <option value="2017-2021">2017-2021</option>
              <option value="2018-2022">2018-2022</option>
              <option value="2019-2023">2019-2023</option>
              <option value="2020-2024">2020-2024</option>
            </select>

            <button type="submit">Register</button>
          </form>
          <p id="responseMessage">{responseMessage}</p>
        </section>

        <section className="event-schedule">
          <h2>Event Schedule</h2>
          <ul>
            <li>10:00 AM - Welcome Speech</li>
            <li>11:00 AM - Keynote Address</li>
            <li>12:00 PM - Networking Session</li>
            <li>1:00 PM - Lunch</li>
            <li>2:00 PM - Panel Discussion</li>
            <li>3:00 PM - Alumni Awards</li>
            <li>4:00 PM - Closing Remarks</li>
          </ul>
        </section>

        <section className="gallery-section">
          <h2>Events</h2>
          <div className="video-boxes">
            <div className="box">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/uEXd6MxppbY?si=SbLWXdV_n_AJ1MLP"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
            <div className="box">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/maPvMNHPG2Q?si=01gkHiNXPWPIVDJV"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        <section className="map-section">
          <h2>Event Location</h2>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.792650630278!2d72.89735127583775!3d19.072852052070022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c627a20bcaa9%3A0xb2fd3bcfeac0052a!2sK.%20J.%20Somaiya%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1720426028384!5m2!1sen!2sin"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </section>

        <section className="countdown-timer">
          <h2>Countdown to Event</h2>
          <div id="countdown">{countdown}</div>
        </section>
      </main>
    </div>
  );
};

export default AlumniMeet;
