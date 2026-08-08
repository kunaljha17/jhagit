import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar-container" aria-label="Main Navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="jhaGit Home">
          <img
            src="https://res.cloudinary.com/dzffc9b1p/image/upload/v1786171616/copy_of_jhagit-logo-2_myvvyn.png"
            alt="jhaGit Logo"
            className="octicon-logo navbar-logo-img"
          />
          <span className="brand-title">jhaGit</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <span className={`hamburger ${mobileOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className={`navbar-links ${mobileOpen ? "mobile-open" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/create"
            className={`nav-link ${location.pathname === "/create" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            + New Repository
          </Link>
          <Link
            to="/profile"
            className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;