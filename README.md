# Inventory Management System (IMS)

A full-stack Inventory Management System built with MERN stack and MySQL.

## Features

- User Authentication with JWT
- Product Management
- Stock Management with real-time updates
- Order Management (Sales & Purchases)
- Reporting System with PDF/CSV export
- Interactive Dashboard with Charts
- Responsive Design

## Tech Stack

- **Frontend**: React.js, TailwindCSS, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT, bcrypt
- **API**: RESTful with HTTPS

## Prerequisites

- Node.js >= 14.x
- MySQL >= 8.x
- npm >= 6.x

## Project Structure

```
inventory-management/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/         # Page components
│       ├── context/       # React context
│       ├── hooks/         # Custom hooks
│       ├── services/      # API services
│       └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
└── docs/                 # Documentation
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Setup Backend:
   ```bash
   cd server
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

3. Setup Frontend:
   ```bash
   cd client
   npm install
   cp .env.example .env  # Configure your environment variables
   npm start
   ```

4. Setup Database:
   - Create MySQL database
   - Run migrations: `npm run migrate`
   - (Optional) Seed data: `npm run seed`

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=inventory_db
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Documentation

Detailed API documentation can be found in the [API Documentation](docs/API.md) file.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HTTPS-only communication
- Input validation and sanitization
- Rate limiting
- CORS protection

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 