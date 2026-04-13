const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");

/**
 * Recalculate totalCartPrice and totalItems for the cart
 */
const recalculateCart = (cart) => {
  let totalCartPrice = 0;
  let totalItems = 0;

  cart.items.forEach((item) => {
    // Sync with product details if populated
    if (item.productId && typeof item.productId === "object") {
      item.name = item.productId.name || item.name;
      item.price = item.productId.price || item.price;
    }
    item.totalPrice = item.price * item.quantity;
    totalCartPrice += item.totalPrice;
    totalItems += item.quantity;
  });

  cart.totalCartPrice = totalCartPrice;
  cart.totalItems = totalItems;
  return cart;
};

/**
 * Add product to cart
 */
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      });
    }

    // 2. Find user's cart
    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      // 3. If cart doesn't exist, create new
      cart = new cartModel({
        userId,
        items: [
          {
            productId,
            name: product.name,
            price: product.price,
            quantity,
            totalPrice: product.price * quantity,
          },
        ],
      });
    } else {
      // 4. If cart exists, check if product is already in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;

        if (product.stock < cart.items[itemIndex].quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available in stock`,
          });
        }
      } else {
        // Product doesn't exist, add new item
        cart.items.push({
          productId,
          name: product.name,
          price: product.price,
          quantity,
          totalPrice: product.price * quantity,
        });
      }
    }

    // 5. Recalculate and Save
    cart = recalculateCart(cart);
    await cart.save();
    await cart.populate("items.productId", "name price images stock");

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get current user's cart
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await cartModel
      .findOne({ userId })
      .populate("items.productId", "name price images stock");

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: { items: [], totalCartPrice: 0, totalItems: 0 },
      });
    }

    let hasChanges = false;
    cart.items.forEach((item) => {
      if (item.productId) {
        if (
          item.name !== item.productId.name ||
          item.price !== item.productId.price
        ) {
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      cart = recalculateCart(cart);
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Update item quantity
 */
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Stock check
      const product = await productModel.findById(productId);
      if (product && product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock`,
        });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    cart = recalculateCart(cart);
    await cart.save();
    await cart.populate("items.productId", "name price images stock");

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update quantity error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Remove single item from cart
 */
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    cart = recalculateCart(cart);
    await cart.save();
    await cart.populate("items.productId", "name price images stock");

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove item error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Clear the entire cart
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    cart.totalCartPrice = 0;
    cart.totalItems = 0;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
