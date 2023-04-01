const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../model/User/User");
const Category = require("../model/Category/Category");

// @desc Get all categories
// @route GET api/v1/categories
// access public
const getAllCategories = asyncHandler(async (req, res, next)=>{
    try{
        const categories = await Category.find();
        res.status(200).json({
            success:true,
            data: categories
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc Create single category
// @route POST api/v1/categories
// access private
const createSingleCategory = asyncHandler(async (req, res, next)=>{
    const user = req.user.id;
    const {title} = req.body;
    try{
        //check is title is empty
        if (title===null || title ===''){
            return next(new ErrorResponse('Title is required', 400));
        }
        const category = await Category.create({
            user: user,
            title
        })
        if (!category){
            return next(new ErrorResponse('Something went wrong', 400));
        }
        res.status(201).json({
            success:true,
            data: category
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc Get single categories
// @route GET api/v1/categories/:id
// access public
const getSingleCategory = asyncHandler(async (req, res, next)=>{
    const categoryId = req.params.id;
    try{
        const category = await Category.findById(categoryId);
        if (!category){
            return next(new ErrorResponse('category not found.', 404));
        }
        res.status(200).json({
            success:true,
            data: category
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc UPDATE single categories
// @route PUT api/v1/categories/:id
// access private
const updateSingleCategory = asyncHandler(async (req, res, next)=>{
    const categoryId = req.params.id;
    const {title} = req.body;
    const userId = req.user.id;
    try{
        //check is title is empty
        if (title===null || title ==='' || title===undefined){
            return next(new ErrorResponse('Title is required', 400));
        }


        const category = await Category.findById(categoryId);
        if (!category){
            return next(new ErrorResponse('category not found.', 404));
        }

        //update category
        const categoryUpdate = await Category.findByIdAndUpdate(categoryId,{
            user:userId,
            title
        },{
            new:true,
            runValidators:true
        });
        if (!categoryUpdate){
            return next(new ErrorResponse('Something went wrong.', 400));
        }
        res.status(200).json({
            success:true,
            data: categoryUpdate
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc Delete single categories
// @route DELETE api/v1/categories/:id
// access private
const deleteSingleCategory = asyncHandler(async (req, res, next)=>{
    const categoryId = req.params.id;
    try{
        const category = await Category.findById(categoryId);
        if (!category){
            return next(new ErrorResponse('category not found.', 404));
        }
        const deleteCategory = await Category.findByIdAndDelete(categoryId);
        if (!deleteCategory){
            return next(new ErrorResponse('Something went wrong.', 400));
        }
        res.status(200).json({
            success:true,
            message:"Category has been deleted."
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


module.exports = {getAllCategories, createSingleCategory, getSingleCategory, updateSingleCategory, deleteSingleCategory};