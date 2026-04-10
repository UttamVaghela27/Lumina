import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';
import '../styles/SingleProduct.css';

const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState(null);

  const { fetchSingleProduct, products, loading, addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetchSingleProduct(id);
        if (response.sucess || response.success) { // Handle potential typo in backend response
          setProduct(response.product);
        }
      } catch (err) {
        toast.error("Failed to load product details");
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="loader"></div>
        <p>Loading Product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary shop-back-btn">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error('Please login or register to add items to your cart.');
      navigate('/login');
      return;
    }

    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="single-product-page animate-fade-in container">
      <button className="back-btn" onClick={() => navigate('/products')}>
        <ArrowLeft size={18} /> Back to Shop
      </button>

      <div className="product-details-grid">
        <div className="product-image-large">
          <img
            src={product.images && product.images.length > 0 ? product.images[0].url : ''}
            alt={product.name}
          />
        </div>

        <div className="product-info-column">
          <div className="product-badge">{product.category}</div>
          <h1 className="product-title">{product.name}</h1>

          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < 4 ? "var(--primary-color)" : "none"} color="var(--primary-color)" />
              ))}
            </div>
            <span>4.8 (120 reviews)</span>
          </div>

          <p className="product-price-large">₹{product.price.toFixed(2)}</p>

          <div className="product-description">
            <p>{product.description}</p>
          </div>

          <div className="product-bullets">
            <h4>Highlights</h4>
            <ul>
              <li>✓ Premium Quality Ingredients</li>
              <li>✓ Dermatologically Tested</li>
              <li>✓ Fast Action Formula</li>
              <li>✓ Brand: {product.brand || 'Lumina'}</li>
            </ul>
          </div>

          <div className="add-to-cart-section">
            <div className="quantity-selector">
              <button onClick={decrement}><Minus size={16} /></button>
              <span>{quantity}</span>
              <button onClick={increment}><Plus size={16} /></button>
            </div>

            <button
              className={`btn ${added ? 'btn-secondary' : 'btn-primary'} add-btn`}
              onClick={handleAddToCart}
            >
              {added ? <><Check size={20} className="check-icon" /> Added to Cart</> : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
