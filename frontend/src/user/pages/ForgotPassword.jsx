import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "../styles/verify.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  
  const { loading, handleForgotPassword, handleVerifyForgotOtp, handleResendOtp } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const data = await handleForgotPassword(email);
      setToken(data.resetToken);
      toast.success(data.message || "OTP sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const data = await handleVerifyForgotOtp(otp, token);
      toast.success(data.message || "OTP verified!");
      navigate("/reset-password", { state: { passResetToken: data.passResetToken } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="custom-verify-page custom-verify-fade-in">
      <div className="custom-verify-box">
        <h2 className="custom-verify-title">
          {step === 1 ? "Forgot Password" : "Enter OTP"}
        </h2>
        <p className="custom-verify-subtitle">
          {step === 1 
            ? "Enter your email to receive an OTP" 
            : "Enter the code sent to your email"}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="custom-verify-form">
            <div className="custom-verify-field">
              <label className="custom-verify-label">Email Address</label>
              <input
                type="email"
                className="custom-verify-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" className="custom-verify-btn" disabled={loading}>
              {loading ? <Loader2 size={20} className="spinner-icon" /> : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="custom-verify-form">
            <div className="custom-verify-field">
              <label className="custom-verify-label">OTP</label>
              <input
                type="text"
                className="custom-verify-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6 digit OTP"
              />
            </div>
            <button type="submit" className="custom-verify-btn" disabled={loading}>
              {loading ? <Loader2 size={20} className="spinner-icon" /> : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="custom-verify-resend">
            <span>Didn't receive code? </span>
            <button 
              type="button" 
              className="custom-resend-link" 
              onClick={async () => {
                try {
                  const data = await handleResendOtp(token);
                  toast.success(data.message || "OTP resent successfully!");
                } catch (err) {
                  toast.error(err.response?.data?.message || "Failed to resend OTP");
                }
              }}
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>
        )}

        <p className="custom-verify-redirect">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
