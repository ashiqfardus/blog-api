const mongoose = require('mongoose');

//create scheema

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'Post title is required.'],
        trim:true
    },
    description:{
        type:String,
        required:[true, 'Post description is required.'],
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:[true, 'Category is required.'],
    },
    tags:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tag",
        required:[true, 'Tag is required.'],
    }],
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    dislikes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment",
    }],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, 'Author is required.']
    },
    photo:{
       type:String,
        required:[true, 'Post image is required.']
    }
},
    {
        timestamps:true,
        toJSON:{virtuals:true}
    });

// //get like count
// postSchema.virtual('likeCount').get(function () {
//     return this.likes.length;
// });
//
// //get dislike count
// postSchema.virtual('dislikeCount').get(function () {
//     return this.dislikes.length;
// });

//get days count of post
// postSchema.virtual('daysAgo').get(function () {
//     const post = this;
//     const date = new Date(post.createdAt);
//     const daysAgo = Math.floor((Date.now() - date) / 86400000);
//     return daysAgo === 0 ? 'Today' : daysAgo===1 ? "Yesterday" : `${daysAgo} days ago`
// })


//compile Post model
const Post = mongoose.model('Post',postSchema);
module.exports = Post;