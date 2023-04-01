const express = require('express');

const dotenv = require('dotenv');
const dbConnect = require('./config/dbConnect');
const redis = require('redis');
const util = require('util');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const commentRoutes = require('./routes/commentRoutes');

const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/error');

const path = require('path')
const fileUpload = require('express-fileupload')
const app = express();

app.use(express.json());
app.use(cookieParser());
//File upload
app.use(fileUpload());
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Load env vars
dotenv.config();

//connect BD
dbConnect();

//routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/comments', commentRoutes);



//Error handlers
app.use(errorHandler);

//404 error handler
app.use("*", (req,res)=>{
    res.status(404).json({
        success:false,
        message: `${req.originalUrl} - Route not found.`
    })
})


//Listen to server
const PORT = process.env.PORT || 9000;

if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`Server connected to ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}
