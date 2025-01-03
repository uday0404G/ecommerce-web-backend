const express = require('express');
const cartRouter = express.Router();
const Cart = require('../model/cartmodel');
const { auth } = require('../middleware/auth');

// Add to cart
cartRouter.post('/add', auth, async (req, res) => {
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
cartRouter.get('/', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.userId })
            .populate('items.product');
        res.status(200).json(cart || { items: [], totalAmount: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});

// Update cart item quantity
cartRouter.put('/update/:productId', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;
        const userId = req.user.userId;

        const cart = await Cart.findOne({ userId });
        const item = cart.items.find(item => 
            item.product.toString() === productId
        );

        if (item) {
            item.quantity = quantity;
            cart.totalAmount = cart.items.reduce((total, item) => 
                total + (item.price * item.quantity), 0
            );
            await cart.save();
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
});

// Remove item from cart
cartRouter.delete('/remove/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        const cart = await Cart.findOne({ userId });
        cart.items = cart.items.filter(item => 
            item.product.toString() !== productId
        );
        cart.totalAmount = cart.items.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing item', error: error.message });
    }
});

module.exports = cartRouter; 