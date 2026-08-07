import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const NotFound = () => {
  return (
    <>
      <Navbar />
      <div style={{
        maxWidth: "600px",
        margin: "6rem auto",
        textAlign: "center",
        padding: "0 1.5rem",
      }}>
        <h1 style={{
          fontSize: "8rem",
          fontWeight: 700,
          color: "var(--text-muted)",
          margin: 0,
          lineHeight: 1,
          fontFamily: "var(--font-mono)",
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          margin: "1rem 0 0.5rem 0",
        }}>
          This is not the page you&apos;re looking for
        </h2>
        <p style={{
          color: "var(--text-secondary)",
          fontSize: "0.95rem",
          marginBottom: "2rem",
        }}>
          The page you requested does not exist or you may not have permission to view it.
        </p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            background: "var(--accent-success)",
            color: "#fff",
            padding: "10px 24px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          Take me home
        </Link>
      </div>
    </>
  );
};

export default NotFound;
