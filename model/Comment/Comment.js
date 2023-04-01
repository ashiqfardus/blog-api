const mongoose = require('mongoose');

//create comment schema
const commentSchema = new mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:[true, 'Post is required.'],
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, 'User is required.'],
    },
    description:{
        type:String,
        required:[true, 'Comment description is required.'],
    },
},
    {
    timestamps:true
});

//compile Comment model
const Comment = mongoose.model('Comment',commentSchema);
module.exports = Comment;