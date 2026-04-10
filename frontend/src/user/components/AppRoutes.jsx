import React, { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

const PageLoader = () => (
  <div className="admin-loading-container">
    <div className="loader"></div>
  </div>
);

// User Pages - Lazy Loaded
const Register = lazy(() => import("../pages/Register"));
const Login = lazy(() => import("../pages/Login"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Verify = lazy(() => import("../pages/Verify"));
const Home = lazy(() => import("../pages/Home"));
const Profile = lazy(() => import("../pages/Profile"));
const Product = lazy(() => import("../pages/Product"));
const Contact = lazy(() => import("../pages/Contact"));
const About = lazy(() => import("../pages/About"));
const Cart = lazy(() => import("../pages/Cart"));
const SingleProduct = lazy(() => import("../pages/SingleProduct"));
const Checkout = lazy(() => import("../pages/Checkout"));
const OrderSuccess = lazy(() => import("../pages/OrderSuccess"));

// Policy Pages - Lazy Loaded
const Terms = lazy(() => import("../pages/Terms"));
const Privacy = lazy(() => import("../pages/Privacy"));
const Refunds = lazy(() => import("../pages/Refunds"));
const Shipping = lazy(() => import("../pages/Shipping"));

// Admin - Lazy Loaded
const AdminProtectedRoute = lazy(() => import("../../admin/components/AdminProtectedRoute"));
const AdminLayout = lazy(() => import("../../admin/components/AdminLayout"));
const Dashboard = lazy(() => import("../../admin/pages/Dashboard"));
const AdminProducts = lazy(() => import("../../admin/pages/AdminProducts"));
const AdminOrders = lazy(() => import("../../admin/pages/AdminOrders"));
const AdminUsers = lazy(() => import("../../admin/pages/AdminUsers"));

const AppRoutes = ({ isAdmin }) => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {isAdmin ? (
          <>
            <Route
              path="/admin/*"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Product />} />
            <Route path="/product/:id" element={<SingleProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />

            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund-policy" element={<Refunds />} />
            <Route path="/shipping-policy" element={<Shipping />} />
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
