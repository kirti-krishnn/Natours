const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = function (obj, ...allowedfields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    allowedfields.includes(el);
    newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.UpdateMe = catchAsync(async(req,res,next){

  if(req.body.password || req.body.passwordConfirm){
    next(new AppError("ths link is for updating name and emailid...please use changePAssword for updating password",400))
  }

  const user = await User.findByIdAndUpdate(req.user.id,filterObj(req.body,'name','email'),{
    new:true,
    runValidator:true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: user
    }
  });
})

exports.deleteMe = catchAsync(async(req,res)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false});

  res.status(204).json({
    status: 'success',
    data: null
  });
})

exports.getUser = catchAsync(async(req,res,next)=>{
  const user = await User.findById(req.params.id);

  if(!user){
    next(new AppError("No User document found with the provided id",404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    }
  });


})

exports.createOne = catchAsync(async(req,res,next)=>{
  const user = await User.create(
    {
    "name":req.body.name,
    "email":req.body.email,
    "password": req.body.password,
    "passwordConfirm":req.body.passwordConfirm,
  }
);

res.status(200).json({
  status: 'success',
  data: {
    data: user,
  }
});
})
