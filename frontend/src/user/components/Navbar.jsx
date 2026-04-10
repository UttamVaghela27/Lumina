import "./navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { ShoppingCart, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, handleLogOut } = useAuth();
  const { cartItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await handleLogOut();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-container">
        <Link to="/" className="logo">
          Lumina.
        </Link>

        <div className={`nav-links ${mobileOpen ? "mobile-open" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`nav-link ${location.pathname.includes("/product") ? "active" : ""}`}
          >
            Shop
          </Link>
          <Link
            to="/about"
            className={`nav-link ${location.pathname === "/about" ? "active" : ""}`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}
          >
            Contact
          </Link>
        </div>

        <div className="nav-icons">
          {user ? (
            <>
              <Link to="/profile" className="icon-btn" aria-label="Profile">
                <User size={22} />
              </Link>
              <Link to="/cart" className="icon-btn cart-icon" aria-label="Cart">
                <ShoppingCart size={22} />
                {cartItems.length > 0 && (
                    <span className="cart-count">{cartItems.length}</span>
                )}
              </Link>

              <button onClick={onLogout} className="btn btn-primary nav-btn">
                Logout
              </button>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link auth-login-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary nav-btn">
                Sign Up
              </Link>
            </div>
          )}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
