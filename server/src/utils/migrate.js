const { sequelize } = require('../config/database');
const { User } = require('../models/user');
const { Product } = require('../models/product');
const { Order, OrderItem } = require('../models/order');
const logger = require('./logger');

const migrate = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        logger.info('Database connection has been established successfully.');

        // Sync all models
        await sequelize.sync({ force: true });
        logger.info('Database schema has been synchronized.');

        // Create default admin user
        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });
        logger.info('Default admin user has been created.');

        logger.info('Migration completed successfully.');
    } catch (error) {
        logger.error('Error during migration:', error);
        process.exit(1);
    }
};

// Run migration if this file is run directly
if (require.main === module) {
    migrate();
}

module.exports = migrate; 