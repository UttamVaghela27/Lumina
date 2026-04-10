const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: [
      {
        buildingName: String,
        street: String,
        city: String,
        pincode: String,
        state: String,
        country: {
          type: String,
          default: "India",
        },
        isDefault: Boolean,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
