const express = require('express');
const { body } = require('express-validator');
const { Op } = require('sequelize');
const { protect, restrictTo } = require('../middleware/auth');
const { Order, OrderItem } = require('../models/order');
const { Product } = require('../models/product');
const { validateRequest } = require('../middleware/validator');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation middleware
const orderValidation = [
    body('type').isIn(['sale', 'purchase']).withMessage('Invalid order type'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.productId').isInt().withMessage('Invalid product ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    validateRequest
];

// Get all orders with filtering and pagination
router.get('/', protect, async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            type,
            status,
            startDate,
            endDate,
            search
        } = req.query;

        // Build where clause
        const where = {};
        if (type) where.type = type;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = new Date(startDate);
            if (endDate) where.date[Op.lte] = new Date(endDate);
        }
        if (search) {
            where[Op.or] = [
                { orderNumber: { [Op.like]: `%${search}%` } },
                { customerName: { [Op.like]: `%${search}%` } },
                { customerEmail: { [Op.like]: `%${search}%` } }
            ];
        }

        // Get orders
        const orders = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: OrderItem,
                    include: [Product]
                }
            ],
            order: [['date', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        res.json({
            status: 'success',
            data: {
                orders: orders.rows,
                total: orders.count,
                pages: Math.ceil(orders.count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get single order
router.get('/:id', protect, async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                {
                    model: OrderItem,
                    include: [Product]
                }
            ]
        });

        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        res.json({
            status: 'success',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
});

// Create order
router.post('/', protect, orderValidation, async (req, res, next) => {
    try {
        const { type, items, customerName, customerEmail, customerPhone, shippingAddress, notes } = req.body;

        // Generate order number
        const orderNumber = `${type.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order
        const order = await Order.create({
            orderNumber,
            type,
            totalAmount,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            notes,
            createdById: req.user.id
        });

        // Create order items
        const orderItems = await Promise.all(
            items.map(async item => {
                const product = await Product.findByPk(item.productId);
                if (!product) {
                    throw new AppError(`Product with ID ${item.productId} not found`, 404);
                }

                return OrderItem.create({
                    OrderId: order.id,
                    ProductId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                });
            })
        );

        // Update order total
        await order.calculateTotal();

        res.status(201).json({
            status: 'success',
            data: {
                order: {
                    ...order.toJSON(),
                    items: orderItems
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update order status
router.patch('/:id/status', protect, restrictTo('admin', 'manager'), async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
            return next(new AppError('Invalid status', 400));
        }

        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        await order.update({ status });

        res.json({
            status: 'success',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
});

// Delete order
router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        await order.destroy();

        res.json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 