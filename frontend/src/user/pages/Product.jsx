import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Filter, Search } from 'lucide-react';
import '../styles/Product.css';
import { useCart } from '../hooks/useCart';

const Products = () => {
  const { products, loading, fetchProducts } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchProducts().catch((err) => console.error("Error fetching products:", err));
  }, []);

  const categories = ['All', ...new Set(products ? products.map(p => p.category) : [])];

  const filteredProducts = products ? products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesSearch && matchesCategory;
  }) : [];

  if (loading && (!products || products.length === 0)) {
    return (
      <div className="admin-loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Shop Collection</h1>
        <p className="page-subtitle">Pure ingredients, profound results. Filter to find your match.</p>
      </div>

      <div className="container">
        <div className="shop-controls">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="category-filter">
            <Filter size={20} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-control"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>No products found matching your criteria.</p>
            <button className="btn btn-outline" onClick={() => { setSearchTerm(''); setCategory('All'); }}>Clear Filters</button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
