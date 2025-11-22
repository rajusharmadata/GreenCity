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

export const signupOrganization = async (req, res) => {
    try {
        const { organizationName, address, organizationId, email, phone, transportTypes, password } = req.body;

        // Validation
        if (!organizationName || !organizationName.trim()) {
            return res.status(400).json({ error: 'Organization name is required' });
        }
        if (!address || !address.trim()) {
            return res.status(400).json({ error: 'Address is required' });
        }
        if (!organizationId || !organizationId.trim()) {
            return res.status(400).json({ error: 'Organization ID is required' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }
        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }
        // Phone validation - should be a number
        const phoneNumber = typeof phone === 'string' ? parseInt(phone.replace(/\D/g, '')) : phone;
        if (isNaN(phoneNumber) || phoneNumber.toString().length < 10) {
            return res.status(400).json({ error: 'Please enter a valid phone number (minimum 10 digits)' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        // Validate transport types (optional, defaults to empty array)
        const validTransportTypes = ['Bus', 'Train', 'Metro', 'SharedCab', 'Car', 'Bike', 'Other'];
        const finalTransportTypes = transportTypes && Array.isArray(transportTypes) ? transportTypes : [];
        
        // If transport types are provided, validate them
        if (finalTransportTypes.length > 0) {
            const invalidTypes = finalTransportTypes.filter(type => !validTransportTypes.includes(type));
            if (invalidTypes.length > 0) {
                return res.status(400).json({ error: `Invalid transport types: ${invalidTypes.join(', ')}` });
            }
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedOrgId = organizationId.trim();

        // Check if organization already exists
        const existingOrganization = await Organization.findOne({ 
            $or: [
                { email: normalizedEmail }, 
                { phone: phoneNumber }, 
                { organizationId: normalizedOrgId }
            ] 
        });
        
        if (existingOrganization) {
            if (existingOrganization.email === normalizedEmail) {
                return res.status(400).json({ error: 'An organization with this email already exists' });
            }
            if (existingOrganization.organizationId === normalizedOrgId) {
                return res.status(400).json({ error: 'An organization with this ID already exists' });
            }
            if (existingOrganization.phone === phoneNumber) {
                return res.status(400).json({ error: 'An organization with this phone number already exists' });
            }
            return res.status(400).json({ error: 'Organization already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry
        
        // Also generate token for backward compatibility
        const verificationToken = generateVerificationToken();
        const verificationTokenExpiry = new Date();
        verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);
        
        // Create new organization
        const newOrganization = new Organization({ 
            organizationName: organizationName.trim(), 
            address: address.trim(), 
            organizationId: normalizedOrgId, 
            email: normalizedEmail, 
            phone: phoneNumber,
            transportTypes: finalTransportTypes, 
            password: hashedPassword,
            isEmailVerified: false,
            emailVerificationOTP: otp,
            emailVerificationOTPExpiry: otpExpiry,
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpiry: verificationTokenExpiry,
            otpAttempts: 0
        });
        
        await newOrganization.save();

        // Send OTP email
        try {
            await sendOTPEmail(normalizedEmail, otp, organizationName.trim());
        } catch (emailError) {
            console.error('Error sending OTP email:', emailError);
            // Don't fail registration if email fails, but log it
        }

        res.status(201).json({ 
            message: 'Transport organization registered successfully. Please verify your email with the OTP sent to your email address.', 
            organization: {
                _id: newOrganization._id,
                organizationName: newOrganization.organizationName,
                organizationId: newOrganization.organizationId,
                email: newOrganization.email,
                phone: newOrganization.phone,
                transportTypes: newOrganization.transportTypes,
                role: newOrganization.role,
                isEmailVerified: false
            },
            requiresVerification: true
        });
    } catch (error) {
        console.error('Organization signup error:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                error: `An organization with this ${field} already exists` 
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        
        res.status(500).json({ error: 'Error registering organization. Please try again later.' });
    }
};

export const loginOrganization = async (req, res) => {
    try {
        const { email, organizationId, password } = req.body;

        // Validation
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        if (!email && !organizationId) {
            return res.status(400).json({ error: 'Email or Organization ID is required' });
        }

        // Normalize email if provided
        const normalizedEmail = email ? email.trim().toLowerCase() : null;

        // Build query - prefer email if both are provided
        const query = normalizedEmail 
            ? { email: normalizedEmail } 
            : { organizationId: organizationId.trim() };

        const organization = await Organization.findOne(query);
        
        if (!organization) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, organization.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if email is verified
        if (!organization.isEmailVerified) {
            return res.status(403).json({ 
                error: 'Please verify your email before logging in.',
                requiresVerification: true,
                email: organization.email
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { orgId: organization._id, email: organization.email, role: 'organization' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            organization: {
                _id: organization._id,
                organizationName: organization.organizationName,
                organizationId: organization.organizationId,
                email: organization.email,
                phone: organization.phone,
                transportTypes: organization.transportTypes || [],
                role: organization.role
            } 
        });
    } catch (error) {
        console.error('Organization login error:', error);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
};

// Get organization profile
export const getOrganizationProfile = async (req, res) => {
    try {
        // req.user is set by passport JWT strategy
        const organization = await Organization.findById(req.user._id || req.user.orgId).select('-password');
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.status(200).json(organization);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organization profile', error: error.message });
    }
};

// Verify organization email (supports both OTP and token methods)
export const verifyOrganizationEmail = async (req, res) => {
    try {
        const { otp, token, email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        
        if (!otp && !token) {
            return res.status(400).json({ error: "Either OTP or token is required" });
        }
        
        const organization = await Organization.findOne({ email: email.trim().toLowerCase() });
        
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }
        
        // Check if already verified
        if (organization.isEmailVerified) {
            return res.status(200).json({ 
                message: "Email already verified",
                organization: {
                    _id: organization._id,
                    email: organization.email,
                    isEmailVerified: true
                }
            });
        }
        
        // OTP verification (preferred method)
        if (otp) {
            // Check rate limiting for OTP attempts
            const now = new Date();
            if (organization.otpLastAttempt && (now - organization.otpLastAttempt) < 60000) { // 1 minute cooldown
                if (organization.otpAttempts >= 5) {
                    return res.status(429).json({ 
                        error: "Too many attempts. Please wait 1 minute before trying again." 
                    });
                }
            } else {
                // Reset attempts if more than 1 minute has passed
                organization.otpAttempts = 0;
            }
            
            if (organization.emailVerificationOTP !== otp) {
                organization.otpAttempts = (organization.otpAttempts || 0) + 1;
                organization.otpLastAttempt = now;
                await organization.save();
                return res.status(400).json({ error: "Invalid OTP" });
            }
            
            // Check if OTP is expired
            if (!organization.emailVerificationOTPExpiry || organization.emailVerificationOTPExpiry < new Date()) {
                return res.status(400).json({ error: "OTP has expired. Please request a new one." });
            }
            
            // Verify email
            organization.isEmailVerified = true;
            organization.emailVerificationOTP = null;
            organization.emailVerificationOTPExpiry = null;
            organization.emailVerificationToken = null;
            organization.emailVerificationTokenExpiry = null;
            organization.otpAttempts = 0;
            organization.otpLastAttempt = null;
            await organization.save();
            
            return res.status(200).json({ 
                message: "Email verified successfully",
                organization: {
                    _id: organization._id,
                    email: organization.email,
                    isEmailVerified: true
                }
            });
        }
        
        // Token verification (backward compatibility)
        if (token) {
            if (organization.emailVerificationToken !== token) {
                return res.status(400).json({ error: "Invalid verification token" });
            }
            
            // Check if token is expired
            if (!organization.emailVerificationTokenExpiry || organization.emailVerificationTokenExpiry < new Date()) {
                return res.status(400).json({ error: "Verification token has expired. Please request a new one." });
            }
            
            // Verify email
            organization.isEmailVerified = true;
            organization.emailVerificationOTP = null;
            organization.emailVerificationOTPExpiry = null;
            organization.emailVerificationToken = null;
            organization.emailVerificationTokenExpiry = null;
            await organization.save();
            
            return res.status(200).json({ 
                message: "Email verified successfully",
                organization: {
                    _id: organization._id,
                    email: organization.email,
                    isEmailVerified: true
                }
            });
        }
        
        res.status(400).json({ error: "Either OTP or token is required" });
    } catch (error) {
        console.error('Organization email verification error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Resend verification email (OTP) for organization
export const resendOrganizationVerification = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        
        const organization = await Organization.findOne({ email: email.trim().toLowerCase() });
        
        if (!organization) {
            return res.status(404).json({ error: "Organization not found" });
        }
        
        if (organization.isEmailVerified) {
            return res.status(400).json({ error: "Email already verified" });
        }
        
        // Rate limiting: Check if organization requested OTP recently
        const now = new Date();
        if (organization.emailVerificationOTPExpiry && (organization.emailVerificationOTPExpiry.getTime() - now.getTime()) > 540000) {
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
        
        organization.emailVerificationOTP = otp;
        organization.emailVerificationOTPExpiry = otpExpiry;
        organization.emailVerificationToken = verificationToken;
        organization.emailVerificationTokenExpiry = verificationTokenExpiry;
        organization.otpAttempts = 0; // Reset attempts
        organization.otpLastAttempt = null;
        await organization.save();
        
        // Send OTP email
        try {
            await sendOTPEmail(organization.email, otp, organization.organizationName);
            return res.status(200).json({ 
                message: "Verification email sent successfully",
                email: organization.email
            });
        } catch (emailError) {
            console.error('Error sending OTP email:', emailError);
            return res.status(500).json({ error: "Failed to send verification email. Please try again later." });
        }
    } catch (error) {
        console.error('Resend organization verification error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};