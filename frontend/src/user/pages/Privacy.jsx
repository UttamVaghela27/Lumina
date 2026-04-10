import React from 'react';
import '../styles/Policy.css';

const Privacy = () => {
  return (
    <div className="policy-page animate-fade-in">
      <div className="policy-header section">
        <h1>Privacy Policy</h1>
        <p>Transparency & Protection</p>
      </div>

      <div className="policy-content container">
        <div className="policy-card glass">
          <div className="policy-section">
            <h2>Personal Information</h2>
            <p>What Do We Do With Your Information?</p>
            <p>When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as your name, address and email address. When you browse our store, we also automatically receive your computer’s internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system.</p>
            <p>Email marketing (if applicable): With your permission, we may send you emails about our store, new products and other updates.</p>
          </div>

          <div className="policy-section">
            <h2>Consent</h2>
            <p><strong>How do you get my consent?</strong></p>
            <p>When you provide us with personal information to complete a transaction, verify your credit card, place an order, arrange for a delivery or return a purchase, we imply that you consent to our collecting it and using it for that specific reason only.</p>
            <p><strong>How do I withdraw my consent?</strong></p>
            <p>If after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued collection, use or disclosure of your information, at anytime, by contacting us at <strong>hello@luminaskincare.com</strong> or mailing us at:</p>
            <p><strong>123 Aesthetic Avenue, New York, NY 10012</strong></p>
          </div>

          <div className="policy-section">
            <h2>Payment Security</h2>
            <p>We use Razorpay for processing payments. We/Razorpay do not store your card data on their servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. Your purchase transaction data is only used as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is not saved.</p>
            <p>Our payment gateway adheres to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express and Discover.</p>
          </div>

          <div className="policy-section">
            <h2>Third-Party Services</h2>
            <p>In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us. Certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies in respect to the information we are required to provide to them for your purchase-related transactions.</p>
            <p>Once you leave our store’s website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy or our website’s Terms of Service.</p>
          </div>

          <div className="policy-section">
            <h2>Cookies & Security</h2>
            <p>We use cookies to maintain session of your user. It is not used to personally identify you on other websites. To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.</p>
          </div>

          <div className="policy-section">
            <h2>Age of Consent</h2>
            <p>By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>
          </div>

          <div className="policy-section">
            <h2>Changes To This Privacy Policy</h2>
            <p>We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
