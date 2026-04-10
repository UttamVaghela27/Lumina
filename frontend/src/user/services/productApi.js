import api from "./Axios";

// PRODUCT APIS
export async function getAllProducts() {
  const response = await api.get("/api/product/getproduct");
  return response.data;
}

export async function getSingleProductApi(id) {
  const response = await api.get(`/api/product/getsingleproduct/${id}`);
  return response.data;
}

// CART APIS
export async function addToCartApi(productId, quantity) {
  const response = await api.post("/api/cart/add", { productId, quantity });
  return response.data;
}

export async function getCartApi() {
  const response = await api.get("/api/cart/");
  return response.data;
}

export async function updateCartQuantityApi(productId, quantity) {
  const response = await api.put("/api/cart/update", { productId, quantity });
  return response.data;
}

export async function removeCartItemApi(productId) {
  const response = await api.delete(`/api/cart/remove/${productId}`);
  return response.data;
}

export async function clearCartApi() {
  const response = await api.delete("/api/cart/clear");
  return response.data;
}
