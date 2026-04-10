import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const OrderHistory = ({ orders, getStatusColor, setSelectedOrder, handleDownloadInvoice }) => {
  if (orders.length === 0) {
    return (
      <div className="empty-orders">
        <ShoppingBag size={40} />
        <p>You haven't placed any orders yet.</p>
        <Link to="/products" className="btn btn-outline profile-mt-15">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="orders-list">
      {orders.map((order) => (
        <div key={order._id} className="order-card order-card-styled">
          <div>
            <div className="order-card-id">
              Order #{order._id.substring(18)}
            </div>
            <div className="order-card-date-status">
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span className="order-card-status" style={{ color: getStatusColor(order.orderStatus) }}>● {order.orderStatus}</span>
            </div>
          </div>
          <div className="order-card-actions">
            <div className="order-card-price-details">
              <div className="order-card-total">₹{order.totalAmount.toFixed(2)}</div>
              <div className="order-card-qty">{order.items.length} items</div>
            </div>
            <button
              className="btn btn-outline order-view-btn"
              onClick={() => setSelectedOrder(order)}
              title="View Details"
            >
              <Eye size={18} />
            </button>
            <button
              className="btn btn-outline order-view-btn btn-pdf-outline"
              onClick={() => handleDownloadInvoice(order._id)}
              title="Download Invoice"
            >
              <FaFilePdf size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
