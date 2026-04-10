import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty container animate-fade-in">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any skincare essentials yet.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container animate-fade-in">
      <h1 className="page-title">Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-header">
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div>
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
              </div>

              <div className="cart-item-total">
                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Remove">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <div className="cart-actions">
            <Link to="/products" className="btn btn-outline cart-continue-btn">Continue Shopping</Link>
            <button className="btn btn-outline" onClick={clearCart}>Clear Cart</button>
          </div>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <hr />
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary checkout-btn">
            Proceed to Checkout <ArrowRight size={18} className="checkout-icon" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
