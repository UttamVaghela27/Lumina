import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight, Home } from "lucide-react";
import "../styles/Checkout.css"; // Reuse some styles

const OrderSuccess = () => {
    const location = useLocation();
    const order = location.state?.order;

    if (!order) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="checkout-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="checkout-section" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ display: 'inline-flex', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', marginBottom: '25px' }}>
                    <CheckCircle size={60} color="#10b981" />
                </div>
                
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '15px' }}>
                    Order Confirmed!
                </h1>
                
                <p style={{ color: '#6B5D5A', fontSize: '1.1rem', marginBottom: '30px', lineHeight: '1.6' }}>
                    Thank you for your purchase. Your order <strong>#{order._id.substring(18)}</strong> has been placed successfully and is being processed.
                </p>

                <div style={{ background: '#FAFAFA', borderRadius: '12px', padding: '20px', marginBottom: '40px', border: '1px solid #E8E1DE', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#6B5D5A', marginBottom: '15px' }}>Order Details</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Status</span>
                        <span style={{ fontWeight: 700, color: '#3b82f6' }}>{order.orderStatus}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>Payment Method</span>
                        <span style={{ fontWeight: 700 }}>{order.paymentMethod}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E8E1DE', paddingTop: '10px', marginTop: '10px' }}>
                        <span style={{ fontWeight: 700 }}>Total Paid</span>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <Link to="/profile" className="place-order-btn" style={{ textDecoration: 'none', margin: 0, flex: 1 }}>
                        <ShoppingBag size={20} />
                        View My Orders
                    </Link>
                    <Link to="/" className="place-order-btn" style={{ background: 'transparent', border: '2px solid #2F2421', color: '#2F2421', textDecoration: 'none', margin: 0, flex: 1 }}>
                        <Home size={20} />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
