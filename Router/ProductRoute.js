const express = require('express');
const productRouter = express.Router();
const Product = require('../model/productmodel');
const { auth, authorizeAdmin } = require('../middleware/auth');


productRouter.post('/', auth, authorizeAdmin, async (req, res) => {
    try {
        const { name, description, price, category, subCategory, stock } = req.body;
        
        const product = new Product({
            name,
            description, 
            price,
            category,
            subCategory,
            stock
        });

        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

// Get all products
productRouter.get('/', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category')
            .populate('subCategory');
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Get single product
productRouter.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('subCategory');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Update product (admin only)
productRouter.put('/:id', auth, authorizeAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Delete product (admin only)
productRouter.delete('/:id', auth, authorizeAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

module.exports = productRouter;
