import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "../styles/verify.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const { loading, handleResetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const passResetToken = location.state?.passResetToken;

  useEffect(() => {
    if (!passResetToken) {
      toast.error("Unauthorized access. Please verify OTP first.");
      navigate("/login");
    }
  }, [passResetToken, navigate]);

  const onResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    try {
      const data = await handleResetPassword(passResetToken, newPassword);
      toast.success(data.message || "Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  };

  if (!passResetToken) return null;

  return (
    <div className="custom-verify-page custom-verify-fade-in">
      <div className="custom-verify-box">
        <h2 className="custom-verify-title">Reset Password</h2>
        <p className="custom-verify-subtitle">
          Enter your new password below
        </p>

        <form onSubmit={onResetPassword} className="custom-verify-form">
          <div className="custom-verify-field">
            <label className="custom-verify-label">New Password</label>
            <input
              type="password"
              className="custom-verify-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="custom-verify-field">
            <label className="custom-verify-label">Confirm Password</label>
            <input
              type="password"
              className="custom-verify-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="custom-verify-btn" disabled={loading}>
            {loading ? <Loader2 size={20} className="spinner-icon" /> : "Reset Password"}
          </button>
        </form>

        <p className="custom-verify-redirect">
          <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
