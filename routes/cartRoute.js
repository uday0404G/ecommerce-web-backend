const express = require('express');
const router = express.Router();
const Cart = require('../model/cartmodel');
const { auth } = require('../middleware/auth');

// Add to cart
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity, price } = req.body;
        const userId = req.user.userId;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({
                userId,
                items: [{ product: productId, quantity, price }],
                totalAmount: price * quantity
            });
        } else {
            const existingItem = cart.items.find(item => 
                item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity, price });
            }

            cart.totalAmount = cart.items.reduce((total, item) => 
                total + (item.price * item.quantity), 0
            );
        }

        await cart.save();
        await cart.populate('items.product');
        
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
});

// Get user's cart
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId })
            .populate('items.product');
        res.status(200).json(cart || { items: [], totalAmount: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});

// Get all carts (Admin only)
router.get('/all', auth, async (req, res) => {
    try {
        // Verify if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const carts = await Cart.find()
            .populate('userId', 'name email')
            .populate('items.product')
            .sort({ createdAt: -1 });

        // Calculate total stats
        const stats = carts.reduce((acc, cart) => {
            return {
                totalOrders: acc.totalOrders + 1,
                totalRevenue: acc.totalRevenue + cart.totalAmount
            };
        }, { totalOrders: 0, totalRevenue: 0 });

        res.status(200).json({
            carts,
            stats
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching cart data', 
            error: error.message 
        });
    }
});

module.exports = router; 