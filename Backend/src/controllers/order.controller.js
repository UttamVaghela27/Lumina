const Order = require("../models/order.model");
const cartModel = require("../models/cart.model");
const userModel = require("../models/user.model");
const productModel = require("../models/product.model");
const sendEmail = require("../services/email.service");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

/**
 * Helper to sanitize order objects for public/user responses
 * Hides sensitive business metrics like cost price, profit, margin, and ROI
 */
const sanitizeOrder = (order) => {
  const orderObj = order.toObject ? order.toObject() : JSON.parse(JSON.stringify(order));
  if (orderObj.items) {
    orderObj.items = orderObj.items.map((item) => {
      const {
        costPrice,
        revenue,
        productCost,
        totalCost,
        profit,
        margin,
        roi,
        ...rest
      } = item;
      return rest;
    });
  }
  return orderObj;
};

/**
 * @desc Create a new order (initiated with Razorpay for ONLINE)
 * @route POST /api/order/create
 * @access Private
 */
exports.createOrder = async (req, res) => {
  console.log("Incoming Create Order Request:", {
    user: req.user.id,
    paymentMethod: req.body.paymentMethod,
  });

  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    // 1. Get user's cart from DB
    const cart = await cartModel.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      console.warn("Cart is empty for user:", userId);
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Cannot place an order.",
      });
    }

    // 2. Calculate prices
    const subtotalPrice = cart.totalCartPrice;
    const taxPrice = Math.round(subtotalPrice * 0.18); // 18% GST
    const totalAmount = subtotalPrice + taxPrice;

    // 3. Fetch all products in one query to avoid N+1 problem
    const productIds = cart.items.map(item => item.productId);
    const products = await productModel.find({ _id: { $in: productIds } });
    const productMap = products.reduce((map, p) => {
      map[p._id.toString()] = p;
      return map;
    }, {});

    const orderItems = cart.items.map((item) => {
      const product = productMap[item.productId.toString()];
      const costPrice = product ? product.costPrice || 0 : 0;
      const revenue = item.price * item.quantity;
      const productCost = costPrice * item.quantity;
      const totalCost = productCost;
      const profit = revenue - totalCost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

      return {
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        costPrice,
        revenue,
        productCost,
        totalCost,
        profit,
        margin,
        roi,
      };
    });

    // 4. Create new order
    const order = new Order({
      userId,
      items: orderItems,
      subtotalPrice,
      taxPrice,
      totalAmount,
      shippingAddress,
      paymentMethod,
      orderStatus: "Pending",
    });

    // If payment method is ONLINE, create Razorpay Order
    if (paymentMethod === "ONLINE") {
      order.paymentStatus = "pending";

      const razorpayOptions = {
        amount: Math.round(totalAmount * 100), // Amount in paise
        currency: "INR",
        receipt: order._id.toString(),
      };

      console.log("Initiating Razorpay Order with Options:", razorpayOptions);

      const razorpayOrder =
        await razorpayInstance.orders.create(razorpayOptions);

      console.log("Razorpay Order Created Successfully:", razorpayOrder.id);
      order.razorpayOrderId = razorpayOrder.id;
    } else {
      // COD Logic
      order.paymentStatus = "pending";
    }

    await order.save();

    // 5. Clear user's cart
    cart.items = [];
    cart.totalCartPrice = 0;
    cart.totalItems = 0;
    await cart.save();

    // 6. Send success email (Optional - non-blocking preferred in prod)
    try {
      const user = await userModel.findById(userId);
      if (user && user.email) {
        // Send email without awaiting to speed up response
        sendEmail(
          user.email,
          "Order Confirmation",
          "Your order has been placed successfully.",
          `<h1>Order Confirmation</h1><p>Dear ${user.firstname},</p><p>Your order <b>#${order._id}</b> has been placed successfully.</p><p>Total Amount: ₹${totalAmount}</p>`,
        ).catch(e => console.error("Async email error:", e.message));
      }
    } catch (emailErr) {
      console.error("Email preparation failed:", emailErr.message);
    }

    // 7. Sanitize response using a consistent pattern
    const orderObj = sanitizeOrder(order);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: orderObj,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc Verify Razorpay Payment Signature and update order
 * @route POST /api/order/verify-payment
 * @access Private
 */
exports.verifyPayment = async (req, res) => {
  console.log("Incoming Payment Verification Request Body:", req.body);

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn("Missing required payment verification fields");
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // 1. Generate Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest("hex");

    console.log("Generated Signature:", expectedSignature);
    console.log("Received Signature:", razorpay_signature);

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log("Is Signature Authentic?:", isAuthentic);

    if (isAuthentic) {
      // 2. Find order
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

      if (!order) {
        console.error(
          "Order not found for razorpayOrderId:",
          razorpay_order_id,
        );
        return res.status(404).json({
          success: false,
          message: "Order record not found in database",
        });
      }

      console.log(
        "Order Found. Updating status to 'paid'. Order ID:",
        order._id,
      );

      // 3. Update status
      order.paymentStatus = "paid";
      order.paymentId = razorpay_payment_id;
      // Note: orderStatus stays 'Pending' per user's manual confirmation workflow
      await order.save();

      // 4. Sanitize and return
      const orderObj = sanitizeOrder(order);

      return res.status(200).json({
        success: true,
        message: "Payment verified and order updated successfully",
        order: orderObj,
      });
    } else {
      // 5. Signature mismatch
      console.error(
        "Signature verification failed for order:",
        razorpay_order_id,
      );

      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (order) {
        order.paymentStatus = "failed";
        await order.save();
      }

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Verification failed.",
      });
    }
  } catch (error) {
    console.error("Payment verification block error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during verification",
      error: error.message,
    });
  }
};

/**
 * @desc Get logged in user's orders (Customer)
 * @route GET /api/orders/my-orders
 * @access Private
 */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    // Secure selective projection: hide profit, costs, margin etc.
    const rawOrders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    // Sanitize each order
    const orders = rawOrders.map(order => sanitizeOrder(order));

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc Get single order details
 * @route GET /api/orders/:id
 * @access Private
 */
exports.getSingleOrder = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order belongs to the user or if user is admin
    const isAdmin = req.user.role === "admin";
    if (order.userId.toString() !== req.user.id && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    // Hide sensitive business metrics for non-admin users
    if (!isAdmin) {
      order = sanitizeOrder(order);
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get single order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc Cancel an order (User)
 * @route PUT /api/orders/:id/cancel
 * @access Private
 */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check ownership
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus !== "Pending" && order.orderStatus !== "Confirmed") {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.orderStatus}`,
      });
    }

    order.orderStatus = "Cancelled";
    order.isCancelled = true;
    order.cancelledAt = Date.now();
    await order.save();

    // Send cancellation email
    const user = await userModel.findById(req.user.id);
    if (user && user.email) {
      await sendEmail(
        user.email,
        "Order Cancelled",
        "Your order has been cancelled successfully.",
        `<h1>Order Cancelled</h1><p>Dear ${user.firstname},</p><p>Your order <b>#${order._id}</b> has been cancelled successfully.</p>`,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc Get all orders (Admin)
 * @route GET /api/admin/orders
 * @access Private/Admin
 */
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const orders = await Order.find()
      .populate("userId", "firstname lastname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get counts for stats
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      pending: stats.find((s) => s._id === "Pending")?.count || 0,
      confirmed: stats.find((s) => s._id === "Confirmed")?.count || 0,
      cancelled: stats.find((s) => s._id === "Cancelled")?.count || 0,
      delivered: stats.find((s) => s._id === "Delivered")?.count || 0,
    };

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      counts,
      orders,
    });
  } catch (error) {
    console.error("Admin get all orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc Update order status (Admin)
 * @route PUT /api/admin/orders/:id/status
 * @access Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      // If status is changed to Delivered, set the deliveredAt date
      if (orderStatus === "Delivered" && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
      // If status is changed to Returned, update the return request status to approved
      if (orderStatus === "Returned" && order.returnRequest.isRequested) {
        order.returnRequest.status = "approved";
      }
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Admin update order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * @desc Request a return for a delivered order
 * @route POST /api/order/:id/return-request
 * @access Private
 */
exports.requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Security: Check if the user owns this order
    if (order.userId.toString() !== req.user.id) {
       return res.status(403).json({ 
         success: false, 
         message: "Unauthorized access" 
       });
    }

    // Validation: Check if order is 'Delivered'
    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({ 
        success: false, 
        message: "Only delivered orders can be returned" 
      });
    }

    // 3-day policy check (72 hours from delivery or last update)
    const baseDate = order.deliveredAt || order.updatedAt;
    const hoursSinceDelivery = (new Date() - new Date(baseDate)) / (1000 * 60 * 60);

    if (hoursSinceDelivery > 72) {
      return res.status(400).json({ 
        success: false, 
        message: "The 3-day return window has expired for this order" 
      });
    }

    // Update order with return request data
    order.returnRequest = {
      isRequested: true,
      reason,
      status: "pending",
      requestedAt: new Date()
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request submitted successfully. Admin will review it.",
      order
    });
  } catch (error) {
    console.error("Return request error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit return request",
      error: error.message 
    });
  }
};

/**
 * @desc Generate and download invoice PDF
 * @route GET /api/order/:id/invoice
 * @access Private (Owner or Admin)
 */
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Authorization: User must be the owner OR an admin
    const isAdmin = req.user.role === "admin";
    if (order.userId.toString() !== req.user.id && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to download this invoice" });
    }

    const { generateInvoice } = require("../utils/invoiceGenerator");
    const pdfBase64 = await generateInvoice(order);

    res.contentType("application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order._id.toString().substring(0, 8)}.pdf`);
    
    const buffer = Buffer.from(pdfBase64, 'base64');
    res.send(buffer);

  } catch (error) {
    console.error("Invoice generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate invoice", error: error.message });
  }
};
