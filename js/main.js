// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarCollapse = document.getElementById('sidebarCollapse');
const mainContent = document.getElementById('main-content');
const content = document.getElementById('content');

// Event Listeners
sidebarCollapse.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    content.classList.toggle('collapsed');
});

// Page Router
const router = {
    currentPage: 'dashboard',
    navigate(page) {
        this.currentPage = page;
        this.render();
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
            pages[this.currentPage]();
            updateActiveLink(this.currentPage);
        }
    }
};

// Update active link in sidebar
function updateActiveLink(page) {
    document.querySelectorAll('#sidebar .list-unstyled li').forEach(li => {
        li.classList.remove('active');
    });
    document.querySelector(`#sidebar a[data-page="${page}"]`).parentElement.classList.add('active');
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

// Render Functions
function renderDashboard() {
    const dashboardHTML = `
        <div class="grid">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Sales Overview</h2>
                </div>
                <div class="chart-container">
                    <canvas id="salesChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Category Distribution</h2>
                </div>
                <div class="chart-container">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">Recent Orders</h2>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${mockData.orders.slice(0, 5).map(order => `
                                <tr>
                                    <td>#${order.id}</td>
                                    <td>${order.date}</td>
                                    <td>${order.status}</td>
                                    <td>$${order.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
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
                tension: 0.1
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

    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: mockData.salesData.categoryDistribution.map(item => item.category),
            datasets: [{
                data: mockData.salesData.categoryDistribution.map(item => item.percentage),
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#D1D5DB'
                    }
                }
            }
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
    router.render();
}); 