import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import "./ProductCard.css";
import { useCart } from '../hooks/useCart';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");
        if (!token) {
            toast.error('Please login or register to add items to your cart.');
            navigate('/login');
            return;
        }
        addToCart(product);
    };

    return (
        <div className="product-card">
            <Link to={`/product/${product._id}`} className="product-card-link">
                <div className="product-image-container">
                    <img
                        src={product.images && product.images.length > 0 ? product.images[0].url : ''}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                    />
                    <div className="product-actions">
                        <button className="icon-action-btn" onClick={handleAddToCart} title="Add to Cart">
                            <ShoppingBag size={20} />
                        </button>
                        <div className="icon-action-btn" title="View Details">
                            <Eye size={20} />
                        </div>
                    </div>
                </div>
                <div className="product-info">
                    <p className="product-category">{product.category}</p>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">₹{product.price.toFixed(2)}</p>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
