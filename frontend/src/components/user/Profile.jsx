import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Navbar from "../Navbar";
import HeatMapProfile from "./HeatMap";
import SkeletonLoader from "../ui/SkeletonLoader";
import { useAuth } from "../../authContext";
import "./Profile.css";
import AvatarPickerModal from "./AvatarPickerModal.jsx";
import { DEFAULT_AVATAR } from "../constants/avatars";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    username: "User",
    email: "",
  });
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'starred' | 'settings'
  const [ownRepos, setOwnRepos] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const { setCurrentUser } = useAuth();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      try {
        setProfileLoading(true);
        const userRes = await axiosClient.get(`/userProfile/${userId}`);
        setUserDetails(userRes.data);
        setNewEmail(userRes.data.email || "");

        const ownRes = await axiosClient.get(`/repo/user/${userId}`);
        setOwnRepos(
          Array.isArray(ownRes.data.repositories)
            ? ownRes.data.repositories
            : [],
        );

        const starredRes = await axiosClient.get(
          `/repo/starred/user/${userId}`,
        );
        setStarredRepos(Array.isArray(starredRes.data) ? starredRes.data : []);
        setProfileLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        setProfileLoading(false);
      }
    };
    fetchProfileData();
  }, [userId]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMsg("");
    try {
      const res = await axiosClient.put(`/updateProfile/${userId}`, {
        email: newEmail,
        password: newPassword || undefined,
      });
      setUpdateMsg("Profile updated successfully!");
      if (res.data.user) {
        setUserDetails((prev) => ({ ...prev, ...res.data.user }));
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setUpdateMsg("Failed to update profile.");
    }
  };

  const handleAvatarSelect = async (avatarUrl) => {
    try {
      const res = await axiosClient.patch("/user/avatar", { avatarUrl });
      setUserDetails((prev) => ({ ...prev, avatar: res.data.user.avatar }));
      setShowAvatarPicker(false);
    } catch (err) {
      console.error("Failed to update avatar", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth");
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          {profileLoading ? (
            <SkeletonLoader variant="avatar" width="200px" height="200px" />
          ) : (
            <>
              <div
                className="avatar-large avatar-clickable"
                onClick={() => setShowAvatarPicker(true)}
                title="Click to change avatar"
              >
                <img
                  src={userDetails.avatar || DEFAULT_AVATAR}
                  alt={userDetails.username || "User"}
                  className="avatar-img"
                />
                <div className="avatar-edit-overlay">✏️ Edit</div>
              </div>
              <h2 className="profile-name">{userDetails.username}</h2>
              <div className="profile-email">{userDetails.email}</div>
              <p className="profile-bio">
                jhaGit Developer & Code Collaborator
              </p>
              {showAvatarPicker && (
                <AvatarPickerModal
                  currentAvatar={userDetails.avatar || DEFAULT_AVATAR}
                  onSelect={handleAvatarSelect}
                  onClose={() => setShowAvatarPicker(false)}
                />
              )}
            </>
          )}

          <button
            className="btn-new-repo"
            style={{ width: "100%", marginTop: "1rem" }}
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>

        {/* Main Content Area */}
        <div>
          {/* Nav Tabs */}
          <div className="profile-tabs">
            <div
              className={`profile-tab-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview ({ownRepos.length})
            </div>
            <div
              className={`profile-tab-item ${activeTab === "starred" ? "active" : ""}`}
              onClick={() => setActiveTab("starred")}
            >
              Starred Repositories ({starredRepos.length})
            </div>
            <div
              className={`profile-tab-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <HeatMapProfile userId={userId} />

              <h3 style={{ margin: "1.5rem 0 1rem 0", fontSize: "1.1rem" }}>
                Your Repositories
              </h3>
              {ownRepos.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>
                  No repositories created yet.
                </p>
              ) : (
                ownRepos.map((repo) => (
                  <div
                    key={repo._id}
                    className="repo-card"
                    onClick={() => navigate(`/repo/${repo._id}`)}
                  >
                    <div className="repo-card-info">
                      <div className="repo-card-title">
                        <h3>{repo.name}</h3>
                        <span className="repo-badge">
                          {repo.visibility ? "Public" : "Private"}
                        </span>
                      </div>
                      <p className="repo-desc">
                        {repo.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Starred Repositories Tab */}
          {activeTab === "starred" && (
            <div>
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
                Starred Repositories
              </h3>
              {starredRepos.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>
                  You haven't starred any repositories yet.
                </p>
              ) : (
                starredRepos.map((repo) => (
                  <div
                    key={repo._id}
                    className="repo-card"
                    onClick={() => navigate(`/repo/${repo._id}`)}
                  >
                    <div className="repo-card-info">
                      <div className="repo-card-title">
                        <h3>{repo.name}</h3>
                        <span className="repo-badge">
                          {repo.visibility ? "Public" : "Private"}
                        </span>
                      </div>
                      <p className="repo-desc">
                        {repo.description || "No description provided."}
                      </p>
                      <div className="repo-meta">
                        <span>★ {repo.starCount || 0} stars</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="sidebar-panel">
              <h3 style={{ marginTop: 0 }}>Account Settings</h3>
              {updateMsg && (
                <div
                  style={{
                    color: updateMsg.includes("successfully")
                      ? "var(--accent-success)"
                      : "#f85149",
                    marginBottom: "1rem",
                  }}
                >
                  {updateMsg}
                </div>
              )}
              <form
                onSubmit={handleUpdateProfile}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div className="auth-form-group">
                  <label>Email address</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>

                <div className="auth-form-group">
                  <label>New Password (optional)</label>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Leave blank to keep unchanged"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-btn"
                  style={{ width: "auto" }}
                >
                  Save changes
                </button>
              </form>

              <div className="danger-zone-card">
                <h4>Danger Zone</h4>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    marginBottom: "1rem",
                  }}
                >
                  Sign out or manage active sessions.
                </p>
                <button className="btn-danger" onClick={handleLogout}>
                  Sign out of all sessions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
