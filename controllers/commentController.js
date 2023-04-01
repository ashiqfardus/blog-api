const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../model/User/User");
const Comment = require("../model/Comment/Comment");
const Post = require('../model/Post/Post')

// @desc Get all comments
// @route GET api/v1/comments
// access public
const getAllComments = asyncHandler(async (req, res, next)=>{
    try{
        const comments = await Comment.find();
        res.status(200).json({
            success:true,
            data: comments
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc Create single tag
// @route POST api/v1/tags
// access private
const createSingleComment = asyncHandler(async (req, res, next)=>{
    const user = req.user.id;
    const {post, description} = req.body;
    try{
        //check if post is empty
        if (post===null || post ===''){
            return next(new ErrorResponse('Post id required', 400));
        }

        //check if the post exists
        const postData = await Post.findOne({_id:post});
        if (!postData){
            return next(new ErrorResponse('Post not found', 404));
        }


        //check if description is empty
        if (description===null || description ===''){
            return next(new ErrorResponse('Description is required', 400));
        }

        const comment = await Comment.create({
            post,
            user: user,
            description
        })
        if (!comment){
            return next(new ErrorResponse('Something went wrong', 400));
        }
        postData.comments.push(comment._id);
        await postData.save({validateBeforeSave:false});

        res.status(201).json({
            success:true,
            data: comment
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});




// @desc UPDATE single comment
// @route PUT api/v1/comments/:id
// access private
const updateSingleComment = asyncHandler(async (req, res, next)=>{
    const commentId = req.params.id;
    const {description} = req.body;
    const userId = req.user.id;
    try{
        //check is title is empty
        if (description===null || description ==='' || description===undefined){
            return next(new ErrorResponse('Description is required', 400));
        }


        const comment = await Comment.findById(commentId);
        if (!comment){
            return next(new ErrorResponse('Comment not found.', 404));
        }

        if (comment.user != userId){
            return next(new ErrorResponse('You don\'t have access to edit this comment.', 404));
        }

        //update category
        const commentUpdate = await Comment.findByIdAndUpdate(commentId,{
            description
        },{
            new:true,
            runValidators:true
        });
        if (!commentUpdate){
            return next(new ErrorResponse('Something went wrong.', 400));
        }
        res.status(200).json({
            success:true,
            data: commentUpdate
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc Delete single tag
// @route DELETE api/v1/tags/:id
// access private
const deleteSingleComment = asyncHandler(async (req, res, next)=>{
    const commentId = req.params.id;
    const userId = req.user.id;
    try{
        const comment = await Comment.findById(commentId);
        if (!comment){
            return next(new ErrorResponse('Comment not found.', 404));
        }

        if (comment.user != userId && req.user.role === 'Guest'){
            return next(new ErrorResponse('You don\'t have access to delete this comment.', 404));
        }

        const postData = await Post.findOne({_id: comment.post});
        if (!postData){
            return next(new ErrorResponse('Post not found', 404));
        }

        const isComment = postData.comments.includes(commentId);
        if (isComment){
            postData.comments = postData.comments.filter(comment=>comment != commentId);
            await postData.save();
        }

        const deleteComment = await Comment.findByIdAndDelete(commentId);
        if (!deleteComment){
            return next(new ErrorResponse('Something went wrong.', 400));
        }
        res.status(200).json({
            success:true,
            message:"Comment has been deleted."
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


module.exports = {getAllComments, createSingleComment, updateSingleComment, deleteSingleComment};