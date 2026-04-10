import { useContext } from "react";
import { Authcontext } from "../context/authContext";
import { CartContext } from "../context/CartContext";
import { 
  getAllProducts, 
  getSingleProductApi,
  addToCartApi, 
  getCartApi, 
  updateCartQuantityApi, 
  removeCartItemApi, 
  clearCartApi
} from "../services/productApi";
import toast from 'react-hot-toast';

export const useCart = () => {
  const { products, setProducts, loading: authLoading, setLoading: setAuthLoading } = useContext(Authcontext);
  const { cartItems, setCartItems, cartTotal, setCartTotal, loading: cartLoading, setLoading: setCartLoading } = useContext(CartContext);

  const loading = authLoading || cartLoading;

  const fetchProducts = async () => {
    setAuthLoading(true);
    try {
      const response = await getAllProducts();
      setProducts(response.products);
    } catch (err) {
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchSingleProduct = async (id) => {
    setAuthLoading(true);
    try {
      const response = await getSingleProductApi(id);
      return response;
    } catch (err) {
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const updateCartState = (data) => {
    if (data.success && data.cart) {
      const mappedItems = data.cart.items.map(item => ({
        id: item.productId._id || item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.productId.images && item.productId.images.length > 0 
               ? item.productId.images[0].url 
               : ''
      }));
      setCartItems(mappedItems);
      setCartTotal(data.cart.totalCartPrice || 0);
    }
  };

  const fetchCart = async () => {
    try {
      const data = await getCartApi();
      updateCartState(data);
    } catch (err) {
      console.error("Fetch cart error:", err);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const data = await addToCartApi(product._id || product.id, quantity);
      if (data.success) {
        toast.success(`${product.name} added to cart!`);
        updateCartState(data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    
    try {
      const data = await updateCartQuantityApi(productId, quantity);
      if (data.success) {
        updateCartState(data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quantity");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const data = await removeCartItemApi(productId);
      if (data.success) {
        toast.success("Item removed from cart");
        updateCartState(data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      const data = await clearCartApi();
      if (data.success) {
        toast.success("Cart cleared");
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear cart");
    }
  };

  return {
    products,
    loading,
    cartItems,
    cartTotal,
    fetchProducts,
    fetchSingleProduct,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };
};
