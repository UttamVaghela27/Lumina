import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./user/components/Navbar";
import Footer from "./user/components/Footer";
import AppRoutes from "./user/components/AppRoutes";

import { Toaster } from "react-hot-toast";
import { useAuth } from "./user/hooks/useAuth";
import { useCart } from "./user/hooks/useCart";

const App = () => {
  const { user, loading, fetchUser } = useAuth();
  const { fetchCart } = useCart();
  const location = useLocation();

  const [authInitialized, setAuthInitialized] = React.useState(false);

  React.useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          if (!user) await fetchUser();
          await fetchCart();
        } catch (err) {
          console.error("Auth init failed", err);
        }
      }
      setAuthInitialized(true);
    };
    initAuth();
  }, []);

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isAdminPath = location.pathname.startsWith("/admin");

  if (!authInitialized) {
    return <div className="admin-loading-container"><div className="loader"></div></div>;
  }

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />

      {!isAdminPath && <Navbar />}

      <AppRoutes isAdmin={isAdmin} />

      {!isAdminPath && <Footer />}
    </div>
  );
};

export default App;
