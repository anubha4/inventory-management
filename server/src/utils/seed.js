const { User } = require('../models/user');
const { Product } = require('../models/product');
const { Order, OrderItem } = require('../models/order');
const logger = require('./logger');

const sampleProducts = [
    {
        name: 'Laptop',
        description: 'High-performance laptop for professionals',
        sku: 'TECH-001',
        category: 'Electronics',
        price: 1299.99,
        cost: 900.00,
        stockQuantity: 50,
        lowStockThreshold: 10,
        unit: 'piece',
        status: 'active'
    },
    {
        name: 'Smartphone',
        description: 'Latest model smartphone',
        sku: 'TECH-002',
        category: 'Electronics',
        price: 699.99,
        cost: 400.00,
        stockQuantity: 100,
        lowStockThreshold: 20,
        unit: 'piece',
        status: 'active'
    },
    {
        name: 'Office Desk',
        description: 'Modern office desk',
        sku: 'FURN-001',
        category: 'Furniture',
        price: 299.99,
        cost: 150.00,
        stockQuantity: 30,
        lowStockThreshold: 5,
        unit: 'piece',
        status: 'active'
    }
];

const sampleUsers = [
    {
        name: 'Manager User',
        email: 'manager@example.com',
        password: 'manager123',
        role: 'manager'
    },
    {
        name: 'Staff User',
        email: 'staff@example.com',
        password: 'staff123',
        role: 'staff'
    }
];

const createSampleOrders = async (products, users) => {
    const orders = [];
    const orderTypes = ['sale', 'purchase'];
    const statuses = ['pending', 'processing', 'completed'];

    for (let i = 0; i < 10; i++) {
        const type = orderTypes[Math.floor(Math.random() * orderTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const user = users[Math.floor(Math.random() * users.length)];

        const order = await Order.create({
            orderNumber: `${type.toUpperCase()}-${Date.now()}-${i}`,
            type,
            status,
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            customerName: type === 'sale' ? 'Sample Customer' : 'Sample Supplier',
            customerEmail: type === 'sale' ? 'customer@example.com' : 'supplier@example.com',
            createdById: user.id
        });

        // Add 1-3 items to each order
        const numItems = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 5) + 1;
            
            await OrderItem.create({
                OrderId: order.id,
                ProductId: product.id,
                quantity,
                price: type === 'sale' ? product.price : product.cost,
                subtotal: type === 'sale' ? 
                    product.price * quantity : 
                    product.cost * quantity
            });
        }

        await order.calculateTotal();
        orders.push(order);
    }

    return orders;
};

const seed = async () => {
    try {
        // Create sample users
        const users = await Promise.all(
            sampleUsers.map(user => User.create(user))
        );
        logger.info('Sample users created successfully');

        // Create sample products
        const products = await Promise.all(
            sampleProducts.map(product => Product.create(product))
        );
        logger.info('Sample products created successfully');

        // Create sample orders
        const orders = await createSampleOrders(products, users);
        logger.info('Sample orders created successfully');

        logger.info('Database seeding completed successfully');
    } catch (error) {
        logger.error('Error during seeding:', error);
        process.exit(1);
    }
};

// Run seeding if this file is run directly
if (require.main === module) {
    seed();
}

module.exports = seed; 