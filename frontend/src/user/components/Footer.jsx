import { Link, useNavigate } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaTwitter } from 'react-icons/fa6';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand animate-fade-in">
          <h2>LUMINA</h2>
          <p>Bringing nature and science together for your best skin. Cruelty-free, vegan, and dermatologist tested formulas.</p>
          <div className="footer-socials">
            <a href="#" className="social-icon"><FaInstagram size={18} /></a>
            <a href="#" className="social-icon"><FaFacebookF size={18} /></a>
            <a href="#" className="social-icon"><FaTwitter size={18} /></a>
          </div>
        </div>

        <div className="footer-links animate-fade-in">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Shop All</Link></li>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-links animate-fade-in">
          <h3>Support</h3>
          <ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/refund-policy">Refund & Returns</Link></li>
            <li><Link to="/shipping-policy">Shipping Info</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter animate-fade-in">
          <h3>Stay Updated</h3>
          <p className="small" style={{ marginBottom: '15px' }}>Subscribe to get skincare tips and 10% off your next order.</p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); navigate('/contact'); }}>
            <input type="email" placeholder="Your email address" required />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="container footer-bottom">
        <div className="footer-copy">
          &copy; {currentYear} Lumina Skincare. All rights reserved.
        </div>
        <div className="footer-legal-links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/contact">Help</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
