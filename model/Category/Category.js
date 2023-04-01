const mongoose = require('mongoose');

//create comment schema
const categorySchema = new mongoose.Schema({
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:[true, 'User is required.'],
        },
        title:{
            type:String,
            required:[true, 'Category title is required.'],
        },
    },
    {
        timestamps:true
    });

//compile Comment model
const Category = mongoose.model('Category',categorySchema);
module.exports = Category;