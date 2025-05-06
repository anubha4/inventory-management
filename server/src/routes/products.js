const express = require('express');
const { body, query } = require('express-validator');
const { Op } = require('sequelize');
const { protect, restrictTo } = require('../middleware/auth');
const { Product } = require('../models/product');
const { validateRequest } = require('../middleware/validator');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation middleware
const productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a positive number'),
    body('lowStockThreshold').isInt({ min: 0 }).withMessage('Low stock threshold must be a positive number'),
    validateRequest
];

// Get all products with filtering, sorting, and pagination
router.get('/', protect, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'name',
            order = 'ASC',
            search,
            category,
            status,
            lowStock
        } = req.query;

        // Build where clause
        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { sku: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }
        if (category) where.category = category;
        if (status) where.status = status;
        if (lowStock === 'true') {
            where.stockQuantity = {
                [Op.lte]: sequelize.col('lowStockThreshold')
            };
        }

        // Get products
        const products = await Product.findAndCountAll({
            where,
            order: [[sort, order]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        res.json({
            status: 'success',
            data: {
                products: products.rows,
                total: products.count,
                pages: Math.ceil(products.count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get single product
router.get('/:id', protect, async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        res.json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
});

// Create product
router.post('/', protect, restrictTo('admin', 'manager'), productValidation, async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
});

// Update product
router.patch('/:id', protect, restrictTo('admin', 'manager'), async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        // Update product
        await product.update(req.body);

        res.json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
});

// Delete product
router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        await product.destroy();

        res.json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
});

// Update stock quantity
router.patch('/:id/stock', protect, restrictTo('admin', 'manager'), async (req, res, next) => {
    try {
        const { quantity, type } = req.body;
        if (!quantity || !['add', 'subtract'].includes(type)) {
            return next(new AppError('Please provide valid quantity and type (add/subtract)', 400));
        }

        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        await product.updateStock(parseInt(quantity), type);

        res.json({
            status: 'success',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
});

// Get low stock products
router.get('/status/low-stock', protect, async (req, res, next) => {
    try {
        const products = await Product.findAll({
            where: {
                stockQuantity: {
                    [Op.lte]: sequelize.col('lowStockThreshold')
                }
            }
        });

        res.json({
            status: 'success',
            data: { products }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 