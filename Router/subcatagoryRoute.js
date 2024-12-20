const express = require('express');
const subCategoryRouter = express.Router();

const { auth, authorizeAdmin } = require('../middleware/auth');
const SubCategory = require('../model/subCatagorymodel');


subCategoryRouter.post('/', auth, authorizeAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        
        const subCategory = new SubCategory({
            name
        });

        await subCategory.save();
        res.status(201).json({ message: 'SubCategory created successfully', subCategory });
    } catch (error) {
        res.status(500).json({ message: 'Error creating subcategory', error: error.message });
    }
});

// Get all subcategories
subCategoryRouter.get('/', async (req, res) => {
    try {
        const subCategories = await SubCategory.find();
        res.status(200).json(subCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subcategories', error: error.message });
    }
});






module.exports = subCategoryRouter;
