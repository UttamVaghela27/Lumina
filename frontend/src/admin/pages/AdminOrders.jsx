import React, { useState, useEffect, useMemo, useCallback } from "react";
import adminService from "../services/adminService";
import toast from "react-hot-toast";
import { Search, Filter, Eye, Package, FileText } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import { downloadInvoiceApi } from "../../user/services/orderApi";
import SkeletonTable from "../components/SkeletonTable";
import "../styles/Orders.css";

// Memoized Table Row for performance
const OrderRow = React.memo(({ order, handlePaymentStatusChange, handleStatusChange, handleDownloadInvoice, getStatusBadgeClass, statuses }) => {
  return (
    <tr>
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
  );
});

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
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchOrders(currentPage, selectedProductId);
  }, [currentPage, selectedProductId]);

  const fetchProducts = async () => {
    try {
      const { products } = await adminService.getAllProductsAnalytics();
      setAllProducts(products);
    } catch (err) {
      console.error("Failed to fetch products for filter", err);
    }
  };

  const fetchOrders = async (page = 1, productId = "all") => {
    setLoading(true);
    try {
      const { orders, total, pages, counts } = await adminService.getAllOrders({ 
        page, 
        limit, 
        productId: productId === "all" ? undefined : productId 
      });
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

  const handleDownloadInvoice = useCallback(async (orderId) => {
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
  }, []);

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, { orderStatus: newStatus });
      toast.success("Order status updated");
      fetchOrders(currentPage, selectedProductId);
    } catch (err) {
      toast.error("Failed to update status");
    }
  }, [currentPage, selectedProductId]);

  const handlePaymentStatusChange = useCallback(async (orderId, newPaymentStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, { paymentStatus: newPaymentStatus });
      toast.success("Payment status updated");
      fetchOrders(currentPage, selectedProductId);
    } catch (err) {
      toast.error("Failed to update payment status");
    }
  }, [currentPage, selectedProductId]);

  const getStatusBadgeClass = useCallback((status) => {
    switch (status) {
      case "Delivered": return "badge-success";
      case "Pending": return "badge-info";
      case "Confirmed": return "badge-warning";
      case "Shipped": return "badge-info";
      case "Cancelled": return "badge-danger";
      case "Returned": return "badge-warning";
      default: return "";
    }
  }, []);

  const statuses = useMemo(() => ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Returned"], []);

  return (
    <div className="orders-page">
      <div className="section-header">
        <h1>Order Management</h1>
        <div className="section-header-actions">
          <div className="filter-group">
            <Package size={18} className="filter-icon" />
            <select 
              value={selectedProductId} 
              onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on filter change
              }}
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
        {["Total Orders", "Pending", "Confirmed", "Cancelled", "Delivered"].map((label, idx) => (
          <div className="metric-card" key={idx}>
            <div className="metric-info">
              <h3>{label}</h3>
              <div className="metric-value">
                  {loading ? <div className="skeleton skeleton-text" style={{width: '40px'}}></div> : stats[label.toLowerCase().replace(" ", "")] || stats.total}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          {loading ? (
            <SkeletonTable rows={10} cols={10} />
          ) : (
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
                {orders.map((order) => (
                   <OrderRow 
                        key={order._id}
                        order={order}
                        handlePaymentStatusChange={handlePaymentStatusChange}
                        handleStatusChange={handleStatusChange}
                        handleDownloadInvoice={handleDownloadInvoice}
                        getStatusBadgeClass={getStatusBadgeClass}
                        statuses={statuses}
                   />
                ))}
                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>No orders found matching the criteria.</td>
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
    </div>
  );
};

export default AdminOrders;
