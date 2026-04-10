import { createContext, useState } from "react";

export const Authcontext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Authcontext.Provider value={{ user, products, loading, setUser, setProducts, setLoading }}>
      {children}
    </Authcontext.Provider>
  );
};