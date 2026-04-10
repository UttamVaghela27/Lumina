import api from "./Axios";

// ORDER APIS
export async function placeOrderApi(orderData) {
  const response = await api.post("/api/order/create", orderData);
  return response.data;
}

export async function verifyPaymentApi(paymentData) {
  const response = await api.post("/api/order/verify-payment", paymentData);
  return response.data;
}

export async function getMyOrdersApi() {
  const response = await api.get("/api/order/my-orders");
  return response.data;
}

export const requestReturnApi = async (orderId, reason) => {
  const response = await api.post(`/api/order/${orderId}/return-request`, { reason });
  return response.data;
};

export async function getSingleOrderApi(id) {
  const response = await api.get(`/api/order/${id}`);
  return response.data;
}

export async function cancelOrderApi(id) {
  const response = await api.put(`/api/order/${id}/cancel`);
  return response.data;
}

export async function downloadInvoiceApi(id) {
  const response = await api.get(`/api/order/${id}/invoice`, {
    responseType: 'blob'
  });
  return response;
}
