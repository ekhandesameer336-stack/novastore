import Product from '../models/Product.js';

// @route   GET /api/products
// @desc    Fetch all products with optional search query and category filtering
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    // Search by product name or description
    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      filter.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Optional sort handling (price-asc, price-desc, newest)
    let query = Product.find(filter);
    if (sort === 'price-asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price-desc') {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 }); // Newest first
    }

    const products = await query.exec();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/categories
// @desc    Get all distinct product categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/:id
// @desc    Fetch a single product by ID
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only)
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      images,
      category,
      stock,
      ratingAverage,
      ratingCount,
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, description, price, category)',
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
      category,
      stock: stock !== undefined ? Number(stock) : 0,
      ratingAverage: ratingAverage !== undefined ? Number(ratingAverage) : 0,
      ratingCount: ratingCount !== undefined ? Number(ratingCount) : 0,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Private (Admin only)
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const {
      name,
      description,
      price,
      images,
      category,
      stock,
      ratingAverage,
      ratingCount,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (images !== undefined) product.images = images;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (ratingAverage !== undefined) product.ratingAverage = Number(ratingAverage);
    if (ratingCount !== undefined) product.ratingCount = Number(ratingCount);

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin only)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
