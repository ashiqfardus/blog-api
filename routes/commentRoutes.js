const express = require('express');
const {isLogin, authorizeUser} = require("../middlewares/auth");
const {getAllComments, createSingleComment, updateSingleComment, deleteSingleComment} = require("../controllers/commentController");
const commentRouter = express.Router();


commentRouter
    .route('/')
    .get(getAllComments)
    .post(isLogin, createSingleComment)


commentRouter
    .route('/:id')
    .put(isLogin, updateSingleComment)
    .delete(isLogin, deleteSingleComment)

module.exports = commentRouter;