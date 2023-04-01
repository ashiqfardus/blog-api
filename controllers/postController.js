const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const redisClient = require('../utils/redisClient');
const Post = require("../model/Post/Post");
const User = require("../model/User/User");
const path = require("path");
const random = require("simple-random-number-generator");
const Category = require("../model/Category/Category");
const Comment = require("../model/Comment/Comment");
const Tag = require("../model/Tag/Tag");
const {resetWatchers} = require("nodemon/lib/monitor/watch");

// @desc Get posts
// @route GET api/v1/posts
// access public
const getAllPosts = asyncHandler(async (req, res, next)=>{
    try{
        res.status(200).json(res.advancedResults);
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc Get single post
// @route GET api/v1/posts/:id
// access public
const getSinglePost = asyncHandler(async (req, res, next)=>{
    const postId = req.params.id;
    try{
        const post = await Post.findById(postId);
        if (!post){
            return next(new ErrorResponse('Post not found.', 404));
        }
        res.status(200).json({
            success:true,
            data: post
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc Create single post
// @route POST api/v1/posts
// access private
const createSinglePost = asyncHandler(async (req, res, next)=>{
    const {title, description, category, tags} = req.body;
    try{
        const tagsId = tags.split(/[ ,]+/);
        //set post author
        const author = await User.findById(req.user);

        //check is category is valid
        const categoryData = await Category.findOne({_id:category});
        if (!categoryData){
            return next(new ErrorResponse(`Category not found.`,404));
        }

        //check is posts has image
        if (!req.files){
            return next(
                new ErrorResponse(`Please upload a file`,404)
            );
        }
        const file = req.files.image;

        //make sure file is photo
        if (!file.mimetype.startsWith('image')){
            return next(
                new ErrorResponse(`File type must be an image`,400)
            );
        }

        //check file size
        if (file.size > process.env.MAX_FILE_UPLOAD){
            return next(
                new ErrorResponse(`File size must be within ${process.env.MAX_FILE_UPLOAD} KB `,400)
            );
        }

        //create custom file name
        let params = {
            min: 5,
            max: 20,
            integer: true
        };
        file.name = `photo_${random(params)}${path.parse(file.name).ext}`;

        file.mv(`${process.env.FILE_UPLOAD_PATH}/post_image/${file.name}`, async err =>{
            if (err){
                console.log(err);
                return next(
                    new ErrorResponse(`Problem with file upload`,500)
                );
            }
        });

        //create post
        const postCreated = await Post.create({
            title,
            description,
            category,
            tags:tagsId,
            user: author.id,
            photo:file.name,
        });

        //associate user to a post. ----Push the post into user post field
        author.posts.push(postCreated);
        await author.save();


        res.status(200).json({
            success:true,
            data: postCreated
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc like one post
// @route PUT api/v1/posts/:id/like
// access private
const likeSinglePost = asyncHandler(async (req, res, next)=>{
    const postId = req.params.id;
    const userId = req.user.id;
    try{
        //check is post exists
        const postData = await Post.findById(postId);
        if (!postData){
            return next(new ErrorResponse('Post not found', 404));
        }
        //check is post disliked
        const isDisliked = postData.dislikes.includes(userId);
        if (isDisliked){
            postData.dislikes = postData.dislikes.filter(dislike=>dislike != userId);
            await postData.save();
        }

        //check is already liked
        const isLiked = postData.likes.includes(userId);
        if (isLiked){
            postData.likes = postData.likes.filter(like=>like != userId);
            await postData.save();
        }
        else{
            postData.likes.push(userId);
            await postData.save();
        }

        //check user liked
        const userData= await User.findById(userId);
        const userLiked = userData.likes.includes(postId);
        if (!userLiked){
            userData.likes.push(postId);
            await userData.save();
        }

        res.status(200).json({
            success:true,
            message:"You have liked the post.",
            data:postData
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc dislike one post
// @route PUT api/v1/posts/:id/like
// access private
const dislikeSinglePost = asyncHandler(async (req, res, next)=>{
    const postId = req.params.id;
    const userId = req.user.id;
    try{
        //check is post exists
        const postData = await Post.findById(postId);
        if (!postData){
            return next(new ErrorResponse('Post not found', 404));
        }
        //check is liked
        const isLiked = postData.likes.includes(userId);
        if (isLiked){
            postData.likes = postData.likes.filter(like=>like != userId);
            await postData.save();
        }

        //check is already liked
        const isDisliked = postData.dislikes.includes(userId);
        if (isDisliked){
            postData.dislikes = postData.dislikes.filter(dislike=>dislike != userId);
            await postData.save();
        }
        else{
            postData.dislikes.push(userId);
            await postData.save();
        }

        res.status(200).json({
            success:true,
            message:"You have disliked the post.",
            data:postData
        });
    }
    catch (error){
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc Update one post
// @route PUT api/v1/posts/:id
// access private
const updateSinglePost = asyncHandler(async (req, res, next)=>{
    let fileName;
    let tagsId;
    const postId = req.params.id;
    const userId = req.user.id;
    const {title, description, category, tags} = req.body;
    let categoryId;
    try {
        //check is post exists
        const postData = await Post.findById(postId);
        if (!postData) {
            return next(new ErrorResponse('Post not found', 404));
        }

        //tags convert to array
        if (tags === null || tags === undefined || tags === '') {
            tagsId = postData.tags
        } else {
            tagsId = tags.split(/[ ,]+/);
        }

        //check is empty category
        if (category === null || category === undefined || category === '') {
            categoryId = postData.category
        }
        else{
            categoryId = category
        }

        //check is category is valid
        const categoryData = await Category.findOne({_id: categoryId});
        if (!categoryData) {
            return next(new ErrorResponse(`Category not found.`, 404));
        }

        //check is posts has image
        if (req.files) {
            const file = req.files.image;

            //make sure file is photo
            if (!file.mimetype.startsWith('image')) {
                return next(
                    new ErrorResponse(`File type must be an image`, 400)
                );
            }

            //check file size
            if (file.size > process.env.MAX_FILE_UPLOAD) {
                return next(
                    new ErrorResponse(`File size must be within ${process.env.MAX_FILE_UPLOAD} KB `, 400)
                );
            }

            //create custom file name
            let params = {
                min: 5,
                max: 20,
                integer: true
            };
            file.name = `photo_${random(params)}${path.parse(file.name).ext}`;
            fileName = file.name;

            await file.mv(`${process.env.FILE_UPLOAD_PATH}/post_image/${file.name}`, async err => {
                if (err) {
                    console.log(err);
                    return next(
                        new ErrorResponse(`Problem with file upload`, 500)
                    );
                }
            });

            await file.unlink(`${process.env.FILE_UPLOAD_PATH}/post_image/${postData.photo}`, async err => {
                if (err) {
                    console.log(err);
                    return next(
                        new ErrorResponse(`Problem with file delete`, 500)
                    );
                }
            });
        } else {
            fileName = postData.photo
        }

        const updatePost = await Post.findByIdAndUpdate(postId, {
            title,
            description,
            categoryId,
            tags: tagsId,
            photo: fileName
        }, {
            new: true,
            runValidators: true
        });

        if (!updatePost) {
            return next(new ErrorResponse('Something went wrong', 400));
        }

        res.status(200).json({
            success: true,
            message: "Post has been updated.",
            data: updatePost
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc Delete one post
// @route DELETE api/v1/posts/:id
// access private
const deleteSinglePost = asyncHandler(async (req, res, next)=>{

    const postId = req.params.id;
    const userId = req.user.id;

    try {
        //check is post exists
        const postData = await Post.findById(postId);
        if (!postData) {
            return next(new ErrorResponse('Post not found', 404));
        }

        //delete associated comments
        const deletedComment = await Comment.deleteMany({post:postId});
        if (!deletedComment){
            return next(new ErrorResponse('Associated comments couldn\'t delete.', 400));
        }

        //delete post
        const deletePost = await Post.findByIdAndDelete(postId);

        if (!deletePost) {
            return next(new ErrorResponse('Something went wrong', 400));
        }

        //update user posts
        const userData = await User.findById(userId);
        const isPost = userData.posts.includes(postId);
        if (isPost){
            userData.posts = userData.posts.filter(post=>post != postId);
            await userData.save();
        }

        res.status(200).json({
            success: true,
            message: "Post has been deleted."
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400))
    }
});

module.exports = {
    getAllPosts,
    createSinglePost,
    likeSinglePost,
    dislikeSinglePost,
    getSinglePost,
    updateSinglePost,
    deleteSinglePost
}