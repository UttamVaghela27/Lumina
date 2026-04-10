import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-content animate-fade-in">
        <h1 className="hero-title">Discover Your Natural Glow</h1>
        <p className="hero-subtitle">
          Clean, science-backed skincare formulations designed to nourish, protect, and enhance your skin's innate beauty.
        </p>
        <div className="hero-btns">
          <Link to="/products" className="btn btn-primary">
            Shop Collection <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Link>
          <Link to="/about" className="btn btn-outline" style={{ background: 'transparent' }}>
            Our Story
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
