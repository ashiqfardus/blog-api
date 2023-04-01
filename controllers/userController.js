const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../model/User/User");
const Post = require("../model/Post/Post");
const Tag = require("../model/Tag/Tag");
const Comment = require("../model/Comment/Comment");
const Category = require("../model/Category/Category");



// @desc Get all  users
// @route GET api/v1/users
// access private
const getAllUsers = asyncHandler(async (req, res, next)=>{
    try{
        const users = await User.find();
        res.status(200).json({
            success:true,
            data: users
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc Get single  users
// @route GET api/v1/users/:id
// access private
const getSingleUser = asyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.params.id);
    try{
        res.status(200).json({
            success:true,
            data: user
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
})

// @desc Update single  users
// @route PUT api/v1/users/:id
// access private
const updateSingleUser = asyncHandler(async (req,res,next)=>{
    const userData = await User.findById(req.params.id);
    const {firstname, lastname, email, isAdmin, role} = req.body
    try{
        if (!userData){
            return next(new ErrorResponse('User not found.', 404))
        }

        //check is the email already exists
        const emailTaken = await User.findOne({email:email});
        if (emailTaken){
            return next(new ErrorResponse('Email has already been registered', 400));
        }

        const user = await User.findByIdAndUpdate(userData.id, req.body,{
            new:true,
            runValidators:true
        })


        res.status(200).json({
            success:true,
            message:'User has been updated',
            data: user
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc Delete single  users
// @route DELETE api/v1/users/:id
// access private
const deleteSingleUser = asyncHandler(async (req,res,next)=>{
    const userData = await User.findById(req.params.id);
    const currentUserId = req.user.id;
    try{
        //check if user exists
        if (!userData){
            return next(new ErrorResponse('User not found.', 404))
        }

        //check is user is logged in user
        if (userData.id === currentUserId){
            return next(new ErrorResponse('Logged in user can\'t be deleted', 400));
        }

        //delete associated posts
        const deletedPost = await Post.deleteMany({user:userData.id});
        if (!deletedPost){
            return next(new ErrorResponse('Associated posts couldn\'t delete.', 400));
        }

        //delete associated tags
        const deletedTag = await Tag.deleteMany({user:userData.id});
        if (!deletedTag){
            return next(new ErrorResponse('Associated tags couldn\'t delete.', 400));
        }

        //delete associated categories
        const deletedCategory = await Category.deleteMany({user:userData.id});
        if (!deletedCategory){
            return next(new ErrorResponse('Associated categories couldn\'t delete.', 400));
        }

        //delete associated comments
        const deletedComment = await Comment.deleteMany({user:userData.id});
        if (!deletedComment){
            return next(new ErrorResponse('Associated comments couldn\'t delete.', 400));
        }

        //delete user
        const deleteUser = await User.findByIdAndDelete(userData.id);
        if(!deleteUser){
            return next(new ErrorResponse('Something went wrong.', 400));
        }

        res.status(200).json({
            success:true,
            message:"user has been deleted."
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
})



module.exports = {
    getAllUsers,
    getSingleUser,
    updateSingleUser,
    deleteSingleUser
}