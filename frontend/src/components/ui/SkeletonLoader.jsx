import React from "react";
import "./SkeletonLoader.css";

/**
 * Reusable skeleton loader component.
 * Usage: <SkeletonLoader count={3} height="80px" />
 *        <SkeletonLoader variant="card" count={4} />
 *        <SkeletonLoader variant="text" count={3} />
 */
const SkeletonLoader = ({ count = 1, variant = "card", height, width }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === "text") {
    return (
      <div className="skeleton-text-group" role="status" aria-label="Loading content">
        {items.map((i) => (
          <div
            key={i}
            className="skeleton-line"
            style={{
              width: i === items.length - 1 ? "60%" : width || "100%",
              height: height || "14px",
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div role="status" aria-label="Loading profile">
        <div className="skeleton-avatar" style={{ width: width || "200px", height: height || "200px" }} />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Default: card
  return (
    <div role="status" aria-label="Loading content">
      {items.map((i) => (
        <div
          key={i}
          className="skeleton-card"
          style={{ height: height || "80px", width: width || "100%" }}
        >
          <div className="skeleton-card-inner">
            <div className="skeleton-line" style={{ width: "40%", height: "16px" }} />
            <div className="skeleton-line" style={{ width: "75%", height: "12px" }} />
            <div className="skeleton-line" style={{ width: "25%", height: "12px" }} />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default SkeletonLoader;
