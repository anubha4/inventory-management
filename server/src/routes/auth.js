const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { User } = require('../models/user');
const { AppError } = require('../middleware/errorHandler');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain a number'),
    validateRequest
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
];

// Register new user
router.post('/register', registerValidation, async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return next(new AppError('Email already in use', 400));
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'staff'
        });

        // Generate token
        const token = user.generateAuthToken();

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// Login user
router.post('/login', loginValidation, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.correctPassword(password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // Generate token
        const token = user.generateAuthToken();

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get current user
router.get('/me', protect, async (req, res) => {
    res.json({
        status: 'success',
        data: {
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        }
    });
});

// Update password
router.patch('/update-password', protect, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Check current password
        if (!(await req.user.correctPassword(currentPassword))) {
            return next(new AppError('Current password is incorrect', 401));
        }

        // Update password
        req.user.password = newPassword;
        req.user.passwordChangedAt = new Date();
        await req.user.save();

        // Generate new token
        const token = req.user.generateAuthToken();

        res.json({
            status: 'success',
            data: { token }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 