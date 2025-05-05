// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarCollapse = document.getElementById('sidebarCollapse');
const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
const mainContent = document.getElementById('main-content');
const content = document.getElementById('content');
const themeToggle = document.getElementById('themeToggle');

// Theme Management
const theme = {
    init() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },
    toggle() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
    }
};

// Event Listeners
sidebarCollapse.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('pl-0');
});

mobileSidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('show');
    toggleSidebarOverlay();
});

themeToggle.addEventListener('click', () => {
    theme.toggle();
});

// Sidebar Overlay
function toggleSidebarOverlay() {
    const existingOverlay = document.querySelector('.sidebar-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    } else {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.remove();
        });
        document.body.appendChild(overlay);
    }
}

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 1024) {
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.remove();
            sidebar.classList.remove('show');
        }
    }, 100);
});

// Page Router
const router = {
    currentPage: 'dashboard',
    navigate(page) {
        this.currentPage = page;
        this.render();
        
        // Close mobile sidebar when navigating
        if (window.innerWidth < 1024) {
            sidebar.classList.remove('show');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.remove();
        }
    },
    render() {
        const pages = {
            dashboard: renderDashboard,
            products: renderProducts,
            stock: renderStock,
            orders: renderOrders,
            reports: renderReports
        };
        
        if (pages[this.currentPage]) {
            mainContent.innerHTML = '<div class="flex justify-center items-center h-64"><div class="loading-spinner"></div></div>';
            setTimeout(() => {
                pages[this.currentPage]();
                updateActiveLink(this.currentPage);
            }, 300);
        }
    }
};

// Update active link in sidebar
function updateActiveLink(page) {
    document.querySelectorAll('#sidebar a').forEach(link => {
        link.classList.remove('menu-item-active');
        if (link.dataset.page === page) {
            link.classList.add('menu-item-active');
        }
    });
}

// Event delegation for navigation
document.querySelector('#sidebar').addEventListener('click', (e) => {
    const link = e.target.closest('a[data-page]');
    if (link) {
        e.preventDefault();
        const page = link.dataset.page;
        router.navigate(page);
    }
});

// Chart.js default configuration
Chart.defaults.color = '#9CA3AF';
Chart.defaults.borderColor = '#374151';

// Render Functions
function renderDashboard() {
    // Calculate inventory statistics
    const totalProducts = mockData.products.length;
    const totalInventoryValue = mockData.products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const lowStockThreshold = 30;
    const lowStockItems = mockData.products.filter(product => product.stock < lowStockThreshold).length;
    const categories = [...new Set(mockData.products.map(product => product.category))].length;

    const dashboardHTML = `
        <div class="space-y-6">
            <!-- Inventory Overview Section -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Inventory Overview</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Total Products Card -->
                    <div class="dashboard-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-blue-600 dark:text-blue-200">Total Products</p>
                                <h3 class="text-2xl font-bold text-blue-700 dark:text-blue-100 mt-2">${totalProducts}</h3>
                                <p class="text-xs text-blue-500 dark:text-blue-300 mt-1">Across all categories</p>
                            </div>
                            <div class="bg-blue-200 dark:bg-blue-700 rounded-full p-3">
                                <i class="fas fa-box text-xl text-blue-600 dark:text-blue-200"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Total Inventory Value Card -->
                    <div class="dashboard-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-green-600 dark:text-green-200">Total Inventory Value</p>
                                <h3 class="text-2xl font-bold text-green-700 dark:text-green-100 mt-2">$${totalInventoryValue.toLocaleString()}</h3>
                                <p class="text-xs text-green-500 dark:text-green-300 mt-1">+8.2% from last month</p>
                            </div>
                            <div class="bg-green-200 dark:bg-green-700 rounded-full p-3">
                                <i class="fas fa-dollar-sign text-xl text-green-600 dark:text-green-200"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Low Stock Items Card -->
                    <div class="dashboard-card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-red-600 dark:text-red-200">Low Stock Items</p>
                                <h3 class="text-2xl font-bold text-red-700 dark:text-red-100 mt-2">${lowStockItems}</h3>
                                <p class="text-xs text-red-500 dark:text-red-300 mt-1">Items below threshold</p>
                            </div>
                            <div class="bg-red-200 dark:bg-red-700 rounded-full p-3">
                                <i class="fas fa-exclamation-triangle text-xl text-red-600 dark:text-red-200"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Categories Card -->
                    <div class="dashboard-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-purple-600 dark:text-purple-200">Categories</p>
                                <h3 class="text-2xl font-bold text-purple-700 dark:text-purple-100 mt-2">${categories}</h3>
                                <p class="text-xs text-purple-500 dark:text-purple-300 mt-1">Active categories</p>
                            </div>
                            <div class="bg-purple-200 dark:bg-purple-700 rounded-full p-3">
                                <i class="fas fa-tags text-xl text-purple-600 dark:text-purple-200"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inventory Alerts Section -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Inventory Alerts</h2>
                <div class="dashboard-card">
                    <div class="space-y-4">
                        ${mockData.products.map(product => {
                            const stockPercentage = (product.stock / 100) * 100; // Assuming 100 is max stock
                            const getStockStatus = (stock) => {
                                if (stock < 30) return ['bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', 'Critical'];
                                if (stock < 50) return ['bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', 'Warning'];
                                return ['bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', 'Good'];
                            };
                            const [statusClass, statusText] = getStockStatus(product.stock);
                            return `
                                <div class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-dark-200 shadow-sm">
                                    <div class="flex items-center space-x-4">
                                        <div class="flex-shrink-0">
                                            <i class="fas fa-box text-gray-400 dark:text-gray-500"></i>
                                        </div>
                                        <div>
                                            <h4 class="text-sm font-medium text-gray-900 dark:text-white">${product.name}</h4>
                                            <p class="text-xs text-gray-500 dark:text-gray-400">${product.category}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-4">
                                        <div class="w-32">
                                            <div class="h-2 bg-gray-200 dark:bg-dark-300 rounded-full">
                                                <div class="h-2 rounded-full ${stockPercentage < 30 ? 'bg-red-500' : stockPercentage < 50 ? 'bg-yellow-500' : 'bg-green-500'}"
                                                     style="width: ${stockPercentage}%"></div>
                                            </div>
                                        </div>
                                        <div class="w-20 text-right">
                                            <span class="px-2 py-1 text-xs rounded-full ${statusClass}">${statusText}</span>
                                        </div>
                                        <div class="w-16 text-right">
                                            <span class="text-sm font-medium text-gray-900 dark:text-white">${product.stock} units</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="dashboard-card">
                    <div class="card-header mb-4">
                        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Sales Overview</h2>
                    </div>
                    <div class="chart-container">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
                <div class="dashboard-card">
                    <div class="card-header mb-4">
                        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">Category Distribution</h2>
                    </div>
                    <div class="chart-container">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = dashboardHTML;
    
    // Initialize Charts
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: mockData.salesData.monthly.map(item => item.month),
            datasets: [{
                label: 'Monthly Sales',
                data: mockData.salesData.monthly.map(item => item.sales),
                borderColor: '#3B82F6',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(156, 163, 175, 0.1)'
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6B7280'
                    }
                }
            }
        }
    });

    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: mockData.salesData.categoryDistribution.map(item => item.category),
            datasets: [{
                data: mockData.salesData.categoryDistribution.map(item => item.percentage),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  // Blue
                    'rgba(16, 185, 129, 0.8)',  // Green
                    'rgba(245, 158, 11, 0.8)',  // Yellow
                    'rgba(239, 68, 68, 0.8)'    // Red
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#6B7280',
                        font: {
                            size: 12
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function renderProducts() {
    const productsHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Products</h2>
                <button class="btn btn-primary">Add Product</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mockData.products.map(product => `
                            <tr>
                                <td>#${product.id}</td>
                                <td>${product.name}</td>
                                <td>${product.category}</td>
                                <td>$${product.price.toFixed(2)}</td>
                                <td>${product.stock}</td>
                                <td>
                                    <button class="btn btn-primary">Edit</button>
                                    <button class="btn btn-danger">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = productsHTML;
}

function renderStock() {
    const stockHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Stock Movements</h2>
                <button class="btn btn-primary">Record Movement</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mockData.stockMovements.map(movement => `
                            <tr>
                                <td>#${movement.id}</td>
                                <td>${mockData.products.find(p => p.id === movement.productId).name}</td>
                                <td>${movement.type.toUpperCase()}</td>
                                <td>${movement.quantity}</td>
                                <td>${movement.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = stockHTML;
}

function renderOrders() {
    const ordersHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Orders</h2>
                <button class="btn btn-primary">New Order</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mockData.orders.map(order => `
                            <tr>
                                <td>#${order.id}</td>
                                <td>${order.date}</td>
                                <td>${order.status}</td>
                                <td>$${order.total.toFixed(2)}</td>
                                <td>
                                    <button class="btn btn-primary">View</button>
                                    <button class="btn btn-success">Update</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = ordersHTML;
}

function renderReports() {
    const reportsHTML = `
        <div class="grid">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Sales Trends</h2>
                </div>
                <div class="chart-container">
                    <canvas id="salesTrendChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Top Products</h2>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Total Sales</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mockData.products.slice(0, 5).map(product => `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${Math.floor(Math.random() * 100)}</td>
                                    <td>$${(product.price * Math.floor(Math.random() * 100)).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    mainContent.innerHTML = reportsHTML;
    
    // Initialize Sales Trend Chart
    const salesTrendCtx = document.getElementById('salesTrendChart').getContext('2d');
    new Chart(salesTrendCtx, {
        type: 'bar',
        data: {
            labels: mockData.salesData.monthly.map(item => item.month),
            datasets: [{
                label: 'Sales Trend',
                data: mockData.salesData.monthly.map(item => item.sales),
                backgroundColor: '#3B82F6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#D1D5DB'
                    }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#D1D5DB' },
                    grid: { color: '#374151' }
                },
                x: {
                    ticks: { color: '#D1D5DB' },
                    grid: { color: '#374151' }
                }
            }
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    theme.init();
    router.render();
}); 