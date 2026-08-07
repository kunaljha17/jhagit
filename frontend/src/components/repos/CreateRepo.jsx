import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Navbar from "../Navbar";
import "./CreateRepo.css";

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateRepo = async (e) => {
    e.preventDefault();
    setError("");

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User not authenticated. Please sign in again.");
      return;
    }

    if (!name.trim()) {
      setError("Repository name is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post("/repo/create", {
        Owner: userId,
        name: name.trim(),
        description: description.trim(),
        visibility: visibility,
        content: [],
        issues: [],
      });

      setLoading(false);
      navigate(`/repo/${res.data.repositoryID || ""}`);
    } catch (err) {
      console.error(err);
      const serverErrMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : (err.response?.data?.error || err.response?.data?.message || "Failed to create repository.");
      setError(serverErrMsg);
      setLoading(false);
    }
  };

  const formattedSlug = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-") || "my-repo";

  return (
    <>
      <Navbar />
      <div className="create-repo-wrapper">
        <div className="create-repo-header">
          <h2>Create a new repository</h2>
          <p>A repository contains all project files, revision history, and issues.</p>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <div className="create-repo-card">
          <form onSubmit={handleCreateRepo}>
            <div className="auth-form-group">
              <label htmlFor="repo-name">Repository name *</label>
              <input
                id="repo-name"
                type="text"
                className="auth-input"
                placeholder="e.g. my-awesome-project"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="url-preview-box">
                jhaGit.com/owner/<strong>{formattedSlug}</strong>
              </div>
            </div>

            <div className="auth-form-group" style={{ marginTop: "1rem" }}>
              <label htmlFor="repo-desc">Description (optional)</label>
              <input
                id="repo-desc"
                type="text"
                className="auth-input"
                placeholder="Short description of your project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === true}
                  onChange={() => setVisibility(true)}
                />
                <div>
                  <strong>Public</strong>
                  <p>Anyone on the internet can see this repository.</p>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === false}
                  onChange={() => setVisibility(false)}
                />
                <div>
                  <strong>Private</strong>
                  <p>You choose who can see and commit to this repository.</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="auth-btn"
              style={{ width: "auto", padding: "8px 24px" }}
              disabled={loading}
            >
              {loading ? "Creating repository..." : "Create repository"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRepo;
