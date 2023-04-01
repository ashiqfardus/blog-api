const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require("../model/User/User");
//protect routes
const isLogin = asyncHandler(async  (req, res, next)=>{
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.token){
        token = req.cookies.token
    }
    //Make sure token is exists
    if (!token){
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try{
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = await User.findById(decoded.id);
        next();
    }
    catch (e) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

//Grant accesses to specific roles
const authorizeUser = (...roles)=>{
    return (req,res,next)=>{
        if (!roles.includes(req.user.role)){
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
        }
        next();
    }
}

module.exports = {isLogin, authorizeUser}