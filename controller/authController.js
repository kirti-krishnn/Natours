const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signUp= catchAsync(async(req,res,next)=>{
    const user = await User.
});
