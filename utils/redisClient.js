const redis = require('redis');
const {model} = require("mongoose");
// Create a Redis client instance
let redisClient;
const redisUrl = '127.0.0.1:6379';
(async () => {
    redisClient = redis.createClient(redisUrl);

    redisClient.on("error", (error) => console.error(`Error : ${error}`));

    await redisClient.connect().then(
        console.log(`Redis connected on ${redisUrl}`)
    );
})();


module.exports = redisClient;