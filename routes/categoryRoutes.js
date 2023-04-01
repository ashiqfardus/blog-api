const express = require('express');
const {isLogin, authorizeUser} = require("../middlewares/auth");
const {getAllCategories, createSingleCategory, getSingleCategory, updateSingleCategory, deleteSingleCategory} = require("../controllers/categoryController");
const categoryRouter = express.Router();

categoryRouter
    .route('/')
    .get(getAllCategories)
    .post(isLogin, authorizeUser('Admin', 'Editor'), createSingleCategory)


categoryRouter
    .route('/:id')
    .get(getSingleCategory)
    .put(isLogin, authorizeUser('Admin', 'Editor'), updateSingleCategory)
    .delete(isLogin, authorizeUser('Admin', 'Editor'), deleteSingleCategory)

module.exports = categoryRouter;