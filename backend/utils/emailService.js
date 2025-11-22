import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // For production, use environment variables
  if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE, // e.g., 'gmail', 'outlook', 'yahoo'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // For development/testing, use Ethereal Email (fake SMTP)
  // Or use a service like Mailtrap, MailHog, etc.
  if (process.env.NODE_ENV === 'development') {
    // You can use Ethereal Email for testing
    // For now, we'll use console logging in development
    return {
      sendMail: async (options) => {
        console.log('\n📧 EMAIL (Development Mode):');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.text || options.html);
        console.log('---\n');
        return { messageId: 'dev-email-' + Date.now() };
      }
    };
  }
  
  // Fallback: Use Gmail with app password (if configured)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, firstName = 'User') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"GreenCity Project" <${process.env.EMAIL_USER || 'noreply@greencity.com'}>`,
      to: email,
      subject: 'Verify Your Email - GreenCity Project',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🌱 GreenCity Project</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #667eea; margin-top: 0;">Email Verification</h2>
            <p>Hello ${firstName},</p>
            <p>Thank you for signing up! Please use the following OTP (One-Time Password) to verify your email address:</p>
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This OTP will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} GreenCity Project. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        GreenCity Project - Email Verification
        
        Hello ${firstName},
        
        Thank you for signing up! Please use the following OTP to verify your email address:
        
        OTP: ${otp}
        
        This OTP will expire in 10 minutes.
        
        If you didn't create an account, please ignore this email.
        
        © ${new Date().getFullYear()} GreenCity Project. All rights reserved.
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email (for future use)
export const sendPasswordResetEmail = async (email, resetToken, firstName = 'User') => {
  try {
    const transporter = createTransporter();
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: `"GreenCity Project" <${process.env.EMAIL_USER || 'noreply@greencity.com'}>`,
      to: email,
      subject: 'Reset Your Password - GreenCity Project',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🌱 GreenCity Project</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #667eea; margin-top: 0;">Password Reset Request</h2>
            <p>Hello ${firstName},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #667eea; font-size: 12px; word-break: break-all;">${resetLink}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in <strong>1 hour</strong>.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} GreenCity Project. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export default { sendOTPEmail, sendPasswordResetEmail };

