const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    stock: {
      type: Number,
      default: 0,
      required: [true, "Stock is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
    },
    images: [
      {
        url: String,
        fileId: String,
      },
    ],
    costPrice: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;
