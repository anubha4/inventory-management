const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    lowStockThreshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
            min: 0
        }
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'piece'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
        defaultValue: 'active'
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['sku']
        },
        {
            fields: ['category']
        },
        {
            fields: ['status']
        }
    ]
});

// Instance methods
Product.prototype.isLowStock = function() {
    return this.stockQuantity <= this.lowStockThreshold;
};

Product.prototype.updateStock = async function(quantity, type = 'add') {
    const newQuantity = type === 'add' 
        ? this.stockQuantity + quantity 
        : this.stockQuantity - quantity;
    
    if (newQuantity < 0) {
        throw new Error('Stock quantity cannot be negative');
    }
    
    this.stockQuantity = newQuantity;
    await this.save();
    return this;
};

module.exports = {
    Product
}; 