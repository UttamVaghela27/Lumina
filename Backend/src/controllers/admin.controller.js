const Order = require("../models/order.model");
const productModel = require("../models/product.model");
const userModel = require("../models/user.model");
const mongoose = require("mongoose");

/**
 * @desc Get Dashboard Summary with metrics (Revenue, Profit, Margin, ROI, Best/Worst Product)
 * @route GET /api/admin/dashboard/summary
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const { startDate, endDate, productId } = req.query;

    const match = {};
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Pipeline for overall analytics
    const statsPipeline = [
      { $match: match }, // Match by date if provided
      {
        $facet: {
          metrics: [
            { $unwind: "$items" },
            ...(productId && productId !== "all" ? [{ $match: { "items.productId": new mongoose.Types.ObjectId(productId) } }] : []),
            { $match: { orderStatus: { $nin: ["Cancelled", "Returned"] } } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$items.revenue" },
                totalCost: { $sum: "$items.totalCost" },
                totalProfit: { $sum: "$items.profit" },
                totalItemsSold: { $sum: "$items.quantity" },
              }
            }
          ],
          statusCounts: [
            {
              $group: {
                _id: "$orderStatus",
                count: { $sum: 1 }
              }
            }
          ],
          totalOrders: [
            { $count: "count" }
          ]
        }
      }
    ];

    const statsResult = await Order.aggregate(statsPipeline);
    const { metrics, statusCounts, totalOrders } = statsResult[0];

    const summary = metrics[0] || {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      totalItemsSold: 0,
    };

    summary.totalOrders = totalOrders[0]?.count || 0;
    
    // Extract status counts
    const getCount = (status) => statusCounts.find(s => s._id === status)?.count || 0;
    summary.confirmedCount = getCount("Confirmed");
    summary.deliveredCount = getCount("Delivered");
    summary.cancelledCount = getCount("Cancelled");
    summary.returnedCount = getCount("Returned");
    summary.pendingCount = getCount("Pending");
    summary.shippedCount = getCount("Shipped");

    // Calculate overall Margin (%) and ROI (%)
    summary.margin = summary.totalRevenue > 0 ? (summary.totalProfit / summary.totalRevenue) * 100 : 0;
    summary.roi = summary.totalCost > 0 ? (summary.totalProfit / summary.totalCost) * 100 : 0;

    const activeMatch = { ...match, orderStatus: { $nin: ["Cancelled", "Returned"] } };

    // Additional summary for cards
    const bestProduct = await Order.aggregate([
      { $match: activeMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalProfit: { $sum: "$items.profit" },
          totalROI: { $avg: "$items.roi" }
        }
      },
      { $sort: { totalProfit: -1 } },
      { $limit: 1 }
    ]);

    const worstProduct = await Order.aggregate([
      { $match: activeMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalProfit: { $sum: "$items.profit" },
        }
      },
      { $sort: { totalProfit: 1 } },
      { $limit: 1 }
    ]);

    // Profit per product for the chart
    const profitPerProduct = await Order.aggregate([
        { $match: activeMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            profit: { $sum: "$items.profit" },
            roi: { $avg: "$items.roi" }
          }
        },
        { $sort: { profit: -1 } },
        { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      summary,
      bestProduct: bestProduct[0] || null,
      worstProduct: worstProduct[0] || null,
      profitPerProduct
    });

  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get analytics for a single product
 * @route GET /api/admin/dashboard/product/:id
 */
exports.getProductAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const dateMatch = { orderStatus: { $nin: ["Cancelled", "Returned"] } };
        if (startDate && endDate) {
            dateMatch.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const stats = await Order.aggregate([
            { $match: dateMatch },
            { $unwind: "$items" },
            { $match: { "items.productId": new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: "$items.productId",
                    name: { $first: "$items.name" },
                    sellingPrice: { $avg: "$items.price" },
                    costPrice: { $first: "$items.costPrice" },
                    totalOrders: { $sum: 1 },
                    deliveredOrders: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] }
                    },
                    returnedOrders: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "Returned"] }, 1, 0] }
                    },
                    totalRevenue: { $sum: "$items.revenue" },
                    totalCost: { $sum: "$items.totalCost" },
                    profit: { $sum: "$items.profit" },
                }
            }
        ]);

        if (stats.length === 0) {
            const product = await productModel.findById(id);
            if (!product) return res.status(404).json({ success: false, message: "Product not found" });
            
            return res.status(200).json({
                success: true,
                analytics: {
                    name: product.name,
                    sellingPrice: product.price,
                    costPrice: product.costPrice,
                    totalOrders: 0,
                    profit: 0,
                    margin: 0,
                    roi: 0
                }
            });
        }

        const analytics = stats[0];
        analytics.margin = analytics.totalRevenue > 0 ? (analytics.profit / analytics.totalRevenue) * 100 : 0;
        analytics.roi = analytics.totalCost > 0 ? (analytics.profit / analytics.totalCost) * 100 : 0;

        res.status(200).json({ success: true, analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get analytics for all products
 * @route GET /api/admin/dashboard/all-products
 */
exports.getAllProductsAnalytics = async (req, res) => {
    try {
        const products = await productModel.find({}, 'name _id');
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Get all users
 * @route GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({ role: "user" }).select("-password");
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc Block / Unblock user
 * @route PUT /api/admin/users/:id/toggle-status
 */
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({ success: true, message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
