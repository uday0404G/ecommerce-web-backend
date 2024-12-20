const express = require('express');
const userRouter = express.Router();
const User = require('../model/usermodel');
const jwt=require("jsonwebtoken");
const { auth, authorizeAdmin } = require('../middleware/auth');
const adminSecret = "Uday"

userRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password ,role,secretKey} = req.body;
        if(role== "admin"){
            if(secretkey!=adminSecret){
                return res.send({err:"Admin Authoriation Needed !!!"})
            }
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            
        });
        if(role){
            user.role=role
        }

        await user.save();
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Login user
userRouter.post('/login', async (req, res) => {
    try {
        const { email, password, secretKey } = req.body;
        
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


module.exports = userRouter;
