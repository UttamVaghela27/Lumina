import React from 'react';
import { Clock, Package, ArrowLeft, XCircle } from 'lucide-react';
import { FaFilePdf } from 'react-icons/fa';

const OrderDetail = ({ 
  order, 
  getStatusColor, 
  handleDownloadInvoice, 
  handleCancelOrder, 
  isReturnable, 
  showReturnInput, 
  setShowReturnInput, 
  returnReason, 
  setReturnReason, 
  handleReturnRequest 
}) => {
  return (
    <div className="order-detail-view">
      <div className="order-meta-info order-meta-grid">
        <div>
          <span className="order-meta-label">Order ID</span>
          <span className="order-meta-value">#{order._id.substring(18)}</span>
        </div>
        <div>
          <span className="order-meta-label">Date</span>
          <span className="order-meta-value">{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <div>
          <span className="order-meta-value order-status-badge" style={{ color: getStatusColor(order.orderStatus) }}>
            <Clock size={14} /> {order.orderStatus}
          </span>
        </div>
        <div>
          <span className="order-meta-label">Total Paid</span>
          <span className="order-meta-value order-meta-value-bold">₹{order.totalAmount.toFixed(2)}</span>
        </div>
        <div className="invoice-btn-container">
           <button 
              className="btn btn-outline invoice-btn-premium" 
              onClick={() => handleDownloadInvoice(order._id)}
           >
              <FaFilePdf size={16} /> Download Invoice
           </button>
        </div>
      </div>

      <div className="order-items-list order-items-mb">
        <h3 className="order-items-title">Items</h3>
        {order.items.map((item, index) => (
          <div key={index} className="order-item-box">
            <div className="order-item-info">
              <div className="order-item-img-box">
                <Package size={20} color="#E5B7B7" />
              </div>
              <div>
                <div className="order-item-name">{item.name}</div>
                <div className="order-item-qty">₹{item.price} x {item.quantity}</div>
              </div>
            </div>
            <div className="order-item-total">₹{(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {(order.orderStatus === "Pending" || order.orderStatus === "Confirmed") && (
        <button
          className="btn btn-cancel-order"
          onClick={() => handleCancelOrder(order._id)}
        >
          <XCircle size={18} /> Cancel Order
        </button>
      )}

      {isReturnable(order) && !showReturnInput && (
         <button
         className="btn btn-outline profile-mt-15 btn-pdf-outline"
         onClick={() => setShowReturnInput(true)}
       >
         <ArrowLeft size={16} /> Request Return (3 Days Policy)
       </button>
      )}

      {showReturnInput && (
        <div className="profile-mt-15 animate-fade-in return-request-box">
           <label className="form-label">Reason for Return</label>
           <textarea 
              className="form-control" 
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Please tell us why you want to return this product..."
              rows="3"
           />
           <div className="return-actions">
              <button className="btn btn-primary" onClick={() => handleReturnRequest(order._id)}>Submit Request</button>
              <button className="btn btn-outline" onClick={() => setShowReturnInput(false)}>Cancel</button>
           </div>
        </div>
      )}

      {order.returnRequest?.isRequested && (
        <div className="profile-mt-15 return-status-alert">
          <p className="return-status-text">
            Return Requested Status: <span className="return-status-label">{order.returnRequest.status}</span>
          </p>
          <p className="return-reason-text">
            Reason: {order.returnRequest.reason}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
