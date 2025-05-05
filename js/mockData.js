const mockData = {
    products: [
        { id: 1, name: 'Laptop', category: 'Electronics', price: 999.99, stock: 50 },
        { id: 2, name: 'Smartphone', category: 'Electronics', price: 699.99, stock: 100 },
        { id: 3, name: 'Desk Chair', category: 'Furniture', price: 199.99, stock: 30 },
        { id: 4, name: 'Coffee Maker', category: 'Appliances', price: 79.99, stock: 25 },
        { id: 5, name: 'Headphones', category: 'Electronics', price: 149.99, stock: 75 }
    ],
    
    orders: [
        { id: 1, date: '2024-03-15', status: 'Delivered', total: 1499.98, items: [1, 5] },
        { id: 2, date: '2024-03-14', status: 'Processing', total: 699.99, items: [2] },
        { id: 3, date: '2024-03-13', status: 'Shipped', total: 279.98, items: [3, 4] },
        { id: 4, date: '2024-03-12', status: 'Delivered', total: 999.99, items: [1] },
        { id: 5, date: '2024-03-11', status: 'Cancelled', total: 149.99, items: [5] }
    ],

    stockMovements: [
        { id: 1, productId: 1, type: 'in', quantity: 10, date: '2024-03-10' },
        { id: 2, productId: 2, type: 'out', quantity: 5, date: '2024-03-11' },
        { id: 3, productId: 3, type: 'in', quantity: 15, date: '2024-03-12' },
        { id: 4, productId: 4, type: 'out', quantity: 3, date: '2024-03-13' },
        { id: 5, productId: 5, type: 'in', quantity: 20, date: '2024-03-14' }
    ],

    salesData: {
        monthly: [
            { month: 'Jan', sales: 12500 },
            { month: 'Feb', sales: 15000 },
            { month: 'Mar', sales: 17500 },
            { month: 'Apr', sales: 14000 },
            { month: 'May', sales: 16000 },
            { month: 'Jun', sales: 19000 }
        ],
        categoryDistribution: [
            { category: 'Electronics', percentage: 45 },
            { category: 'Furniture', percentage: 25 },
            { category: 'Appliances', percentage: 20 },
            { category: 'Other', percentage: 10 }
        ]
    },

    notifications: [
        { id: 1, message: 'Low stock alert: Laptop', type: 'warning', date: '2024-03-15' },
        { id: 2, message: 'New order received #1234', type: 'info', date: '2024-03-15' },
        { id: 3, message: 'Payment confirmed for order #1233', type: 'success', date: '2024-03-14' }
    ]
}; 