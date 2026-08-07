import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../authContext";
import "./auth.css";

const RESEND_COOLDOWN = 60; // seconds — matches backend

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Email is passed via route state from the Signup page
  const email = location.state?.email;

  // Redirect to signup if email is missing (direct visit without signing up)
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.post("/verify-otp", {
        email,
        otp: String(otp), // always send as string to preserve leading zeros
      });

      // OTP verified — now store the JWT and log the user in
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      setCurrentUser(res.data.userId);
      setLoading(false);

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Verification failed. Please try again."
      );
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError("");
    setSuccess("");

    try {
      setResending(true);
      await axiosClient.post("/resend-otp", { email });
      setSuccess("A new code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN);
      setOtp("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to resend OTP. Try again later."
      );
    } finally {
      setResending(false);
    }
  };

  if (!email) return null; // guard while redirecting

  return (
    <div className="auth-wrapper">
      <div className="auth-logo-container">
        <svg
          className="auth-logo"
          viewBox="0 0 16 16"
          version="1.1"
          fill="currentColor"
        >
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Verify your email</h2>
        </div>

        <p className="verify-subtitle">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        {error && (
          <div className="auth-error-banner" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="auth-success-banner" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="auth-form-group">
            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              className="auth-input otp-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                // Only allow digits
                const val = e.target.value.replace(/\D/g, "");
                setOtp(val);
              }}
              placeholder="000000"
              required
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="verify-resend">
          {cooldown > 0 ? (
            <span className="resend-cooldown">
              Resend code in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>
      </div>

      <div className="auth-footer">
        Wrong email? <Link to="/signup">Go back to sign up</Link>
      </div>
    </div>
  );
};

export default VerifyOtp;
