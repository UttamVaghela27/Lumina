import React, { useState, useEffect } from 'react';
import { useAuth } from "../hooks/useAuth";
import { useOrder } from '../hooks/useOrder';
import '../styles/Profile.css';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { downloadInvoiceApi } from '../services/orderApi';

// Sub-pages (Refactored for Step 3)
import PersonalInfo from './profile/PersonalInfo';
import OrderHistory from './profile/OrderHistory';
import OrderDetail from './profile/OrderDetail';

const Profile = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: [{ buildingName: "", street: "", city: "", state: "", pincode: "", country: "" }],
  });

  const [isEdit, setIsEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user, fetchUser, handleUpdateProfile } = useAuth();
  const { orders, fetchMyOrders, cancelOrder, requestReturn, loading: orderLoading } = useOrder();
  const [returnReason, setReturnReason] = useState("");
  const [showReturnInput, setShowReturnInput] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && (!user || !user.firstname)) {
      fetchUser();
    }
    fetchMyOrders();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address && user.address.length > 0 ? user.address : [{ buildingName: "", street: "", city: "", state: "", pincode: "", country: "" }],
      });
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddressChange = (index, field, value) => {
    const updated = [...formData.address];
    updated[index][field] = value;
    setFormData({ ...formData, address: updated });
  };

  const handleSave = async () => {
    try {
      await handleUpdateProfile(formData);
      toast.success("Profile updated successfully");
      setIsEdit(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      await cancelOrder(orderId);
      setSelectedOrder(null);
    }
  };

  const handleReturnRequest = async (orderId) => {
    if (!returnReason.trim()) return toast.error("Please provide a reason for return");
    await requestReturn(orderId, returnReason);
    setShowReturnInput(false);
    setReturnReason("");
    setSelectedOrder(null);
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await downloadInvoiceApi(orderId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice downloaded");
    } catch (err) {
      toast.error("Failed to download invoice");
    }
  };

  const isReturnable = (order) => {
    if (order.orderStatus !== "Delivered" || order.returnRequest?.isRequested) return false;
    const baseDate = order.deliveredAt || order.updatedAt;
    return (new Date() - new Date(baseDate)) / (1000 * 60 * 60) <= 72;
  };

  const getStatusColor = (status) => {
    const colors = { Pending: "#3b82f6", Confirmed: "#eab308", Shipped: "#a855f7", Delivered: "#10b981", Cancelled: "#ef4444", Returned: "#64748b" };
    return colors[status] || "#64748b";
  };

  return (
    <div className="profile-page container animate-fade-in">
      <div className="profile-header">
        <h1 className="page-title">My Account</h1>
        <p className="page-subtitle">Manage your personal details and orders</p>
      </div>

      <div className="profile-layout">
        <main className="profile-content">
          <PersonalInfo
            formData={formData}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            handleChange={handleChange}
            handleAddressChange={handleAddressChange}
            handleSave={handleSave}
          />

          <div className="content-card orders-section">
            <div className="order-header-flex">
              <h2>{selectedOrder ? `Order Details` : `My Orders`}</h2>
              {selectedOrder && (
                <button className="btn btn-outline profile-back-btn" onClick={() => setSelectedOrder(null)}>
                  <ArrowLeft size={16} /> Back to List
                </button>
              )}
            </div>

            {orderLoading ? (
              <div className="profile-loader-box"><div className="loader"></div></div>
            ) : selectedOrder ? (
              <OrderDetail
                order={selectedOrder}
                getStatusColor={getStatusColor}
                handleDownloadInvoice={handleDownloadInvoice}
                handleCancelOrder={handleCancelOrder}
                isReturnable={isReturnable}
                showReturnInput={showReturnInput}
                setShowReturnInput={setShowReturnInput}
                returnReason={returnReason}
                setReturnReason={setReturnReason}
                handleReturnRequest={handleReturnRequest}
              />
            ) : (
              <OrderHistory
                orders={orders}
                getStatusColor={getStatusColor}
                setSelectedOrder={setSelectedOrder}
                handleDownloadInvoice={handleDownloadInvoice}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
