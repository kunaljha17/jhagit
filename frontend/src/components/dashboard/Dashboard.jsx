import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import SkeletonLoader from "../ui/SkeletonLoader";
import axiosClient from "../../api/axiosClient";
import "./dashboard.css";

/** Format a date as relative time */
function formatRelativeTime(dateStr) {
  if (!dateStr) return "Updated recently";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "Updated recently";
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "Updated just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Updated ${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Updated ${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `Updated ${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return `Updated on ${new Date(dateStr).toLocaleDateString()}`;
}

/** Get the most recent updatedAt from a repo's content array */
function getRepoLatestUpdate(repo) {
  if (!repo.content || !Array.isArray(repo.content) || repo.content.length === 0) return null;
  const dates = repo.content
    .map(item => item?.updatedAt)
    .filter(Boolean)
    .map(d => new Date(d).getTime())
    .filter(t => !isNaN(t));
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates)).toISOString();
}

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [starredIds, setStarredIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const userId = localStorage.getItem("userId");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (userId) {
        const repoRes = await axiosClient.get(`/repo/user/${userId}`);
        setRepositories(Array.isArray(repoRes.data.repositories) ? repoRes.data.repositories : []);

        const starredRes = await axiosClient.get(`/repo/starred/user/${userId}`);
        const ids = (starredRes.data || []).map(r => r._id);
        setStarredIds(ids);
      }

      const suggestedRes = await axiosClient.get(`/repo/all`);
      setSuggestedRepositories(Array.isArray(suggestedRes.data) ? suggestedRes.data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const currentRepos = Array.isArray(repositories) ? repositories : [];
    if (debouncedQuery.trim() === "") {
      setSearchResults(currentRepos);
    } else {
      const filteredRepo = currentRepos.filter((repo) =>
        repo.name ? repo.name.toLowerCase().includes(debouncedQuery.toLowerCase()) : false
      );
      setSearchResults(filteredRepo);
    }
  }, [debouncedQuery, repositories]);

  const handleToggleStar = async (e, repoId) => {
    e.stopPropagation();
    const isStarred = starredIds.includes(repoId);

    // Optimistic UI update
    if (isStarred) {
      setStarredIds(starredIds.filter(id => id !== repoId));
    } else {
      setStarredIds([...starredIds, repoId]);
    }

    try {
      if (isStarred) {
        await axiosClient.post(`/repo/unstar/${repoId}`, { userId });
      } else {
        await axiosClient.post(`/repo/star/${repoId}`, { userId });
      }
      fetchData();
    } catch (err) {
      console.error("Failed to toggle star:", err);
      fetchData();
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <main>
          <div className="dashboard-main-header">
            <h2>Your Repositories</h2>
            <button className="btn-new-repo" onClick={() => navigate("/create")}>
              New
            </button>
          </div>

          <div className="search-input-wrapper">
            <input
              ref={searchRef}
              type="text"
              className="search-input"
              value={searchQuery}
              placeholder="Find a repository..."
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search your repositories"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <span className="search-shortcut-hint">Ctrl+K</span>
          </div>

          {loading ? (
            <SkeletonLoader count={4} height="80px" />
          ) : searchResults.length === 0 ? (
            <div className="sidebar-panel" style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                {debouncedQuery
                  ? `No repositories matching "${debouncedQuery}".`
                  : "You don't have any repositories yet."
                }
              </p>
              <button className="btn-new-repo" onClick={() => navigate("/create")}>
                Create a repository
              </button>
            </div>
          ) : (
            searchResults.map((repo) => {
              const isStarred = starredIds.includes(repo._id);
              return (
                <div key={repo._id} className="repo-card">
                  <div className="repo-card-info">
                    <div className="repo-card-title">
                      <h3 onClick={() => navigate(`/repo/${repo._id}`)}>{repo.name}</h3>
                      <span className="repo-badge">{repo.visibility ? "Public" : "Private"}</span>
                    </div>
                    <p className="repo-desc">{repo.description || "No description provided."}</p>
                    <div className="repo-meta">
                      <span>★ {repo.starCount || 0} stars</span>
                      <span>{formatRelativeTime(getRepoLatestUpdate(repo))}</span>
                    </div>
                  </div>

                  <button
                    className={`star-btn ${isStarred ? "starred" : ""}`}
                    onClick={(e) => handleToggleStar(e, repo._id)}
                    aria-pressed={isStarred}
                    aria-label={isStarred ? `Unstar ${repo.name}` : `Star ${repo.name}`}
                  >
                    {isStarred ? "★ Starred" : "☆ Star"}
                  </button>
                </div>
              );
            })
          )}
        </main>

        <aside>
          <div className="sidebar-panel">
            <h3>Suggested Repositories</h3>
            {suggestedRepositories.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                No public repositories found yet.
              </p>
            ) : (
              suggestedRepositories.slice(0, 5).map((repo) => (
                <div
                  key={repo._id}
                  className="suggested-item"
                  onClick={() => navigate(`/repo/${repo._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/repo/${repo._id}`)}
                >
                  <div className="suggested-title">{repo.name}</div>
                  <div className="suggested-desc">{repo.description || "Public repository"}</div>
                </div>
              ))
            )}
          </div>

          <div className="sidebar-panel">
            <h3>Latest Activity</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Explore commits, branches, and issues directly inside your repositories.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Dashboard;