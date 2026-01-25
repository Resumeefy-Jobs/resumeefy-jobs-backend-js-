import bcrypt from 'bcryptjs';
import Joi from 'joi';
import User from '../models/User.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';

export const register = async (req, res) => {
  try {
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

    const newUser = new User({
      email,
      passwordHash,
      role,
      isActive: true,
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