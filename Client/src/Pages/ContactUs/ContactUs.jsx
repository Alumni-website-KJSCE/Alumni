import React from "react";
import { Mail, Phone } from "lucide-react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contact-us-page">
      <div className="container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p className="contact-subtitle">
            Get in touch with the KJSCE Alumni Association
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-info-grid">
            <div className="contact-card">
              <div className="contact-icon">
                <Mail size={24} />
              </div>
              <div className="contact-details">
                <h3>Email</h3>
                <a href="mailto:alumni.engg@somaiya.edu">alumni.engg@somaiya.edu</a>
                <p>For general inquiries and support</p>
              </div>
            </div>

            {/* <div className="contact-card">
              <div className="contact-icon">
                <Phone size={24} />
              </div>
              <div className="contact-details">
                <h3>Phone</h3>
                <a href="tel:+912224266970">+91 22 2426 6970</a>
                <p>Mon-Fri: 9:00 AM - 6:00 PM</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
