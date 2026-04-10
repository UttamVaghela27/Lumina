import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const { user, loading, handleRegister } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { firstName, lastName, email, password } = formData;

      const res = await handleRegister(firstName, lastName, email, password);

      localStorage.setItem("verifyToken", res.verifyToken);
      toast.success("Registration successful");
      navigate("/verify");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="custom-register-page custom-fade-in">
      <div className="custom-register-box">
        <h2 className="custom-register-title">Join Lumina</h2>
        <p className="custom-register-subtitle">
          Create an account for exclusive access
        </p>

        <form onSubmit={handleSubmit} className="custom-register-form">
          <div className="custom-row">
            <div className="custom-field custom-col">
              <label className="custom-label">First Name</label>
              <input
                type="text"
                name="firstName"
                className="custom-input"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="custom-field custom-col">
              <label className="custom-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="custom-input"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="custom-field">
            <label className="custom-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="custom-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="custom-field">
            <label className="custom-label">Password</label>
            <div className="custom-pass-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="custom-input"
                value={formData.password}
                onChange={handleChange}
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

          <button type="submit" className="custom-submit-btn" disabled={loading}>
            {loading ? <Loader2 size={20} className="spinner-icon" /> : "Create Account"}
          </button>
        </form>

        <p className="custom-redirect">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
