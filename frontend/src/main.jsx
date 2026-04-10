import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./user/context/authContext.jsx";
import { CartProvider } from "./user/context/CartContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CartProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CartProvider>
  </AuthProvider>,
);
