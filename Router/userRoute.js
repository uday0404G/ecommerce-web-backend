const express = require('express');
const userRouter = express.Router();
const User = require('../model/usermodel');
const jwt=require("jsonwebtoken");
const { auth, authorizeAdmin } = require('../middleware/auth');
const adminSecret = "Uday"

userRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, secretKey } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // If registering as admin, verify secret key
        if (role === 'admin' && secretKey !== 'your-admin-secret-key') {
            return res.status(403).json({ message: 'Invalid admin secret key' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            'Uday',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            status: "success",
            message: 'Registration successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            status: "error",
            message: 'Registration failed', 
            error: error.message 
        });
    }
});

// Login user
userRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },'Uday',
            { expiresIn: '24h' }
        );

        res.status(200).json({message: 'Login successful', token,});
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Get all users (admin only)
userRouter.get('/all',auth, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

userRouter.get('/profile',auth,(req,res)=>{
        if(req.user.role=="admin"){
            res.send("admin")
        }else{
            res.send("user")
        }
})

// Debug route to check user role
userRouter.get('/check-role', auth, (req, res) => {
    try {
        res.json({
            role: req.user.role,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ message: "Error checking role", error: error.message });
    }
});

module.exports = userRouter;
