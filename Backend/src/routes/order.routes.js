const express = require("express");
const orderRouter = express.Router();
const orderController = require("../controllers/order.controller");
const identifyUser = require("../middlewares/user.middleware");
const isAdmin = require("../middlewares/admin.middleware");

// User routes (all require authentication)
orderRouter.post("/create", identifyUser, orderController.createOrder);
orderRouter.post("/verify-payment", identifyUser, orderController.verifyPayment);
orderRouter.get("/my-orders", identifyUser, orderController.getMyOrders);
orderRouter.get("/:id", identifyUser, orderController.getSingleOrder);
orderRouter.get("/:id/invoice", identifyUser, orderController.downloadInvoice);
orderRouter.post("/:id/return-request", identifyUser, orderController.requestReturn);
orderRouter.put("/:id/cancel", identifyUser, orderController.cancelOrder);

// Admin routes (require authentication and admin role)
orderRouter.get(
  "/admin/all",
  identifyUser,
  isAdmin,
  orderController.getAllOrders,
);
orderRouter.put(
  "/admin/:id/status",
  identifyUser,
  isAdmin,
  orderController.updateOrderStatus,
);

module.exports = orderRouter;
