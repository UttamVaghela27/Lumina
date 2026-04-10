import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-page animate-fade-in">
      <div className="about-header section text-center">
        <h1 className="page-title">Our Story</h1>
        <p className="about-subtitle">Bringing nature and science together for your best skin.</p>
      </div>

      <div className="container about-content">
        <div className="about-grid">
          <div className="about-image glass">
            <img src="/images/product_cream.png" alt="Lumina Skincare Cream" />
          </div>
          <div className="about-text">
            <h2>The Lumina Philosophy</h2>
            <p>Founded on the belief that skincare should be simple, effective, and transparent. We started Lumina with a single mission: to cut through the noise of the beauty industry and deliver clean, potent formulas that actually work.</p>
            <p>Our ingredients are ethically sourced, 100% vegan, and stringently tested by dermatologists to ensure safety for even the most sensitive skin types.</p>
            
            <div className="stats-container">
              <div className="stat-item">
                <h3>100%</h3>
                <p>Vegan & Cruelty Free</p>
              </div>
              <div className="stat-item">
                <h3>0%</h3>
                <p>Artificial Fragrance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
