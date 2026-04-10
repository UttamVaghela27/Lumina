const express = require("express");
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/upload.middleware");
const identifyUser = require("../middlewares/user.middleware");
const isAdmin = require("../middlewares/admin.middleware");

const productRouter = express.Router();

//ADMIN

productRouter.post(
  "/createproduct",
  upload.array("images", 5),
  identifyUser,
  isAdmin,
  productController.createProduct,
);
productRouter.put(
  "/updateproduct/:id",
  identifyUser,
  isAdmin,
  productController.updateProduct,
);
productRouter.delete(
  "/deleteproduct/:id",
  identifyUser,
  isAdmin,
  productController.deleteProduct,
);

//PUBLIC

productRouter.get("/getproduct", productController.getProducts);
productRouter.get("/getsingleproduct/:id", productController.getSingleProduct);

module.exports = productRouter;
