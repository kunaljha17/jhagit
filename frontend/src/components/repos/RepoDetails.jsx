import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Navbar from "../Navbar";
import SkeletonLoader from "../ui/SkeletonLoader";
import ConfirmModal from "../ui/ConfirmModal";
import "./RepoDetails.css";

/** Format a date as relative time, e.g. "2 hours ago" */
function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  const diffMon = Math.floor(diffDay / 30);
  if (diffMon < 12) return `${diffMon} month${diffMon > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString();
}

const RepoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [activeTab, setActiveTab] = useState("code"); // 'code' | 'issues' | 'settings'
  const [files, setFiles] = useState([]);
  const [commits, setCommits] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [issues, setIssues] = useState([]);
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueDesc, setNewIssueDesc] = useState("");
  const [isStarred, setIsStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // New File modal state
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [newFilename, setNewFilename] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [addFileLoading, setAddFileLoading] = useState(false);

  // Confirm delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchRepoDetails = useCallback(async () => {
    try {
      setLoading(true);
      if (id) {
        const repoRes = await axiosClient.get(`/repo/${id}`);
        const repoData = repoRes.data;
        setRepo(repoData);
        setStarCount(repoData.starCount || 0);

        if (repoData.issues) {
          setIssues(repoData.issues);
        }

        // Check if user starred this repo
        if (userId) {
          const starredRes = await axiosClient.get(`/repo/starred/user/${userId}`);
          const starredList = starredRes.data || [];
          setIsStarred(starredList.some(r => r._id === id));
        }

        // Extract repo-specific files strictly from repoData.content
        const filesList = [];
        if (repoData.content && Array.isArray(repoData.content)) {
          repoData.content.forEach((item, index) => {
            if (typeof item === 'string') {
              filesList.push({ name: `file_${index + 1}.txt`, content: item });
            } else if (item && item.name) {
              filesList.push({ name: item.name, content: item.content || "", updatedAt: item.updatedAt });
            }
          });
        }

        setFiles(filesList);
        if (filesList.length > 0) {
          setSelectedFile(filesList[0]);
        } else {
          setSelectedFile(null);
        }

        // Fetch commit logs for timeline
        try {
          const gitRes = await axiosClient.get("/git/log");
          setCommits(gitRes.data || []);
        } catch {
          setCommits([]);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching repository details:", err);
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    fetchRepoDetails();
  }, [fetchRepoDetails]);

  const isOwner = repo && repo.Owner && (
    (repo.Owner._id && repo.Owner._id.toString() === userId) ||
    (repo.Owner.toString() === userId)
  );

  const handleToggleStar = async () => {
    if (!id || !userId) return;
    const nextStarred = !isStarred;
    setIsStarred(nextStarred);
    setStarCount(prev => (nextStarred ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextStarred) {
        await axiosClient.post(`/repo/star/${id}`, { userId });
      } else {
        await axiosClient.post(`/repo/unstar/${id}`, { userId });
      }
    } catch (err) {
      console.error("Error toggling star:", err);
      fetchRepoDetails();
    }
  };

  const handleCopyContent = async () => {
    if (!selectedFile?.content) return;
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = selectedFile.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddFileSubmit = async (e) => {
    e.preventDefault();
    if (!newFilename.trim()) return;

    try {
      setAddFileLoading(true);
      await axiosClient.post(`/repo/file/add/${id}`, {
        filename: newFilename.trim(),
        content: newFileContent,
      });

      setAddFileLoading(false);
      setShowAddFileModal(false);
      setNewFilename("");
      setNewFileContent("");
      setActionMessage(`File '${newFilename.trim()}' added successfully!`);
      fetchRepoDetails();
    } catch (err) {
      console.error("Failed to add file:", err);
      setActionMessage("Failed to add file to repository.");
      setAddFileLoading(false);
    }
  };

  const handleDeleteRepository = async () => {
    try {
      await axiosClient.delete(`/repo/delete/${id}`);
      setShowDeleteModal(false);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete repository:", err);
      setActionMessage(err.response?.data?.error || "Failed to delete repository.");
      setShowDeleteModal(false);
    }
  };

  const handleCliAction = async (actionType) => {
    setActionMessage(`Executing ${actionType}...`);
    try {
      if (actionType === "init") {
        await axiosClient.post("/git/init");
      } else if (actionType === "push") {
        await axiosClient.post("/git/push");
      } else if (actionType === "pull") {
        await axiosClient.post("/git/pull");
      }
      setActionMessage(`Command 'git ${actionType}' completed!`);
      fetchRepoDetails();
    } catch (err) {
      setActionMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!newIssueTitle.trim()) return;

    try {
      const targetRepoId = id || (repo && repo._id);
      if (!targetRepoId) return;

      const res = await axiosClient.post(`/issue/create/${targetRepoId}`, {
        title: newIssueTitle,
        description: newIssueDesc,
      });

      setIssues([...issues, res.data]);
      setNewIssueTitle("");
      setNewIssueDesc("");
      setActionMessage("Issue created successfully!");
    } catch (err) {
      console.error("Failed to create issue:", err);
      setActionMessage("Failed to create issue.");
    }
  };

  // --- Loading state with skeletons ---
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="repo-details-container" aria-busy="true">
          <SkeletonLoader variant="text" count={2} height="24px" />
          <div style={{ marginTop: "1.5rem" }}>
            <SkeletonLoader count={3} height="70px" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="repo-details-container">
        {/* Repo Header */}
        <div className="repo-header">
          <div>
            <div className="repo-title-area">
              <h2>{repo ? repo.name : "jhaGit Repository"}</h2>
              <span className={repo?.visibility ? "badge-public" : "badge-private"}>
                {repo?.visibility ? "Public" : "Private"}
              </span>
            </div>
            <p className="repo-desc">
              {repo?.description || "No description provided for this repository."}
            </p>
          </div>

          <button
            className={`star-btn ${isStarred ? "starred" : ""}`}
            onClick={handleToggleStar}
            aria-pressed={isStarred}
            aria-label={isStarred ? "Unstar this repository" : "Star this repository"}
          >
            {isStarred ? "★ Starred" : "☆ Star"} ({starCount})
          </button>
        </div>

        {/* Action Status Banner */}
        {actionMessage && (
          <div
            role="alert"
            style={{ background: "rgba(88, 166, 255, 0.15)", border: "1px solid var(--accent-primary)", padding: "10px", borderRadius: "var(--radius-sm)", marginBottom: "1rem", color: "var(--accent-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage("")}
              style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", fontSize: "1.2rem", padding: "0 4px" }}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="repo-nav-tabs" role="tablist">
          <div
            className={`tab-item ${activeTab === "code" ? "active" : ""}`}
            onClick={() => setActiveTab("code")}
            role="tab"
            aria-selected={activeTab === "code"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("code")}
          >
            Code
          </div>
          <div
            className={`tab-item ${activeTab === "issues" ? "active" : ""}`}
            onClick={() => setActiveTab("issues")}
            role="tab"
            aria-selected={activeTab === "issues"}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveTab("issues")}
          >
            Issues ({issues.length})
          </div>
          {isOwner && (
            <div
              className={`tab-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
              role="tab"
              aria-selected={activeTab === "settings"}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveTab("settings")}
            >
              Settings
            </div>
          )}
        </div>

        {/* Tab 1: Code */}
        {activeTab === "code" && (
          <div className="grid-two-col">
            <div>
              {/* File Explorer & Code Viewer */}
              <div className="card-panel">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-muted)", paddingBottom: "10px" }}>
                  <h3 style={{ margin: 0, border: "none", padding: 0 }}>Repository Files ({files.length})</h3>
                  <button
                    className="btn-primary"
                    style={{ fontSize: "0.8rem", padding: "4px 12px" }}
                    onClick={() => setShowAddFileModal(!showAddFileModal)}
                  >
                    {showAddFileModal ? "Cancel" : "+ Add File"}
                  </button>
                </div>

                {/* Add File Inline Form */}
                {showAddFileModal && (
                  <form onSubmit={handleAddFileSubmit} style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "1rem", marginBottom: "1rem" }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem" }}>Add New File to {repo?.name}</h4>
                    <div className="auth-form-group">
                      <label htmlFor="add-file-name">Filename (e.g. index.js, README.md, app.py)</label>
                      <input
                        id="add-file-name"
                        type="text"
                        className="auth-input"
                        placeholder="Filename..."
                        value={newFilename}
                        onChange={(e) => setNewFilename(e.target.value)}
                        required
                      />
                    </div>
                    <div className="auth-form-group">
                      <label htmlFor="add-file-content">File Content</label>
                      <textarea
                        id="add-file-content"
                        className="auth-input"
                        rows="5"
                        placeholder="Paste or write file content..."
                        value={newFileContent}
                        onChange={(e) => setNewFileContent(e.target.value)}
                        style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
                      />
                    </div>
                    <button type="submit" className="btn-primary" disabled={addFileLoading}>
                      {addFileLoading ? "Saving..." : "Commit File"}
                    </button>
                  </form>
                )}

                {files.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", padding: "1rem 0" }}>
                    This repository is empty. Click <strong>+ Add File</strong> above to create a file in this repository.
                  </p>
                ) : (
                  <div>
                    <div style={{ marginBottom: "1rem" }}>
                      {files.map((file) => (
                        <div
                          key={file.name}
                          className="file-list-item"
                          onClick={() => { setSelectedFile(file); setCopied(false); }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && setSelectedFile(file)}
                          style={{
                            background: selectedFile?.name === file.name ? "var(--bg-overlay)" : "transparent"
                          }}
                        >
                          <span>📄 {file.name}</span>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {file.updatedAt ? formatRelativeTime(file.updatedAt) : "View"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {selectedFile && (
                      <div>
                        <div className="file-preview-header">
                          <h4>Viewing: {selectedFile.name}</h4>
                          <button
                            className={`copy-btn ${copied ? "copied" : ""}`}
                            onClick={handleCopyContent}
                            aria-label="Copy file content to clipboard"
                          >
                            {copied ? "✓ Copied" : "📋 Copy"}
                          </button>
                        </div>
                        <div className="file-content-preview">
                          {selectedFile.content || "// File is empty"}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CLI Control Panel */}
              <div className="card-panel">
                <h3>Git Engine Controls</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Trigger local and remote Git engine commands directly from the web interface:
                </p>
                <div className="cli-panel">
                  <button className="cli-btn" onClick={() => handleCliAction("init")}>$ git init</button>
                  <button className="cli-btn" onClick={() => handleCliAction("push")}>$ git push</button>
                  <button className="cli-btn" onClick={() => handleCliAction("pull")}>$ git pull</button>
                </div>
              </div>
            </div>

            {/* Commit Log History */}
            <div>
              <div className="card-panel">
                <h3>Recent Commits</h3>
                {commits.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No local commits found.</p>
                ) : (
                  commits.map((commit) => (
                    <div key={commit.commitID} className="commit-entry">
                      <div className="commit-msg">{commit.message}</div>
                      <div className="commit-meta">
                        ID: {commit.commitID.substring(0, 8)} • {formatRelativeTime(commit.date)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Issues */}
        {activeTab === "issues" && (
          <div className="grid-two-col">
            <div>
              <div className="card-panel">
                <h3>Repository Issues</h3>
                {issues.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No open issues found for this repository.</p>
                ) : (
                  issues.map((issue) => (
                    <div key={issue._id || issue.title} className="issue-item">
                      <div>
                        <div className="issue-title">{issue.title}</div>
                        <div className="issue-desc">{issue.description}</div>
                      </div>
                      <span className={issue.status === "closed" ? "badge-closed" : "badge-open"}>
                        {issue.status || "open"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Create Issue Box */}
            <div>
              <div className="card-panel">
                <h3>New Issue</h3>
                <form onSubmit={handleCreateIssue} className="create-issue-form">
                  <input
                    type="text"
                    placeholder="Issue Title"
                    value={newIssueTitle}
                    onChange={(e) => setNewIssueTitle(e.target.value)}
                    required
                    aria-label="Issue title"
                  />
                  <textarea
                    rows="4"
                    placeholder="Describe the issue..."
                    value={newIssueDesc}
                    onChange={(e) => setNewIssueDesc(e.target.value)}
                    required
                    aria-label="Issue description"
                  />
                  <button type="submit" className="btn-primary">Submit new issue</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Settings (Owner Only) */}
        {activeTab === "settings" && isOwner && (
          <div style={{ maxWidth: "700px" }}>
            <div className="card-panel" style={{ background: "rgba(218, 54, 51, 0.05)", borderColor: "rgba(218, 54, 51, 0.4)" }}>
              <h3 style={{ color: "#f85149" }}>Danger Zone</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Deleting this repository is irreversible. All project files, issues, and star counts will be permanently removed.
              </p>
              <button
                className="btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete this repository
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Repository"
          message={`This action is permanent and cannot be undone. Type "${repo?.name}" to confirm deletion.`}
          confirmLabel="I understand, delete this repository"
          confirmVariant="danger"
          requireInput={repo?.name}
          onConfirm={handleDeleteRepository}
          onCancel={() => setShowDeleteModal(false)}
        />
      </div>
    </>
  );
};

export default RepoDetails;
