import React from "react";
import Navbar from "../Navbar";
import "./infoPages.css";

const Terms = () => {
  return (
    <>
      <Navbar />
      <div className="info-page-container">
        <div className="info-card">
          <h1 className="info-title">Terms and Conditions</h1>
          <p className="info-subtitle">
            Project Disclaimer & Usage Policy
          </p>

          <div className="info-section">
            <h2>Project Ownership & Educational Purpose</h2>
            <p className="info-bio">
              The <strong>jhaGit</strong> platform and CLI version control engine were conceptualized, researched, and developed by <strong>Kunal Kumar</strong> as an educational computer science project.
            </p>
            <p className="info-bio">
              jhaGit is a learning-focused replica of GitHub, engineered using Node.js, Express, MongoDB, and React strictly for academic research, portfolio presentation, and educational exploration of version control internals.
            </p>
          </div>

          <div className="info-section">
            <h2>Trademark & Non-Affiliation Disclaimer</h2>
            <p className="info-bio">
              jhaGit is an independent open-source learning project. It is <strong>not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected to GitHub, Inc.</strong>, Microsoft Corporation, or any of their subsidiaries or affiliates.
            </p>
            <p className="info-bio">
              The official GitHub website can be accessed at <a href="https://github.com" target="_blank" rel="noopener noreferrer">https://github.com</a>. All product names, logos, brands, and trademarks referenced belong to their respective owners.
            </p>
          </div>

          <div className="info-section">
            <h2>Non-Commercial & Production Use</h2>
            <p className="info-bio">
              This application is <strong>not intended for commercial, enterprise, or production use</strong>. It serves as a practical demonstration of distributed version control algorithms (3-way merge engines, commit DAG traversal), REST API design, and modern front-end web architecture.
            </p>
          </div>

          <div className="info-section">
            <h2>Contact & Inquiries</h2>
            <p className="info-bio">
              For any questions, feedback, or inquiries regarding this educational project, please contact:
            </p>
            <p className="contact-box">
              📧 Email: <a href="mailto:jhakunal124@gmail.com" className="project-link">jhakunal124@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
