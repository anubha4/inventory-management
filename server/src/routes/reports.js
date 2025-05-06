const express = require('express');
const { Op } = require('sequelize');
const { protect, restrictTo } = require('../middleware/auth');
const { Order, OrderItem } = require('../models/order');
const { Product } = require('../models/product');
const { AppError } = require('../middleware/errorHandler');
const { sequelize } = require('../config/database');

const router = express.Router();

// Get sales report
router.get('/sales', protect, restrictTo('admin', 'manager'), async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return next(new AppError('Please provide start and end dates', 400));
        }

        const sales = await Order.findAll({
            where: {
                type: 'sale',
                status: 'completed',
                date: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [
                {
                    model: OrderItem,
                    include: [Product]
                }
            ],
            order: [['date', 'DESC']]
        });

        // Calculate totals
        const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        const totalItems = sales.reduce((sum, sale) => {
            return sum + sale.OrderItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);

        res.json({
            status: 'success',
            data: {
                sales,
                summary: {
                    totalSales,
                    totalItems,
                    totalOrders: sales.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get inventory value report
router.get('/inventory-value', protect, restrictTo('admin', 'manager'), async (req, res, next) => {
    try {
        const products = await Product.findAll({
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalProducts'],
                [sequelize.fn('SUM', sequelize.col('stockQuantity')), 'totalStock'],
                [
                    sequelize.fn('SUM', 
                        sequelize.literal('stockQuantity * cost')
                    ), 
                    'totalValue'
                ]
            ],
            group: ['category']
        });

        const totalValue = products.reduce((sum, product) => sum + Number(product.getDataValue('totalValue')), 0);

        res.json({
            status: 'success',
            data: {
                categories: products,
                totalValue
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get low stock report
router.get('/low-stock', protect, async (req, res, next) => {
    try {
        const products = await Product.findAll({
            where: {
                stockQuantity: {
                    [Op.lte]: sequelize.col('lowStockThreshold')
                }
            },
            order: [
                ['stockQuantity', 'ASC'],
                ['name', 'ASC']
            ]
        });

        res.json({
            status: 'success',
            data: {
                products,
                totalLowStock: products.length
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get product performance report
router.get('/product-performance', protect, restrictTo('admin', 'manager'), async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return next(new AppError('Please provide start and end dates', 400));
        }

        const performance = await OrderItem.findAll({
            attributes: [
                'ProductId',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantitySold'],
                [
                    sequelize.fn('SUM',
                        sequelize.literal('quantity * price')
                    ),
                    'totalRevenue'
                ]
            ],
            include: [
                {
                    model: Product,
                    attributes: ['name', 'category', 'sku']
                },
                {
                    model: Order,
                    attributes: [],
                    where: {
                        type: 'sale',
                        status: 'completed',
                        date: {
                            [Op.between]: [new Date(startDate), new Date(endDate)]
                        }
                    }
                }
            ],
            group: ['ProductId', 'Product.id'],
            order: [[sequelize.literal('totalQuantitySold'), 'DESC']]
        });

        res.json({
            status: 'success',
            data: {
                products: performance
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get daily sales trend
router.get('/sales-trend', protect, restrictTo('admin', 'manager'), async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return next(new AppError('Please provide start and end dates', 400));
        }

        const trend = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalSales']
            ],
            where: {
                type: 'sale',
                status: 'completed',
                date: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('date'))],
            order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']]
        });

        res.json({
            status: 'success',
            data: {
                trend
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 