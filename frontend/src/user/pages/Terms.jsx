import React from 'react';
import '../styles/Policy.css';

const Terms = () => {
  return (
    <div className="policy-page animate-fade-in">
      <div className="policy-header section">
        <h1>Terms of Service</h1>
        <p>Last updated: April 2026</p>
      </div>

      <div className="policy-content container">
        <div className="policy-card glass">
          <div className="policy-section">
            <h2>Introduction</h2>
            <p>This is the official website of Lumina and has been developed to provide general public information. The documents and information displayed in this site are for reference purposes only.</p>
            <p>The content on the site is updated on a continual basis. While Lumina attempts to keep its web information accurate and timely, no representations, warranties or guarantees whatsoever are made as to the accuracy, adequacy, reliability, completeness, suitability or applicability of the information, text, graphics, hyperlinks, and other items contained on this server or any other server.</p>
          </div>

          <div className="policy-section">
            <h2>Intellectual Property</h2>
            <p>Unless otherwise stated, copyright and all intellectual property rights in all material presented on the site (including but not limited to text, audio, video or graphical images), trademarks and logos appearing on this site are the property of Lumina, its affiliates and associates and are protected under applicable laws. Commercial use of web materials is prohibited without the written permission of the company.</p>
          </div>

          <div className="policy-section">
            <h2>Risk Disclaimer</h2>
            <p>Any material contents downloaded or otherwise obtained through the use of the site is done at your own discretion and risk. Lumina is neither responsible nor liable for any viruses or other contamination of your system, nor for any damages, claims, delays, inaccuracies, errors or omissions arising out of your use of the site or with respect to the material contained on the site.</p>
          </div>

          <div className="policy-section">
            <h2>External Links</h2>
            <p>Some of the hyperlinks contained in this site may lead to resources outside the site including the Websites of Lumina affiliates worldwide. Information contained in any site linked from this site may not have been reviewed for accuracy or legal sufficiency. Lumina is not responsible for the content of any such external hyperlinks. References to any external links should not be construed as an endorsement of the links or their content.</p>
          </div>

          <div className="policy-section">
            <h2>User Feedback</h2>
            <p>Should any viewer of this Website respond with information including feedback data such as questions, comments, suggestions, or the like regarding the content of any material on this Website, Lumina shall deal with the same in the manner it deems fit.</p>
          </div>

          <div className="policy-section">
            <h2>Account Security & RTO</h2>
            <p>If an RTO (Return to Origin) is generated without a valid reason and the customer no longer requires the product, and if this behavior is repeated by the same customer—even if orders are placed using different email IDs—Lumina reserves the right to block the customer ID associated with such activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
