const User = require('../models/user.model')
const bcrypt =require('bcrypt')
const jwt =require('jsonwebtoken')
const login =async (req,res,next)=>{
    try {
        const {email ,password}=req.body 
        if(!email || !password){
             return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })  
        }
        const isPassworedCorrect = await bcrypt.compare(password,user.password)
       if(!isPassworedCorrect){
          return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
       }        
       const token = jwt.sign({
        id:user._id,
        role:user.role
       },
    process.env.JWT_SECRET,
    {
        expiresIn:'1d'
    }
    )
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
    } catch (error) {
    next(error) 
  }
    }
 
    const changePassword=async (req,res,next)=>{
      try {
        const {currentPassword , newPassword,confirmPassword}=req.body 
        if(!currentPassword || ! newPassword || !confirmPassword){
          return res.status(400).json({success:false,message:'All password fields are required'})
          }
          if(newPassword !== confirmPassword){
            return res.status(400).json({success:false,message:'New password and confirm password do not match'})
          }
          console.log('REQ USER:', req.user);
         const user = await User.findById(req.user.id);
          if(!user){
            return res.status(404).json({
        success: false,
        message: 'User not found'
      });
          }
   const isPassworedCorrect = await bcrypt.compare(currentPassword,user.password)
   if(!isPassworedCorrect){
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
   }
   user.password =await bcrypt.hash(newPassword,10)
   await user.save()


    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

     } catch (error) {
 next(error)
}
    }

    const getMe = async (req,res,next)=>{
      try {
        const user= await User.findById(req.user.id).select('-password')
        if(!user){
            return res.status(404).json({
        success: false,
        message: 'User not found'
      });
        }
        res.status(200).json({
      success: true,
      user
    });

      } catch (error) {
      next(error) 
      }
    }
module.exports= {login,changePassword,getMe}