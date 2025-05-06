const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Product } = require('./product');
const { User } = require('./user');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.ENUM('sale', 'purchase'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    customerEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    customerPhone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shippingAddress: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    }
});

// Associations
Order.belongsTo(User, { as: 'createdBy' });
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
OrderItem.belongsTo(Product);

// Hooks
OrderItem.addHook('afterCreate', async (orderItem) => {
    const order = await Order.findByPk(orderItem.OrderId);
    const product = await Product.findByPk(orderItem.ProductId);
    
    if (order.type === 'sale') {
        await product.updateStock(orderItem.quantity, 'subtract');
    } else {
        await product.updateStock(orderItem.quantity, 'add');
    }
});

// Instance methods
Order.prototype.calculateTotal = async function() {
    const items = await OrderItem.findAll({
        where: { OrderId: this.id }
    });
    
    this.totalAmount = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    await this.save();
    return this;
};

module.exports = {
    Order,
    OrderItem
}; 