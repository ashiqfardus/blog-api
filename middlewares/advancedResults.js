const Post = require("../model/Post/Post");
const Category = require("../model/Category/Category");
const redisClient = require('../utils/redisClient');

const advancedResults = (model,cacheKey, populate)=>async (req, res, next)=>{

    //cached data
    const cacheData = await redisClient.get(cacheKey);
    if (cacheData){
        const data = JSON.parse(cacheData);

        //pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5;
        const startIndex = (page-1)*limit;
        const endIndex = (page)*limit;
        const total = await model.countDocuments();
        //pagination result
        const pagination = {};
        if (endIndex<total){
            pagination.next = {
                page:page+1,
                limit
            }
        }
        if (startIndex>0){
            pagination.prev = {
                page:page-1,
                limit
            }
        }

        res.advancedResults = {
            success:true,
            count:data.length,
            pagination,
            data:data
        }
        next();
    }
    else {

        //copy req.query
        const reqQuery = {...req.query};

        //fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        //loop over remove fields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        //create query string
        let queryStr = JSON.stringify(reqQuery);

        //create operators ($gt, $gte, $lte, $lt)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        //finding resources
        let query = model.find(JSON.parse(queryStr));

        //SELECT fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        //sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        //pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5;
        const startIndex = (page - 1) * limit;
        const endIndex = (page) * limit;
        const total = await model.countDocuments();
        // console.log(total);

        query = query.skip(startIndex).limit(limit);

        if (populate) {
            query = query.populate(populate);
        }

        //executing query
        const results = await query;

        //cache data
        await redisClient.set(cacheKey,JSON.stringify(results), 'EX',3600);

        //pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.advancedResults = {
            success: true,
            count: results.length,
            pagination,
            data: results
        }
        next();
    }
}

module.exports = advancedResults;