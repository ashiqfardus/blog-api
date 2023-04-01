const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../model/User/User");
const Tag = require("../model/Tag/Tag");

// @desc Get all tags
// @route GET api/v1/tags
// access public
const getAllTags = asyncHandler(async (req, res, next)=>{
    try{
        const tags = await Tag.find();
        res.status(200).json({
            success:true,
            data: tags
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc Create single tag
// @route POST api/v1/tags
// access private
const createSingleTag = asyncHandler(async (req, res, next)=>{
    const user = req.user.id;
    const {title} = req.body;
    try{
        //check is title is empty
        if (title===null || title ===''){
            return next(new ErrorResponse('Title is required', 400));
        }
        const tag = await Tag.create({
            user: user,
            title
        })
        if (!tag){
            return next(new ErrorResponse('Something went wrong', 400));
        }
        res.status(201).json({
            success:true,
            data: tag
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc Get single tag
// @route GET api/v1/tags/:id
// access public
const getSingleTag = asyncHandler(async (req, res, next)=>{
    const tagId = req.params.id;
    try{
        const tag = await Tag.findById(tagId);
        if (!tag){
            return next(new ErrorResponse('Tag not found.', 404));
        }
        res.status(200).json({
            success:true,
            data: tag
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc UPDATE single tag
// @route PUT api/v1/tag/:id
// access private
const updateSingleTag = asyncHandler(async (req, res, next)=>{
    const tagId = req.params.id;
    const {title} = req.body;
    const userId = req.user.id;
    try{
        //check is title is empty
        if (title===null || title ==='' || title===undefined){
            return next(new ErrorResponse('Title is required', 400));
        }


        const tag = await Tag.findById(tagId);
        if (!tag){
            return next(new ErrorResponse('Tag not found.', 404));
        }

        //update category
        const tagUpdate = await Tag.findByIdAndUpdate(tagId,{
            user:userId,
            title
        },{
            new:true,
            runValidators:true
        });
        if (!tagUpdate){
            return next(new ErrorResponse('Something went wrong.', 400));
        }
        res.status(200).json({
            success:true,
            data: tagUpdate
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc Delete single tag
// @route DELETE api/v1/tags/:id
// access private
const deleteSingleTag = asyncHandler(async (req, res, next)=>{
    const tagId = req.params.id;
    try{
        const tag = await Tag.findById(tagId);
        if (!tag){
            return next(new ErrorResponse('Tag not found.', 404));
        }
        const deleteTag = await Tag.findByIdAndDelete(tagId);
        if (!deleteTag){
            return next(new ErrorResponse('Something went wrong.', 400));
        }
        res.status(200).json({
            success:true,
            message:"Tag has been deleted."
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


module.exports = {getAllTags, createSingleTag, getSingleTag, updateSingleTag, deleteSingleTag};