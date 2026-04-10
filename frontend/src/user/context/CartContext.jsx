import React, { createContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartTotal, 
      loading, 
      setCartItems, 
      setCartTotal, 
      setLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };
