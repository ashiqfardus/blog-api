const express = require('express');
const {isLogin, authorizeUser} = require("../middlewares/auth");
const {getAllPosts, createSinglePost, likeSinglePost, dislikeSinglePost, getSinglePost, updateSinglePost, deleteSinglePost} = require("../controllers/postController");
const postRouter = express.Router();
const advancedResults = require('../middlewares/advancedResults');
const Post = require("../model/Post/Post");


postRouter
    .route('/')
    .get(advancedResults(Post,'allPosts', [{
            path:'category',
            select:{
                title:1
            }
        },
        {
            path:'tags',
            select:{
                title:1
            }
        },{
            path: 'user'
        }]
    ),getAllPosts)
    .post(isLogin, authorizeUser('Admin','Editor'),createSinglePost)

postRouter
    .route('/:id')
    .get(getSinglePost)
    .put(isLogin, authorizeUser('Admin', 'Editor'), updateSinglePost)
    .delete(isLogin, authorizeUser('Admin', 'Editor'), deleteSinglePost)

postRouter.route('/:id/like').put(isLogin,likeSinglePost)
postRouter.route('/:id/dislike').put(isLogin,dislikeSinglePost)


module.exports = postRouter;