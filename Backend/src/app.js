const express = require("express");
const userRouter = require("./routes/user.route");
const productRouter = require("./routes/product.route");
const cartRouter = require("./routes/cart.routes");
const orderRouter = require("./routes/order.routes");
const adminRouter = require("./routes/admin.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }),
);


app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);

module.exports = app;
