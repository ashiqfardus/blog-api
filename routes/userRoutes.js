const express = require('express');
const {getAllUsers, getSingleUser, updateSingleUser, deleteSingleUser} = require('../controllers/userController');
const {isLogin, authorizeUser} = require("../middlewares/auth");
const userRouter = express.Router();

userRouter
    .route('/')
    .get(isLogin, authorizeUser('Admin'), getAllUsers)


userRouter
    .route('/:id')
    .get(isLogin, authorizeUser('Admin'), getSingleUser)
    .put(isLogin, authorizeUser('Admin'), updateSingleUser)
    .delete(isLogin, authorizeUser('Admin'), deleteSingleUser)

module.exports = userRouter;