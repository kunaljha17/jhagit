import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container" aria-label="Site Footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo-link">
            <img
              src="https://res.cloudinary.com/dzffc9b1p/image/upload/v1786171616/copy_of_jhagit-logo-2_myvvyn.png"
              alt="jhaGit Logo"
              className="octicon-logo footer-logo-img"
            />
            <span className="footer-brand-title">jhaGit</span>
          </Link>
        </div>

        <nav className="footer-links" aria-label="Footer Navigation">
          <Link to="/about-me" className="footer-link">
            About Me
          </Link>
          <Link to="/about-project" className="footer-link">
            About This Project
          </Link>
          <Link to="/terms" className="footer-link">
            Terms and Conditions
          </Link>
          <a
            href="https://wa.me/918789625512"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link contact-link"
          >
            Contact Me 💬
          </a>
        </nav>
      </div>

      <div className="footer-copyright">
        © 2026 Kunal Kumar. All rights reserved. Contact:{" "}
        <a href="mailto:jhakunal124@gmail.com" className="footer-email-link">
          jhakunal124@gmail.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;
