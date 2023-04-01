const mongoose = require('mongoose');

//create comment schema
const tagSchema = new mongoose.Schema({
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:[true, 'User is required.'],
        },
        title:{
            type:String,
            required:[true, 'Tag title is required.'],
        },
    },
    {
        timestamps:true
    });

//compile Comment model
const Tag = mongoose.model('Tag',tagSchema);
module.exports = Tag;