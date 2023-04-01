const express = require('express');
const {isLogin, authorizeUser} = require("../middlewares/auth");
const {getAllTags, createSingleTag, getSingleTag, updateSingleTag, deleteSingleTag} = require("../controllers/tagController");
const categoryRouter = express.Router();


categoryRouter
    .route('/')
    .get(getAllTags)
    .post(isLogin, authorizeUser('Admin', 'Editor'), createSingleTag)


categoryRouter
    .route('/:id')
    .get(getSingleTag)
    .put(isLogin, authorizeUser('Admin', 'Editor'), updateSingleTag)
    .delete(isLogin, authorizeUser('Admin', 'Editor'), deleteSingleTag)

module.exports = categoryRouter;