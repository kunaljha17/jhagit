import React from "react";
import Navbar from "../Navbar";
import "./infoPages.css";

const AboutProject = () => {
  return (
    <>
      <Navbar />
      <div className="info-page-container">
        <div className="info-card">
          <div className="project-top-header">
            <div>
              <h1 className="info-title">About jhaGit</h1>
              <p className="info-subtitle">
                A Full-Stack Version Control System & Repository Dashboard
              </p>
            </div>
            <a
              href="https://github.com/kunaljha17/jhaGit.git"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-github-top"
            >
              <svg height="20" viewBox="0 0 16 16" width="20" fill="currentColor" aria-hidden="true">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              View Source on GitHub
            </a>
          </div>

          <div className="info-section">
            <h2>What jhaGit Is</h2>
            <p className="info-bio">
              <strong>jhaGit</strong> is a distributed version control system and repository management platform — a learning-focused replica of GitHub built using Node.js/Express, MongoDB, Cloudflare R2, and a React frontend dashboard.
            </p>
            <p className="info-bio">
              It encompasses both a <strong>custom Command Line Interface (CLI)</strong> that mimics core Git operations locally in terminal, and a <strong>full web platform</strong> allowing developers to manage repositories, preview code files, star projects, track issues, and view contribution activity.
            </p>
          </div>

          <div className="info-section">
            <h2>Web Platform Features</h2>
            <ul className="feature-list">
              <li>
                <strong>Repository Hosting & Explorer:</strong> Browse repository files with inline content previews.
              </li>
              <li>
                <strong>In-Browser File Editing:</strong> Add and commit new files directly from the web interface.
              </li>
              <li>
                <strong>Starring System:</strong> Star or unstar repositories with real-time star counts.
              </li>
              <li>
                <strong>12-Month Contribution Heatmap:</strong> Visual contribution calendar tracking commits, issues, and repository updates.
              </li>
              <li>
                <strong>Issue Tracker:</strong> Create, manage, and monitor open/closed repository issues.
              </li>
              <li>
                <strong>Owner Settings:</strong> Repository visibility toggle (Public/Private) and owner-authenticated deletion.
              </li>
              <li>
                <strong>Authentication & Security:</strong> JWT token authentication with bcrypt password hashing.
              </li>
            </ul>
          </div>

          <div className="info-section">
            <h2>Custom CLI Tool & Engine</h2>
            <p className="info-bio">
              jhaGit includes a standalone Node.js CLI tool supporting core Git version control commands:
            </p>
            <div className="cli-tags">
              <code>init</code>
              <code>add</code>
              <code>commit</code>
              <code>status</code>
              <code>log</code>
              <code>diff</code>
              <code>branch</code>
              <code>checkout</code>
              <code>merge</code>
              <code>revert</code>
              <code>push</code>
              <code>pull</code>
              <code>clone</code>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <a
                href="https://github.com/kunaljha17/jhaGit.git"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-link"
              >
                View CLI docs & full source on GitHub ↗
              </a>
              <p className="note-text">
                * Note: The repository is being actively updated — CLI docs and source code will reflect the latest version soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutProject;
