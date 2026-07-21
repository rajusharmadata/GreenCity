import nodemailer from 'nodemailer';

const getFromHeader = () =>
  process.env.EMAIL_FROM?.trim() || `"GreenCity Project" <${process.env.EMAIL_USER}>`;

const TRANSPORT_TIMEOUTS = {
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000
};

const buildTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email transporter not configured. Set SMTP_HOST, SMTP_PORT, EMAIL_USER, EMAIL_PASS.');
  }

  const port = Number(SMTP_PORT);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    ...TRANSPORT_TIMEOUTS
  });
};

const transporter = buildTransporter();

transporter.verify()
  .then(() => console.log('✅ Email transporter verified'))
  .catch((err) => console.error('❌ Email transporter verification failed:', err.message));

const otpEmailHtml = (otp, firstName) => `
  <!DOCTYPE html>
  <html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0;">GreenCity Project</h1>
    </div>
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
      <h2 style="color: #667eea; margin-top: 0;">Email Verification</h2>
      <p>Hello ${firstName},</p>
      <p>Use the following OTP to verify your email address:</p>
      <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
      </div>
      <p style="color: #666; font-size: 14px;">This OTP will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} GreenCity Project. All rights reserved.</p>
    </div>
  </body>
  </html>
`;

const otpEmailText = (otp, firstName) => `
GreenCity Project - Email Verification

Hello ${firstName},

Use the following OTP to verify your email address: ${otp}

This OTP will expire in 10 minutes.

If you didn't create an account, please ignore this email.
`;

export const sendOTPEmail = async (email, otp, firstName = 'User') => {
  try {
    const info = await transporter.sendMail({
      from: getFromHeader(),
      to: email,
      subject: 'Verify Your Email - GreenCity Project',
      html: otpEmailHtml(otp, firstName),
      text: otpEmailText(otp, firstName)
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw new Error('Failed to send verification email');
  }
};

const passwordResetEmailHtml = (resetLink, firstName) => `
  <!DOCTYPE html>
  <html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0;">GreenCity Project</h1>
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
      <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} GreenCity Project. All rights reserved.</p>
    </div>
  </body>
  </html>
`;

export const sendPasswordResetEmail = async (email, resetToken, firstName = 'User') => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  try {
    const info = await transporter.sendMail({
      from: getFromHeader(),
      to: email,
      subject: 'Reset Your Password - GreenCity Project',
      html: passwordResetEmailHtml(resetLink, firstName)
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    throw new Error('Failed to send password reset email');
  }
};

export default { sendOTPEmail, sendPasswordResetEmail };