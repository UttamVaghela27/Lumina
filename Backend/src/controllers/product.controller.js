const productModel = require("../models/product.model");
const imagekit = require("../config/imagekit");

async function createProduct(req, res) {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      brand,
      costPrice,
    } = req.body;

    let uploadedImages = [];

    if (req.files) {
      uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const response = await imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: "/products",
          });

          return { url: response.url, fileId: response.fileId };
        }),
      );
    }
    const product = await productModel.create({
      name,
      description,
      price,
      stock,
      category,
      brand,
      costPrice,
      images: uploadedImages,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getProducts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await productModel.countDocuments();
    const products = await productModel.find().skip(skip).limit(limit);

    if (products.length === 0 && totalCount > 0) {
      return res.status(200).json({
        success: true,
        message: "No products found for this page",
        products: [],
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      });
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getSingleProduct(req, res) {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      sucess: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateProduct(req, res) {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      // Delete old images from ImageKit
      if (product.images && product.images.length > 0) {
        await Promise.all(
          product.images.map(async (img) => {
            if (img.fileId) {
              await imagekit
                .deleteFile(img.fileId)
                .catch((err) =>
                  console.log("Imagekit delete error on update:", err.message),
                );
            }
          }),
        );
      }

      // Upload new images
      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const response = await imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: "/products",
          });

          return { url: response.url, fileId: response.fileId };
        }),
      );

      updateData.images = uploadedImages;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true },
    );

    res.status(201).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from ImageKit
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (img) => {
          if (img.fileId) {
            await imagekit
              .deleteFile(img.fileId)
              .catch((err) =>
                console.log("Imagekit delete error on delete:", err.message),
              );
          }
        }),
      );
    }

    await productModel.findByIdAndDelete(productId);

    res.status(201).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
