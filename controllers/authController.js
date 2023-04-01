const User = require("../model/User/User");
const bcrypt = require('bcryptjs');
const generateToken = require("../utils/jwt");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const path = require("path");

// @desc Register a new user
// @route POST api/v1/auth/register
// access public
const userRegister = asyncHandler(async (req, res, next) => {
    const {
        firstname,
        lastname,
        profilePhoto,
        email,
        password
    } = req.body;
    try {
        //check if email exists
        const userFound = await User.findOne({email});
        if (userFound){
            return next(new ErrorResponse('User already registered with this email.', 400))
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        //create the user
        const user = await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword
        })

        const token = generateToken(user.id);
        const options ={
            expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
            httpOnly:true
        };

        res.status(200)
            .cookie('token',token,options)
            .json({
                success: true,
                data: {
                    firstname:user.firstname,
                    lastname:user.lastname,
                    email:user.email,
                    isAdmin:user.isAdmin,
                    token:token,
                }
            });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400))
    }
});

// @desc login user
// @route POST api/v1/auth/login
// access public
const userLogin = asyncHandler(async (req, res,next) => {
    const {email, password} = req.body;

    try {
        //validate email & password
        if (!email || !password){
            return next(new ErrorResponse('Please enter email & password to login', 400));
        }
        //check if email exists
        const userFound = await User.findOne({email}).select('+password');

        //verify password
        const isPasswordMatched = await bcrypt.compare(password, userFound.password);

        if (!userFound || !isPasswordMatched){
            return next(new ErrorResponse('Invalid login credentials.', 400));
        }
        const token = generateToken(userFound._id);
        const options ={
            expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
            httpOnly:true
        };

        res.status(200)
            .cookie('token',token,options)
            .json({
                success: true,
                data: {
                    firstname:userFound.firstname,
                    lastname:userFound.lastname,
                    email:userFound.email,
                    isAdmin:userFound.isAdmin,
                    token:token,
                }
            });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
})

// @desc get logged in user profile
// @route POST api/v1/auth/profile
// access private

const userProfile = asyncHandler(async (req, res, next)=>{
    try{
        const user = await User.findById(req.user.id).populate({
            path:'posts',
            select:{title:1, description:1}
        });
        res.status(200).json({
            success:true,
            data:user
        })
    }
    catch (error) {
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc get logged in user dashboard
// @route POST api/v1/auth/dashboard
// access private

const userDashboard = asyncHandler(async (req, res, next)=>{
    try{
        const user = await User.findById(req.user.id)
        .select('firstname lastname, ')
        .populate([{
            path:'posts',
            select:{title:1, description:1}
        },{
            path:'likes',
            select:{title:1, description:1}
        }]);
        res.status(200).json({
            success:true,
            data:user
        })
    }
    catch (error) {
        return next(new ErrorResponse(error.message, 400))
    }
});


// @desc update user profile pic
// @route PUT api/v1/auth/profile/:id/photo
// access private

const updateProfilePhoto = asyncHandler(async (req, res, next)=>{
    const userId = req.user.id;
    try{
        if (!req.files){
            return next(
                new ErrorResponse(`Please upload a file`,404)
            );
        }
        const file = req.files.image;

        //make sure file is photo
        if (!file.mimetype.startsWith('image')){
            return next(
                new ErrorResponse(`File type must be an image`,400)
            );
        }

        //check file size
        if (file.size > process.env.MAX_FILE_UPLOAD){
            return next(
                new ErrorResponse(`File size must be within ${process.env.MAX_FILE_UPLOAD} KB `,400)
            );
        }

        //create custom file name
        file.name = `photo_${req.user.id}${path.parse(file.name).ext}`;
        file.mv(`${process.env.FILE_UPLOAD_PATH}/user_image/${file.name}`, async err =>{
            if (err){
                console.log(err);
                return next(
                    new ErrorResponse(`Problem with file upload`,500)
                );
            }

            await User.findByIdAndUpdate(req.user.id, {profilePhoto:file.name});
            res.status(201).json({
                success:true,
                message:`User Image has been uploaded.`
            })
        })
    }
    catch (error) {
        return next(new ErrorResponse(error.message, 400))
    }
});


//@desc     Logout user & clear cookie
//@route    GET /api/v1/auth/logout
//@access   private

const logout = asyncHandler(async (req,res,next)=>{
    res.cookie('token','none',{
        expires:new Date(Date.now()+10*1000),
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        data:{}
    })

});


//@desc     Update user info
//@route    PUT /api/v1/auth/profile/update
//@access   private

const updateProfileInfo = asyncHandler(async (req,res,next)=>{
    const userId = req.user.id;
    const {email,firstname, lastname} = req.body;
    try{
        //check is the email already exists
        const emailTaken = await User.findOne({email:email});
        if (emailTaken){
            return next(new ErrorResponse('Email has already been registered', 400));
        }

        //update user
        const user = await User.findByIdAndUpdate(userId, {
            firstname,
            lastname,
            email
        },
        {
            new:true,
            runValidators:true
        });

        res.status(201).json({
            success:true,
            data:user
        })

    }
    catch (error) {
        return next(new ErrorResponse(error.message, 400))
    }
});

//@desc     Update user password
//@route    PUT /api/v1/auth/updatepassword
//@access   private

const updateProfilePassword = asyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    const {currentPassword, newPassword, confirmPassword} = req.body;
    try{
        //check is current password is empty
        if (currentPassword == null || currentPassword === ''){
            return next(new ErrorResponse('Current password is required.', 400));
        }

        //check if new password is empty
        if (newPassword == null || newPassword === ''){
            return next(new ErrorResponse('New password is required.', 400));
        }

        //check is confirm password is empty
        if (confirmPassword == null || confirmPassword === ''){
            return next(new ErrorResponse('Confirm password is required.', 400));
        }

        //check if new password match
        if (newPassword!==confirmPassword){
            return next(new ErrorResponse('New password doesn\'t match.', 400));
        }

        //check if current password match
        const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatched){
            return next(new ErrorResponse('Current password doesn\'t match.', 400));
        }

        //check if new password is current password
        if (currentPassword === newPassword){
            return next(new ErrorResponse('New password can\'t be current password.', 400));
        }

        //hash password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        const token = generateToken(user._id);
        const options ={
            expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
            httpOnly:true
        };

        res.status(200)
            .cookie('token',token,options)
            .json({
                success: true,
                message:'Password has been updated',
                data: {
                    token:token,
                }
            });
    }
    catch (error) {
        return next(new ErrorResponse(error.message, 400))
    }

});


module.exports = {
    userRegister,
    userLogin,
    userProfile,
    updateProfilePhoto,
    logout,
    updateProfileInfo,
    updateProfilePassword,
    userDashboard
}