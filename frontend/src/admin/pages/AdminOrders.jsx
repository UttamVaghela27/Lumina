import React, { useState, useEffect } from "react";
import adminService from "../services/adminService";
import toast from "react-hot-toast";
import { Search, Filter, Eye, Package, FileText } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import { downloadInvoiceApi } from "../../user/services/orderApi";
import "../styles/Orders.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0, delivered: 0 });
  const [selectedProductId, setSelectedProductId] = useState("all");
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchOrders(currentPage);
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
        const { products } = await adminService.getAllProductsAnalytics();
        setAllProducts(products);
    } catch (err) {
        console.error("Failed to fetch products for filter", err);
    }
  };

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const { orders, total, pages, counts } = await adminService.getAllOrders({ page, limit });
      setOrders(orders);
      setTotalPages(pages || 1);
      
      setStats({
          total: total || 0,
          pending: counts?.pending || 0,
          confirmed: counts?.confirmed || 0,
          cancelled: counts?.cancelled || 0,
          delivered: counts?.delivered || 0
      });
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await downloadInvoiceApi(orderId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId.substring(0,8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice downloaded");
    } catch (err) {
      toast.error("Failed to download invoice");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, { orderStatus: newStatus });
      toast.success("Order status updated");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, { paymentStatus: newPaymentStatus });
      toast.success("Payment status updated");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update payment status");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Delivered": return "badge-success";
      case "Pending": return "badge-info";
      case "Confirmed": return "badge-warning";
      case "Shipped": return "badge-info";
      case "Cancelled": return "badge-danger";
      case "Returned": return "badge-warning";
      default: return "";
    }
  };

  const statuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Returned"];

  return (
    <div className="orders-page">
      <div className="section-header">
        <h1>Order Management</h1>
        <div className="section-header-actions">
          <div className="filter-group">
            <Package size={18} className="filter-icon" />
            <select 
              value={selectedProductId} 
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="form-input filter-select"
            >
              <option value="all">All Products</option>
              {allProducts.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-orders">
          <div className="metric-card">
              <div className="metric-info"><h3>Total Orders</h3><div className="metric-value">{stats.total}</div></div>
          </div>
          <div className="metric-card">
              <div className="metric-info"><h3>Pending</h3><div className="metric-value">{stats.pending}</div></div>
          </div>
          <div className="metric-card">
              <div className="metric-info"><h3>Confirmed</h3><div className="metric-value">{stats.confirmed}</div></div>
          </div>
          <div className="metric-card">
              <div className="metric-info"><h3>Cancelled</h3><div className="metric-value">{stats.cancelled}</div></div>
          </div>
          <div className="metric-card">
              <div className="metric-info"><h3>Delivered</h3><div className="metric-value">{stats.delivered}</div></div>
          </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total Price</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders
                .filter(order => 
                  selectedProductId === "all" || 
                  order.items.some(item => (item.productId?._id || item.productId) === selectedProductId)
                )
                .map((order) => (
                <tr key={order._id}>
                  <td className="order-id-cell">#{order._id.substring(18)}</td>
                  <td>
                    <div className="user-name">{order.userId?.firstname} {order.userId?.lastname}</div>
                    <div className="user-email">{order.userId?.email}</div>
                    {order.returnRequest?.isRequested && (
                       <div className="return-badge-container">
                          <span className="performance-badge badge-worst return-badge-text">
                            RETURN REQUESTED
                          </span>
                          <div className="return-reason-sub">
                            Reason: {order.returnRequest.reason}
                          </div>
                       </div>
                    )}
                  </td>
                  <td className="admin-items-col">
                    {order.items.map((item, i) => (
                        <div key={i} className="item-list-row">
                          • {item.name.substring(0, 30)}...
                        </div>
                    ))}
                  </td>
                  <td className="admin-price-col">
                    {order.items.map((item, i) => (
                        <div key={i} className="item-list-row">
                          ₹{item.price}
                        </div>
                    ))}
                  </td>
                  <td className="admin-qty-col">
                    {order.items.map((item, i) => (
                        <div key={i} className="item-list-row">
                           {item.quantity}
                        </div>
                    ))}
                  </td>
                  <td className="order-id-cell">₹{order.totalAmount}</td>
                  <td>
                    <select 
                        value={order.paymentStatus || 'pending'}
                        onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                        className={`status-select payment-status-select payment-status-${order.paymentStatus || 'pending'}`}
                    >
                        <option value="pending">PENDING</option>
                        <option value="paid">PAID</option>
                        <option value="failed">FAILED</option>
                    </select>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select 
                      className={`status-select ${getStatusBadgeClass(order.orderStatus)}`}
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDownloadInvoice(order._id)}
                        className="invoice-download-btn"
                        title="Download Invoice"
                      >
                        <FaFilePdf />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
};

export default AdminOrders;
