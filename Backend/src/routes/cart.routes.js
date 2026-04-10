const express = require("express");
const cartRouter = express.Router();
const cartController = require("../controllers/cart.controller");
const identifyUser = require("../middlewares/user.middleware");

// All cart routes require authentication
cartRouter.use(identifyUser);

// Add product to cart
cartRouter.post("/add", cartController.addToCart);

// Get current user's cart
cartRouter.get("/", cartController.getCart);

// Update item quantity
cartRouter.put("/update", cartController.updateQuantity);

// Remove single product from cart
cartRouter.delete("/remove/:productId", cartController.removeItem);

// Clear entire cart
cartRouter.delete("/clear", cartController.clearCart);

module.exports = cartRouter;
