const express = require('express');
const {
    userRegister,
    userLogin,
    userProfile,
    updateProfilePhoto,
    logout,
    updateProfileInfo,
    updateProfilePassword,
    userDashboard
} = require('../controllers/authController');
const {isLogin, authorizeUser} = require("../middlewares/auth");
const authRouter = express.Router();

//register route
authRouter.post('/register', userRegister);

//login route
authRouter.post('/login', userLogin);

//profile route
authRouter.get('/profile/', isLogin, userProfile);

//user dashboard
authRouter.get('/dashboard/', isLogin, userDashboard);

//update profile photo
authRouter.put('/profile/photo', isLogin, updateProfilePhoto);

//update profile info
authRouter.patch('/profile/update', isLogin, updateProfileInfo);

//update user password
authRouter.patch('/profile/update-password', isLogin, updateProfilePassword);

//logout
authRouter.get('/logout', logout);

module.exports = authRouter;