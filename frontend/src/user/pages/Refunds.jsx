import React from 'react';
import '../styles/Policy.css';

const Refunds = () => {
  return (
    <div className="policy-page animate-fade-in">
      <div className="policy-header section">
        <h1>Cancellation & Refund</h1>
        <p>Customer Satisfaction & Returns</p>
      </div>

      <div className="policy-content container">
        <div className="policy-card glass">
          <div className="policy-section">
            <h2>Important Note</h2>
            <p>If a customer refuses to accept the product without any valid reason, and the order is returned to origin (RTO) due to their actions, a deduction of INR 150 may be applied to the refund amount.</p>
          </div>

          <div className="policy-section">
            <h2>Refunds & Returns Policy</h2>
            <p>Cosmetics once sold cannot be returned.</p>
            <p>You may request a refund within three days of receiving the product. However, if the product's seal is broken, it will not be eligible for return, and the three-day period will no longer apply.</p>
            <p>A valid reason is required to process a refund, and it cannot be based solely on the user's preference.</p>
          </div>

          <div className="policy-section">
            <h2>Late or Missing Refunds</h2>
            <p>If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted.</p>
            <p>Next contact your bank. There is often some processing time before a refund is posted. If you’ve done all of this and you still have not received your refund yet, please contact us at <strong>hello@luminaskincare.com</strong></p>
          </div>

          <div className="policy-section">
            <h2>Sale Items</h2>
            <p>Only regular-priced items may be refunded, unfortunately, sale items cannot be refunded.</p>
          </div>

          <div className="policy-section">
            <h2>Exchanges (If Applicable)</h2>
            <p>We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <strong>hello@luminaskincare.com</strong> and send your item to our office at:</p>
            <p><strong>123 Aesthetic Avenue, New York, NY 10012</strong></p>
          </div>

          <div className="policy-section">
            <h2>Shipping</h2>
            <p>We provide shipping with third-party courier partners. Shipping time may vary depending on location and situation from 3 days to up to 15 days.</p>
            <p>If you received damaged products please email the pictures of products on <strong>hello@luminaskincare.com</strong>.</p>
            <p>The products will be called back and returned to the manufacturer which will be eventually replaced by manufacturer. This process may take upto 30 days to complete.</p>
            <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refunds;
