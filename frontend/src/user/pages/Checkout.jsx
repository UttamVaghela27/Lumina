import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useOrder } from "../hooks/useOrder";
import {
    MapPin,
    CreditCard,
    ShoppingBag,
    Truck,
    ChevronRight,
    ArrowLeft,
    Loader2,
    CheckCircle2
} from "lucide-react";
import "../styles/Checkout.css";

const Checkout = () => {
    const { cartItems, cartTotal } = useContext(CartContext);
    const { placeOrder, verifyPayment, loading } = useOrder();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState({
        fullName: "",
        address: "",
        city: "",
        postalCode: "",
        country: "India",
        phone: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);

    useEffect(() => {
        if (cartItems.length === 0 && !loading && !isOrderPlaced) {
            navigate("/cart");
        }
    }, [cartItems, navigate, loading, isOrderPlaced]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = cartTotal;
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + tax;

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsOrderPlaced(true);
        const orderData = {
            shippingAddress,
            paymentMethod
        };

        try {
            const response = await placeOrder(orderData);

            console.log("Order response:", response);

            if (response && response.success && paymentMethod === "ONLINE") {
                const res = await loadRazorpayScript();
                if (!res) {
                    alert("Razorpay SDK failed to load. Are you online?");
                    setIsOrderPlaced(false);
                    return;
                }

                if (!response.order.razorpayOrderId) {
                    console.error("Missing razorpayOrderId in order response:", response.order);
                    alert("Backend failed to return Razorpay Order ID. Check backend error logs.");
                    setIsOrderPlaced(false);
                    return;
                }

                console.log("Starting Razorpay checkout with Order ID:", response.order.razorpayOrderId);

                // Make sure to use the correct razorpay key ID
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: response.order.totalAmount * 100,
                    currency: "INR",
                    name: "Lumina",
                    description: "Order Payment",
                    order_id: response.order.razorpayOrderId,
                    handler: async function (paymentResponse) {
                        try {
                            await verifyPayment({
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                            }, response.order);
                        } catch (err) {
                            setIsOrderPlaced(false);
                        }
                    },
                    prefill: {
                        name: shippingAddress.fullName,
                        email: "test@example.com",
                        contact: shippingAddress.phone,
                    },
                    theme: {
                        color: "#2D3748",
                    },
                    modal: {
                        ondismiss: function () {
                            setIsOrderPlaced(false);
                        }
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            }
        } catch (err) {
            setIsOrderPlaced(false);
            console.error("Order submission failed:", err);
        }
    };

    if (cartItems.length === 0 && !loading) return null;

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-main">
                    <Link to="/cart" className="back-link chk-back-link">
                        <ArrowLeft size={18} />
                        Back to Cart
                    </Link>

                    <h1 className="checkout-title">Checkout</h1>

                    <form id="checkoutForm" onSubmit={handleSubmit}>
                        {/* 1. SHIPPING ADDRESS */}
                        <div className="checkout-section">
                            <h2 className="section-title">
                                <MapPin size={22} className="icon-rose" />
                                Shipping Information
                            </h2>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="form-input"
                                        placeholder="Enter your full name"
                                        value={shippingAddress.fullName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Complete Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        className="form-input"
                                        placeholder="House No, Street, Landmark"
                                        value={shippingAddress.address}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-input"
                                        placeholder="City Name"
                                        value={shippingAddress.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        className="form-input"
                                        placeholder="6 Digits Pincode"
                                        value={shippingAddress.postalCode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label className="form-label">Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        placeholder="10 Digit Phone Number"
                                        value={shippingAddress.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. PAYMENT METHOD */}
                        <div className="checkout-section">
                            <h2 className="section-title">
                                <CreditCard size={22} className="icon-rose" />
                                Payment Method
                            </h2>

                            <div className="payment-options">
                                <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={() => setPaymentMethod('COD')}
                                    />
                                    <div className="payment-details">
                                        <div className="payment-name">Cash On Delivery (COD)</div>
                                        <div className="payment-desc">Pay when your order is delivered</div>
                                    </div>
                                </label>

                                <label className={`payment-option ${paymentMethod === 'ONLINE' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="ONLINE"
                                        checked={paymentMethod === 'ONLINE'}
                                        onChange={() => setPaymentMethod('ONLINE')}
                                    />
                                    <div className="payment-details">
                                        <div className="payment-name">Online Payment</div>
                                        <div className="payment-desc">Pay securely using UPI, Card or NetBanking</div>
                                    </div>
                                    {paymentMethod === 'ONLINE' && (
                                        <div className="chk-prepaid-badge">PREPAID</div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* 3. ORDER SUMMARY */}
                <aside className="summary-card">
                    <div className="checkout-section summary-content">
                        <h2 className="section-title">
                            <ShoppingBag size={22} className="icon-rose" />
                            Order Summary
                        </h2>

                        <div className="summary-items">
                            {cartItems.map((item) => (
                                <div className="item-row" key={item.id}>
                                    <div className="item-info">
                                        <img src={item.image} alt={item.name} className="item-img" />
                                        <div className="item-text">
                                            <div className="item-name" title={item.name}>{item.name}</div>
                                            <div className="item-qty">Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="total-section">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span>Tax (GST 18%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="total-row">
                                <span>Shipping Fees</span>
                                <span className="chk-free-text">FREE</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Grand Total</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkoutForm"
                            className="place-order-btn"
                            disabled={loading || cartItems.length === 0}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="spinner" size={20} />
                                    Processing Order...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} />
                                    Complete Order
                                </>
                            )}
                        </button>

                        <p className="chk-delivery-note">
                            <Truck size={14} className="chk-delivery-icon" />
                            Delivery within 3-5 business days
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Checkout;
