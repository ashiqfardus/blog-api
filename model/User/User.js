const mongoose = require('mongoose');
const Post = require("../Post/Post");
const { Schema } = mongoose;

//create schema

const userSchema = new mongoose.Schema({
   firstname:{
       type:String,
       required:[true, 'First name is required.']
   },
    lastname:{
        type:String,
        required:[true, 'Last name is required.']
    },
    profilePhoto:{
        type:String,
        default:'no-photo.jpg'
    },
    email:{
        type:String,
        required:[true, 'Please add an email'],
        unique:true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please add a valid email.']
    },
    password:{
        type:String,
        required:[true, 'PLease enter a password'],
        minLength:6,
        select:false
    },
    isAdmin:{
       type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:['Admin','Guest', 'Editor'],
        default:'Guest'
    },
    active:{
       type:Boolean,
        default:true
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }],
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }]
},{
    timestamps:true,
    toJSON:{virtuals:true}
});

// // Get user fullname
// userSchema.virtual('fullname').get(function (){
//     return `${this.firstname} ${this.lastname}`
// });
//
//
// // get post count of the user
// userSchema.virtual('postCount').get(function (){
//     return this.posts.length;
// });


//compile user model
const User = mongoose.model('User',userSchema);
module.exports = User;