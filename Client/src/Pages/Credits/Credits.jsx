import React from "react";
import { Github, Linkedin, Mail, Code, Heart } from "lucide-react";
import "./Credits.css";
import KaushalBhadra from "../../assets/credits/KaushalBhadra.jpg"
import ShubhamChaurasia from "../../assets/credits/ShubhamChaurasia.jpg"
import KrishJain from "../../assets/credits/KrishJain.jpg"
import OmkarBhoir from "../../assets/credits/OmkarBhoir.jpeg"

const Credits = () => {
  const developers = [
    {
      name: "Kaushal Bhadra",
      role: "Frontend Developer",
      image: KaushalBhadra,
      github: "https://github.com/KaushalBhadra15",
      linkedin: "https://in.linkedin.com/in/kaushalbhadra",
    },
    {
      name: "Shubham Chaurasia",
      role: "Backend Developer",
      image: ShubhamChaurasia,
      github: "https://github.com/shubham98672",
      linkedin: "http://www.linkedin.com/in/shubham-chaurasia-4630b0345",
    },
    {
      name: "Krish K Jain",
      role: "UI/UX Designer",
      image: KrishJain,
      github: "https://github.com/krish2006-jain",
      linkedin: "http://www.linkedin.com/in/krish-jain-6687bb329",
    },
    {
      name: "Omkar Bhoir",
    //   role: "Full Stack Developer",
      image: OmkarBhoir,
      github:"https://github.com/robaro12345",
      linkedin: "https://linkedin.com/in/omkarvbhoir",
    }
  ];

  const technologies = [
    "React.js", "Node.js", "Express.js", "MongoDB", "Passport.js", 
    "Multer", "Framer Motion", "Lucide React", "CSS3", "HTML5"
  ];

  return (
    <div className="credits-page">
      <div className="container">
        <div className="credits-header">
          <h1>Credits</h1>
          <p className="credits-subtitle">
            Meet the team behind the KJSCE Alumni Portal
          </p>
        </div>

        <div className="credits-content">
          <div className="project-info">
            <div className="project-card">
              <div className="project-header">
                <Code size={48} className="project-icon" />
                <div>
                  <h2>KJSCE Alumni Portal</h2>
                  <p className="project-description">
                    A comprehensive platform connecting KJSCE alumni worldwide, 
                    facilitating networking, career opportunities, and community engagement.
                  </p>
                </div>
              </div>
              
              <div className="project-stats">
                <div className="stat">
                  <h3>{developers.length}</h3>
                  <p>Team Members</p>
                </div>
              </div>
            </div>
          </div>

          <div className="team-section">
            <h2 className="section-title">Development Team</h2>
            <div className="developers-grid">
              {developers.map((developer, index) => (
                <div key={index} className="developer-card">
                  <div className="developer-image">
                    <img 
                      src={developer.image} 
                      alt={developer.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="image-placeholder" style={{ display: 'none' }}>
                      <span>{developer.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                  </div>
                  
                  <div className="developer-info">
                    <h3>{developer.name}</h3>
                    <p className="developer-role">{developer.role}</p>
                    <div className="developer-links">
                      <a href={developer.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <Github size={20} />
                      </a>
                      <a href={developer.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <Linkedin size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="technologies-section">
            <h2 className="section-title">Technologies Used</h2>
            <div className="technologies-grid">
              {technologies.map((tech, index) => (
                <div key={index} className="technology-tag">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;
