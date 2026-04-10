import React from 'react';
import '../styles/Policy.css';

const Shipping = () => {
  return (
    <div className="policy-page animate-fade-in">
      <div className="policy-header section">
        <h1>Shipping & Delivery</h1>
        <p>Your Order's Journey</p>
      </div>

      <div className="policy-content container">
        <div className="policy-card glass">
          <div className="policy-section">
            <h2>Shipping Partners</h2>
            <p>We provide shipping with third-party courier partners. Shipping time may vary depending on location and situation from 3 days to up to 15 days.</p>
          </div>

          <div className="policy-section">
            <h2>Damaged Products</h2>
            <p>If you received damaged products please email the pictures of products on <strong>hello@luminaskincare.com</strong>.</p>
            <p>The products will be called back and returned to the manufacturer which will be eventually replaced by manufacturer. This process may take upto 30 days to complete.</p>
          </div>

          <div className="policy-section">
            <h2>Returns</h2>
            <p>To return your product, you should ship your product to our flagship location at:</p>
            <p><strong>123 Aesthetic Avenue, New York, NY 10012</strong></p>
            <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
          </div>

          <div className="policy-section">
            <h2>Delivery Timeframes</h2>
            <p>Depending on where you live, the time it may take for your exchanged product to reach you may vary. We strive to process all orders within 24-48 hours of placement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
