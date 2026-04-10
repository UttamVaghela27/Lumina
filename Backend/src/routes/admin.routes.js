const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const identifyUser = require("../middlewares/user.middleware");
const isAdmin = require("../middlewares/admin.middleware");
const orderController = require("../controllers/order.controller");
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/upload.middleware");

// Apply auth middlewares to all admin routes
router.use(identifyUser);
router.use(isAdmin);

// Dashboard routes
router.get("/dashboard/summary", adminController.getDashboardSummary);
router.get("/dashboard/product/:id", adminController.getProductAnalytics);
router.get("/dashboard/all-products", adminController.getAllProductsAnalytics);

// Product Management (Crucial to override or combine with existing ones if needed)
// These should ideally be the same as existing product routes but protected
router.post("/products", upload.array('images', 5), productController.createProduct);
router.put("/products/:id", upload.array('images', 5), productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

// Order Management
router.get("/orders", orderController.getAllOrders);
router.put("/orders/:id/status", orderController.updateOrderStatus);

// User Management
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/toggle-status", adminController.toggleUserStatus);

module.exports = router;
