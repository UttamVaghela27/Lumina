import "../styles/Contact.css";
import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const { loading, handleContact } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await handleContact(formData);
      if (res.success) {
        setSubmitted(true);
        toast.success("Message sent to Admin!");
        setFormData({ fullName: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="contact-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-subtitle">We'd love to hear from you. Reach out with any questions or concerns.</p>
      </div>

      <div className="container contact-container">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <p>Whether you need help choosing the right product for your skin type, or have questions about an order, our team is here for you.</p>

          <div className="info-items">
            <div className="info-item">
              <Mail className="info-icon" />
              <div>
                <h4>Email</h4>
                <p>hello@luminaskincare.com</p>
              </div>
            </div>
            <div className="info-item">
              <Phone className="info-icon" />
              <div>
                <h4>Phone</h4>
                <p>1-800-LUMINA (1-800-586-462)</p>
                <p className="small">Mon-Fri 9am - 5pm EST</p>
              </div>
            </div>
            <div className="info-item">
              <MapPin className="info-icon" />
              <div>
                <h4>Office</h4>
                <p>123 Aesthetic Avenue<br />New York, NY 10012</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-container glass">
          {submitted ? (
            <div className="success-message">
              <h3>Thank you!</h3>
              <p>Your message has been sent successfully. We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  name="subject"
                  className="form-input"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a topic</option>
                  <option value="order">Order Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="press">Press / Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  className="form-input"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ margin: 0 }}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
