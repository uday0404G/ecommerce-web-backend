const express = require('express');
const categoryRouter = express.Router();

const { auth, authorizeAdmin } = require('../middleware/auth');
const Category = require('../model/catagorymodel');

// Create category (admin only)
categoryRouter.post('/', auth, authorizeAdmin, async (req, res) => {
    try {
        const { name,  } = req.body;
        
        const category = new Category({
            name,
           
        });

        await category.save();
        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
});

// Get all categories
categoryRouter.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});




module.exports = categoryRouter;
