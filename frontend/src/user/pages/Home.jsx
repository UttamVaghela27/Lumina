import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import { Sparkles, Leaf, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCart } from '../hooks/useCart';
import '../styles/Home.css';

const Home = () => {
  const { products, fetchProducts } = useCart();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  const featuredProducts = products.slice(0, 3);

  return (
    <div className="home-page animate-fade-in">
      <Hero />

      <section className="section features-section">
        <div className="container features-grid">
          <div className="feature-item">
            <div className="feature-icon"><Leaf size={32} /></div>
            <h3>100% Vegan Origins</h3>
            <p>Our formulas harness the power of nature without animal testing or animal-derived ingredients.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Sparkles size={32} /></div>
            <h3>Clinically Proven</h3>
            <p>Dermatologist tested and verified to deliver visible results for all skin types and tones.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Shield size={32} /></div>
            <h3>Clean & Safe</h3>
            <p>Free from parabens, sulfates, phthalates, and synthetic artificial fragrances.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
          <div className="product-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section banner-section">
        <div className="banner-content glass">
          <h2>Elevate your routine</h2>
          <p>Discover the ritual that brings out your best skin. Build your custom regimen today.</p>
          <Link to="/products" className="btn btn-primary">Take the Quiz</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
