import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Edit2, Trash2, BarChart2, X, Upload } from "lucide-react";
import adminService from "../services/adminService";
import api from "../../user/services/Axios";
import toast from "react-hot-toast";
import SkeletonTable from "../components/SkeletonTable";
import "../styles/Products.css";

// Memoized Row for performance
const ProductRow = React.memo(({ product, handleOpenModal, handleDelete }) => {
  return (
    <tr>
      <td>
        <img
          src={product.images?.[0]?.url || "/placeholder.png"}
          alt={product.name}
          className="product-table-img"
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
          loading="lazy"
        />
      </td>
      <td style={{ fontWeight: 600 }}>{product.name}</td>
      <td>₹{product.price}</td>
      <td>₹{product.costPrice || 0}</td>
      <td>{product.stock}</td>
      <td>{product.category}</td>
      <td>
        <div className="table-actions">
          <button className="action-btn edit-btn" title="Edit" onClick={() => handleOpenModal(product)}>
            <Edit2 size={16} />
          </button>
          <button className="action-btn delete-btn" title="Delete" onClick={() => handleDelete(product._id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    costPrice: "",
    stock: "",
    category: "",
    brand: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Cleanup effect for memory leaks from Object URLs
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/product/getproduct?page=${page}&limit=${limit}`);
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = useCallback((product = null) => {
    if (product) {
      setEditMode(true);
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        costPrice: product.costPrice || "",
        stock: product.stock,
        category: product.category,
        brand: product.brand,
      });
    } else {
      setEditMode(false);
      setFormData(initialFormState);
    }
    setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFiles([]);
    previews.forEach(url => URL.revokeObjectURL(url));
    setPreviews([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    previews.forEach(url => URL.revokeObjectURL(url));
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    selectedFiles.forEach((file) => {
      data.append("images", file);
    });

    try {
      if (editMode) {
        await adminService.updateProduct(selectedProduct._id, data);
        toast.success("Product updated successfully");
      } else {
        await adminService.createProduct(data);
        toast.success("Product created successfully");
      }
      fetchProducts(currentPage);
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await adminService.deleteProduct(id);
        toast.success("Product deleted successfully");
        fetchProducts(currentPage);
      } catch (err) {
        toast.error("Failed to delete product");
      }
    }
  }, [currentPage]);

  return (
    <div className="products-page">
      <div className="section-header">
        <h1>Product Management</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />Add New Product
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          {loading ? (
             <SkeletonTable rows={10} cols={7} />
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                   <ProductRow 
                        key={product._id} 
                        product={product} 
                        handleOpenModal={handleOpenModal} 
                        handleDelete={handleDelete} 
                   />
                ))}
                {!loading && products.length === 0 && (
                   <tr>
                     <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No products found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close icon-btn" onClick={handleCloseModal}><X /></button>
            <h2 style={{ marginBottom: '24px' }}>{editMode ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-input" rows="3" required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Selling Price (MRP)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost Price</label>
                  <input type="number" name="costPrice" value={formData.costPrice} onChange={handleInputChange} className="form-input" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="form-input" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="form-input" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Images</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label className="admin-btn admin-btn-secondary" style={{ cursor: 'pointer' }}>
                    <Upload size={18} /> Choose Files
                    <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {selectedFiles.length} files selected
                  </span>
                </div>
                <div className="image-preview-grid">
                  {previews.map((url, i) => (
                    <img key={i} src={url} className="image-preview" alt="Preview" />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCloseModal} style={{ marginRight: '10px' }}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editMode ? "Update Product" : "Create Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
