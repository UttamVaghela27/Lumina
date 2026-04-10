import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { user, loading, handleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await handleLogin(email, password);
      toast.success("Login successful");
      if (loggedInUser?.role?.toLowerCase() === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="custom-login-page custom-fade-in">
      <div className="custom-login-box">
        <h2 className="custom-login-title">Welcome Back</h2>
        <p className="custom-login-subtitle">
          Sign in to access your skincare journey
        </p>

        <form onSubmit={handleSubmit} className="custom-login-form">
          <div className="custom-field">
            <label className="custom-label">Email Address</label>
            <input
              type="email"
              className="custom-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="custom-field">
            <label className="custom-label">Password</label>
            <div className="custom-pass-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="custom-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="custom-pass-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="custom-options">
            <label className="custom-remember">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="custom-forgot">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="custom-submit-btn" disabled={loading}>
            {loading ? <Loader2 size={20} className="spinner-icon" /> : "Sign In"}
          </button>
        </form>

        <p className="custom-redirect">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
