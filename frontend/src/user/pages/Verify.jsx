import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/verify.css";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const Verify = () => {
  const { loading, handleVerify, handleResendOtp } = useAuth();
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      const token = localStorage.getItem("verifyToken");

      await handleVerify(otp, token);

      localStorage.removeItem("verifyToken");

      toast.success("Verification successful! You can now login.");

      navigate("/login");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="custom-verify-page custom-verify-fade-in">
      <div className="custom-verify-box">
        <h2 className="custom-verify-title">Verify Account</h2>
        <p className="custom-verify-subtitle">
          Please enter the OTP sent to your email
        </p>

        <form onSubmit={handleSubmit} className="custom-verify-form">
          <div className="custom-verify-field">
            <label className="custom-verify-label">Enter OTP</label>
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
            {loading ? <Loader2 size={20} className="spinner-icon" /> : "Verify"}
          </button>
        </form>

        <div className="custom-verify-resend">
          <span>Didn't receive code? </span>
          <button
            type="button"
            className="custom-resend-link"
            onClick={async () => {
              try {
                const token = localStorage.getItem("verifyToken");
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

        <p className="custom-verify-redirect">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Verify;
