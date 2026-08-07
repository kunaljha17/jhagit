import React from "react";
import Navbar from "../Navbar";
import "./infoPages.css";

const AboutMe = () => {
  return (
    <>
      <Navbar />
      <div className="info-page-container">
        <div className="info-card">
          <div className="profile-header-badge">
            <img
              src="https://res.cloudinary.com/dzffc9b1p/image/upload/c_fill,g_auto,w_300,h_300/v1785814771/WhatsApp_Image_2026-07-07_at_8.34.41_PM_ll89n3.jpg"
              alt="Kunal Kumar"
              className="profile-avatar-img"
            />
            <div>
              <h1 className="info-title">Kunal Kumar</h1>
              <p className="info-subtitle">
                3rd Year Information Technology Student • Full-Stack Web Developer
              </p>
            </div>
          </div>

          <div className="info-section">
            <h2>About Me</h2>
            <p className="info-bio">
              Hello! I am Kunal Kumar, an Information Technology undergraduate student (2024–2028) currently in my 3rd year at Haldia Institute of Technology. My core technical expertise is focused on full-stack web development using the MERN stack (MongoDB, Express, React, Node.js).
            </p>
            <p className="info-bio">
              I built <strong>jhaGit</strong> — a hybrid Git version control CLI tool coupled with a full-stack GitHub-inspired web platform — to gain a fundamental, first-principles understanding of how distributed version control systems function under the hood, including multi-parent commit graphs, 3-way merge engines, and object snapshots.
            </p>
            <p className="info-bio">
              I am actively seeking Web Development and Full-Stack Engineering internship opportunities where I can solve challenging problems, write clean, maintainable code, and contribute to impactful software products.
            </p>
          </div>

          <div className="info-section">
            <h2>Resume</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
              View or download my updated curriculum vitae:
            </p>
            <a
              href="https://drive.google.com/file/d/117rkWSYQNnI7TTd82QmSWimPVQrpsUXY/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-link"
            >
              📄 View Resume on Google Drive
            </a>
          </div>

          <div className="info-section">
            <h2>Featured Projects</h2>
            <div className="project-cards-grid">
              <div className="project-card">
                <h3>Nestify</h3>
                <p>Full-stack property and hotel listings web application built with MERN stack.</p>
                <a
                  href="https://nestify-1-pox5.onrender.com/listings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  Visit Nestify ↗
                </a>
              </div>

              <div className="project-card">
                <h3>Weather App</h3>
                <p>Interactive real-time weather forecasting application with location support.</p>
                <a
                  href="https://weather-app-kunalkumar.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  Visit Weather App ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutMe;
