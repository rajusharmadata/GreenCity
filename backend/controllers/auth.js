import User from '../models/auth.js';
import Organization from '../models/organization.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendOTPEmail } from '../utils/emailService.js';

// Generate email verification token (for backward compatibility)
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// User signup
export const signupUser = async (req, res) => {
    try{
        const {firstName, lastName, username, email, password } = req.body;
        
        // Validation
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }
        
        const user = await User.findOne({ email });
        if(user){
            return res.status(400).json({ error: "User already exists" });
        }
        
        const usernameExists = await User.findOne({ username });
        if(usernameExists){
            return res.status(400).json({ error: "Username already taken" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry
        
        // Also generate token for backward compatibility
        const verificationToken = generateVerificationToken();
        const verificationTokenExpiry = new Date();
        verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);
        
        const newUser = new User({
            firstName : firstName,
            lastName : lastName,
            username : username,
            email : email,
            password: hashedPassword,
            role: 'user',
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpiry: verificationTokenExpiry,
            emailVerificationOTP: otp,
            emailVerificationOTPExpiry: otpExpiry,
            isEmailVerified: false,
            otpAttempts: 0
        });
        await newUser.save();
        
        // Send OTP email
        try {
            await sendOTPEmail(email, otp, firstName);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            // Continue even if email fails (for development)
            if (process.env.NODE_ENV === 'production') {
                return res.status(500).json({ error: "Failed to send verification email" });
            }
        }
        
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
        
        res.status(201).json({ 
            message: "User created successfully. Please verify your email with the OTP sent to your email.", 
            user: {
                _id : newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                isEmailVerified: false
            },
            // Only return OTP and link in development
            ...(process.env.NODE_ENV !== 'production' && { 
                otp: otp,
                verificationLink 
            })
        });
    }
    catch(error){
        console.error('Signup error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Admin signup
export const signupAdmin = async (req, res) => {
    try{
        const {firstName, lastName, username, email, password } = req.body;
        
        // Validation
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ error: "Please enter a valid email address" });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.trim().toLowerCase() },
                { username: username.trim() }
            ]
        });
        
        if (existingUser) {
            if (existingUser.email === email.trim().toLowerCase()) {
                return res.status(400).json({ error: "An account with this email already exists" });
            }
            if (existingUser.username === username.trim()) {
                return res.status(400).json({ error: "Username already taken" });
            }
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();
        
        const newAdmin = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'admin',
            isEmailVerified: true // Admin accounts are pre-verified
        });
        
        await newAdmin.save();
        
        res.status(201).json({ 
            message: "Admin created successfully", 
            user: {
                _id: newAdmin._id,
                firstName: newAdmin.firstName,
                lastName: newAdmin.lastName,
                username: newAdmin.username,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });
    }
    catch(error){
        console.error('Admin signup error:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                error: `An account with this ${field} already exists` 
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        
        res.status(500).json({ error: "Internal server error" });
    }
};

// User login
export const loginUser = async (req, res) => {
    try{
        const{email, password} = req.body;
        const user = await User.findOne({ email, role: 'user' });
        if(!user){
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const validPass = await bcrypt.compare(password, user.password);
        if(!validPass){
            return res.status(400).json({ error: "Invalid credentials" });
        }
        
        // Check if email is verified
        if(!user.isEmailVerified){
            return res.status(403).json({ 
                error: "Email not verified", 
                requiresVerification: true,
                email: user.email
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
            message: "Login successful", 
            token,
            user: {
                _id : user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        });
    }
    catch(error){
        console.error('Login error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Admin login
export const loginAdmin = async (req, res) => {
    try{
        const{email, password} = req.body;
        const admin = await User.findOne({ email, role: 'admin' });
        if(!admin){
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const validPass = await bcrypt.compare(password, admin.password);
        if(!validPass){
            return res.status(400).json({ error: "Invalid credentials" });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
            message: "Login successful", 
            token,
            user: {
                _id : admin._id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    }
    catch(error){
        console.error('Admin login error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Organization login
export const loginOrganization = async (req, res) => {
    try{
        const { email, organizationId, password } = req.body;

        // Validation
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        if (!email && !organizationId) {
            return res.status(400).json({ error: "Email or Organization ID is required" });
        }

        // Normalize email if provided
        const normalizedEmail = email ? email.trim().toLowerCase() : null;

        // Build query - prefer email if both are provided
        const query = normalizedEmail ? { email: normalizedEmail } : { organizationId: organizationId.trim() };
        
        const org = await Organization.findOne(query);

        if(!org){
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare passwords
        const validPass = await bcrypt.compare(password, org.password);
        if(!validPass){
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check if email is verified
        if (!org.isEmailVerified) {
            return res.status(403).json({ 
                error: "Please verify your email before logging in.",
                requiresVerification: true,
                email: org.email
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { orgId: org._id, email: org.email, role: 'organization' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
            message: "Login successful", 
            token,
            organization: {
                _id : org._id,
                organizationName: org.organizationName,
                organizationId: org.organizationId,
                email: org.email,
                phone: org.phone,
                transportTypes: org.transportTypes || [],
                role: 'organization'
            }
        });
    }
    catch(error){
        console.error('Organization login error:', error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        // req.user is set by passport JWT strategy
        const user = await User.findById(req.user._id || req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Refresh auth endpoint
export const refreshAuth = async (req, res) => {
    try {
        // For now, just return success - in a real app, you'd validate tokens
        res.status(200).json({ user: null, org: null });
    } catch (error) {
        res.status(500).json({ error: "Failed to refresh auth" });
    }
};

// Verify email (supports both OTP and token methods)
export const verifyEmail = async (req, res) => {
    try {
        const { otp, token, email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        
        if (!otp && !token) {
            return res.status(400).json({ error: "Either OTP or token is required" });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(200).json({ 
                message: "Email already verified",
                user: {
                    _id: user._id,
                    email: user.email,
                    isEmailVerified: true
                }
            });
        }
        
        // OTP verification (preferred method)
        if (otp) {
            // Check rate limiting for OTP attempts
            const now = new Date();
            if (user.otpLastAttempt && (now - user.otpLastAttempt) < 60000) { // 1 minute cooldown
                if (user.otpAttempts >= 5) {
                    return res.status(429).json({ 
                        error: "Too many attempts. Please wait 1 minute before trying again." 
                    });
                }
            } else {
                // Reset attempts if more than 1 minute has passed
                user.otpAttempts = 0;
            }
            
            if (user.emailVerificationOTP !== otp) {
                user.otpAttempts = (user.otpAttempts || 0) + 1;
                user.otpLastAttempt = now;
                await user.save();
                return res.status(400).json({ error: "Invalid OTP" });
            }
            
            // Check if OTP is expired
            if (!user.emailVerificationOTPExpiry || user.emailVerificationOTPExpiry < new Date()) {
                return res.status(400).json({ error: "OTP has expired. Please request a new one." });
            }
            
            // Verify email
            user.isEmailVerified = true;
            user.emailVerificationOTP = null;
            user.emailVerificationOTPExpiry = null;
            user.emailVerificationToken = null;
            user.emailVerificationTokenExpiry = null;
            user.otpAttempts = 0;
            user.otpLastAttempt = null;
            await user.save();
            
            return res.status(200).json({ 
                message: "Email verified successfully",
                user: {
                    _id: user._id,
                    email: user.email,
                    isEmailVerified: true
                }
            });
        }
        
        // Token verification (backward compatibility)
        if (token) {
            if (user.emailVerificationToken !== token) {
                return res.status(400).json({ error: "Invalid verification token" });
            }
            
            // Check if token is expired
            if (!user.emailVerificationTokenExpiry || user.emailVerificationTokenExpiry < new Date()) {
                return res.status(400).json({ error: "Verification token has expired" });
            }
            
            // Verify email
            user.isEmailVerified = true;
            user.emailVerificationToken = null;
            user.emailVerificationTokenExpiry = null;
            user.emailVerificationOTP = null;
            user.emailVerificationOTPExpiry = null;
            await user.save();
            
            return res.status(200).json({ 
                message: "Email verified successfully",
                user: {
                    _id: user._id,
                    email: user.email,
                    isEmailVerified: true
                }
            });
        }
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Resend verification email (OTP)
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        if (user.isEmailVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }
        
        // Rate limiting: Check if user requested OTP recently
        const now = new Date();
        if (user.emailVerificationOTPExpiry && (user.emailVerificationOTPExpiry.getTime() - now.getTime()) > 540000) {
            // If OTP was sent less than 1 minute ago (9 minutes remaining), prevent resend
            return res.status(429).json({ 
                error: "Please wait before requesting a new OTP. You can request a new OTP after the current one expires." 
            });
        }
        
        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry
        
        // Also generate token for backward compatibility
        const verificationToken = generateVerificationToken();
        const verificationTokenExpiry = new Date();
        verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);
        
        user.emailVerificationOTP = otp;
        user.emailVerificationOTPExpiry = otpExpiry;
        user.emailVerificationToken = verificationToken;
        user.emailVerificationTokenExpiry = verificationTokenExpiry;
        user.otpAttempts = 0; // Reset attempts
        user.otpLastAttempt = null;
        await user.save();
        
        // Send OTP email
        try {
            await sendOTPEmail(email, otp, user.firstName || 'User');
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            if (process.env.NODE_ENV === 'production') {
                return res.status(500).json({ error: "Failed to send verification email" });
            }
        }
        
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
        
        res.status(200).json({ 
            message: "Verification OTP sent successfully. Please check your email.",
            // Only return OTP and link in development
            ...(process.env.NODE_ENV !== 'production' && { 
                otp: otp,
                verificationLink 
            })
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Legacy endpoints for backward compatibility
export const signup = signupUser;
export const login = loginUser;