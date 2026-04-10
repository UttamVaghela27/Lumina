import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { placeOrderApi, verifyPaymentApi, getMyOrdersApi, getSingleOrderApi, cancelOrderApi, requestReturnApi } from "../services/orderApi";
import toast from "react-hot-toast";

export const useOrder = () => {
  const [orders, setOrders] = useState([]);
  const { setCartItems, setCartTotal, loading, setLoading } = useContext(CartContext);
  const navigate = useNavigate();

  const placeOrder = async (orderData) => {
    setLoading(true);
    try {
      const data = await placeOrderApi(orderData);
      if (data.success) {
        if (orderData.paymentMethod === "COD") {
          toast.success("Order Placed Successfully!");
          setCartItems([]);
          setCartTotal(0);
          navigate("/order-success", { state: { order: data.order } });
        }
        return data;
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Something went wrong while placing order";
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentData, order) => {
    setLoading(true);
    try {
      const data = await verifyPaymentApi(paymentData);
      if (data.success) {
        toast.success("Payment Successful!");
        setCartItems([]);
        setCartTotal(0);
        navigate("/order-success", { state: { order: data.order || order } });
        return data;
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Payment Verification Failed";
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyOrdersApi();
      if (data.success) {
        setOrders(data.orders);
        return data.orders;
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleOrder = async (id) => {
    setLoading(true);
    try {
      const data = await getSingleOrderApi(id);
      if (data.success) {
        return data.order;
      }
    } catch (err) {
      toast.error("Failed to fetch order details");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id) => {
    setLoading(true);
    try {
      const data = await cancelOrderApi(id);
      if (data.success) {
        toast.success("Order Cancelled Successfully");
        await fetchMyOrders(); // Refresh the list
        return data;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestReturn = async (id, reason) => {
    setLoading(true);
    try {
      const data = await requestReturnApi(id, reason);
      if (data.success) {
        toast.success("Return request submitted!");
        await fetchMyOrders();
        return data;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit return request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    placeOrder,
    fetchMyOrders,
    fetchSingleOrder,
    cancelOrder,
    requestReturn,
    verifyPayment,
    orders,
    loading,
  };
};
