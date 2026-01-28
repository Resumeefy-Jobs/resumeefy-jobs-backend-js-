import bcrypt from 'bcryptjs';
import Joi from 'joi';
import crypto from 'crypto';
import User from '../models/User.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import { generateAccessToken, generateRefreshToken } from '../utils/TokenService.js';
import { emailQueue } from '../jobs/emailQueue.js';
import { verifyGoogleToken } from '../utils/googleAuthService.js';
import {sendPasswordResetEmail} from '../utils/EmailService.js';

export const register = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        succeeded: false, 
        message: 'Request body is empty. Please send JSON data with Content-Type: application/json header.',
        errors: ['Request body is required']
      });
    }

    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address.',
        'any.required': 'Email is required.'
      }),
      
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long.',
        'any.required': 'Password is required.'
      }),
      
      confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match.'
      }),

      role: Joi.string().valid('JobSeeker', 'Employer').required().messages({
        'any.only': 'Role must be either JobSeeker or Employer.'
      })
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        succeeded: false, 
        message: 'Validation failed', 
        errors: error.details.map(x => x.message) 
      });
    }

    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        succeeded: false, 
        message: 'User with this email already exists.' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      email,
      passwordHash,
      role,
      verificationToken, 
      isEmailVerified: false
    });

    const savedUser = await newUser.save();

    if (role === 'JobSeeker') {
      await JobSeekerProfile.create({
        user: savedUser._id,
        firstName: 'New',      
        lastName: 'User',      
        experienceLevel: 'Junior' 
      });
    } else if (role === 'Employer') {
      await CompanyProfile.create({
        user: savedUser._id,
        companyName: 'New Company' 
      });
    }

    const combinedString = `${savedUser._id}:${verificationToken}`;
    const code = Buffer.from(combinedString).toString('base64url');

    const port  = process.env.PORT || 5000;
    const verificationLink = `http://localhost:${port}/api/auth/verify-email?code=${code}`;
    var emailHtml = `<h2>Welcome to Resumeefy!</p>
                     <ph3>Please verify your email by clicking the link below:</p>
                     <a href="${verificationLink}">Verify Email</a>`;

    await emailQueue.add('sendVerificationEmail', {
      to: savedUser.email,
      subject: 'Verify your Resumeefy account',
      body: emailHtml
    });

    res.status(201).json({
      succeeded: true,
      message: 'User registered successfully. Please login.',
      data: {
        userId: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      succeeded: false, 
      message: 'Server Error',
      errors: [error.message] 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(401).json({
        succeeded: false,
        message: 'Invalid email or password.'
        
      });
    }

    if(!findUser.passwordHash){
      return res.status(400).json({
        succeeded: false,
        message: 'Pls Login with Google or provide your password.'
      });
    }
    const isMatch = await bcrypt.compare(password, findUser.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        succeeded: false,
        message: 'Invalid email or password.'
      });
    }
    const accessToken = generateAccessToken(findUser);
    const refreshToken = await generateRefreshToken(findUser, req.ip);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 7*24*60*60*1000)
    });

    res.json({
      successed: true,
      message: 'Login successful',
      data: {
        id: findUser._id,
        email: findUser.email,
        role: findUser.role,
        token: accessToken
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      succeeded: false,
      message: 'Server Error',
      errors: [error.message]
    });
  }
}

export const verifyEmail = async (req, res ) => {
  try{
    const { code } = req.query;

    if(!code){
      return res.status(400).json({
        succeeded: false,
        message: 'Verification code is required.'
      });
    }

    const decodedString = Buffer.from(code, 'base64url').toString('utf-8');

    const [userId, token] = decodedString.split(':');

    if(!userId || !token){
      return res.status(400).json({
        succeeded: false,
        message: 'Invalid verification code.'
      });
    } 

    const user = await User.findById(userId);

    if(!user){
      return res.status(404).json({
        succeeded: false,
        message: 'User not found.'
      });
    }

    if(user.isEmailVerified){
      return res.status(200).json({
        succeeded: true,
        message: 'Email is already verified.'
      });
    }

    if(user.verificationToken !== token){
      return res.status(400).json({
        succeeded: false,
        message: 'Invalid or expired verification token.'
      });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      succeeded: true,
      message: 'Email verified successfully./nYou can now log in to your account.'
    });
  }catch(error){
    console.error(error);
    res.status(500).json({
      succeeded: false,
      message: 'Server Error',
      errors: [error.message]
    });
  } 
}

export const googleAuth = async (req, res) =>{
  try{
    const{idToken, role} = req.body;

    if(!idToken)
    {
      return res.status(400).json({
        succeeded: false,
        message: 'Google ID Token is required'
      });
    }

    const googleUser  = await verifyGoogleToken(idToken);
    let user = await User.findOne({email: googleUser.email});

    if(!user){
      if(!role){
        return res.status(400).json({
          succeeded: false,
          message: 'Role is required for new users.'
        });
      }
    }

    user = new User({
      email: googleUser.email,
      passwordHash: 'GOOGLE_AUTH' + Math.random().toString(36),
      role : role,
      isActive: true,
      isEmailVerified: true
    });

    const savedUser = await user.save();

    if(role === 'JobSeeker'){
      await JobSeekerProfile.create({
        user: savedUser._id,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        experienceLevel: 'Junior'
      });
    }

    if(role === 'Employer'){
      await CompanyProfile.create({
        user: savedUser._id,
        companyName: googleUser.firstName ? `${googleUser.firstName}'s Company` : 'New Company'
      })
    }

    const accessToken = generateAccessToken(savedUser);
    const refreshToken = await generateRefreshToken(savedUser, req.ip);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 7*24*60*60*1000)
    });

    res.json({
      succeeded: true,
      message: 'Login successful',
      data: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        token: accessToken
      }
    });
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({
      succeeded: false,
      message: 'Google Authentication Failed',
      errors: [error.message]
    });
  }
};

export const forgotPassword = async (req, res) => 
{
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        succeeded: false,
        message: 'Email is required.'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        succeeded: false,
        message: 'User not found.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetTokenExpiresAt = Date.now() + 3600000;
    await user.save();

    try{
      await sendPasswordResetEmail(user.email, token);

      res.status(200).json({
        succeeded: true,
        message: 'Password reset email sent successfully.'
      });
    }
    catch(err){
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpiresAt = undefined;
      await user.save();
      return res.status(500).json({ succeeded: false, message: 'Email could not be sent.' + err.message });
    }  
  }catch (error) {
    console.error(error);
    res.status(500).json({
      succeeded: false,
      message: 'Server Error',
      errors: [error.message]
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if(!token || !newPassword){
      return res.status(400).json({
        succeeded: false,
        message: 'Token and new password are required.'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ succeeded: false, message: 'Invalid or expired token.' });
    }

    const salt = await bcrypt.genSalt(10);

    user.passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      succeeded: true,
      message: 'Password has been reset successfully.'
    });  
  }catch (error) 
  {
    console.error(error);
    res.status(500).json({
      succeeded: false,
      message: 'Server Error',
      errors: [error.message]
    });
  }
};