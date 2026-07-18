import nodemailer from 'nodemailer';
import dns from 'dns';

// Use the authenticated SMTP user as the sender, falling back to EMAIL_USER.
// Some providers reject messages when `from` doesn't match the authenticated user.
const getSenderEmail = () =>
  process.env.SMTP_USERNAME || process.env.EMAIL_USER || 'noreply@greencity.com';

// Prefer EMAIL_FROM if provided (matches backend/.env.example).
// Supports both:
// - `user@domain.com`
// - `Some Name <user@domain.com>`
const getFromHeader = () => {
  const emailFrom = process.env.EMAIL_FROM?.trim();
  if (!emailFrom) {
    return `"GreenCity Project" <${getSenderEmail()}>`;
  }
  if (emailFrom.includes('<') && emailFrom.includes('>')) {
    return emailFrom;
  }
  return `"GreenCity Project" <${emailFrom}>`;
};

// Gmail transporter (used as a retry fallback on SMTP connectivity failures)
const createGmailTransporter = async () => {
  const gmailUser = process.env.EMAIL_USER || '';
  const gmailPass = process.env.EMAIL_PASS || '';
  if (!gmailUser || !gmailPass) return null;

  // Your environment can reach Gmail over IPv6, but IPv4 resolves to an IP that times out.
  // Force the transport to use the first IPv6 A/AAAA record we can resolve.
  const gmailHost = 'smtp.gmail.com';
  const ipv6Addrs = await dns.promises.resolve6(gmailHost).catch(() => []);
  const hostToConnect = ipv6Addrs[0] || gmailHost;

  return nodemailer.createTransport({
    host: hostToConnect,
    port: 587,
    secure: false, // STARTTLS on 587
    auth: { user: gmailUser, pass: gmailPass },
    tls: { servername: gmailHost } // Ensure TLS SNI matches smtp.gmail.com
  });
};

const isSmtpTimeoutError = (error) => {
  const code = error?.code;
  const msg = String(error?.message || '');
  return (
    code === 'ESOCKET' ||
    code === 'ETIMEDOUT' ||
    /timed out/i.test(msg) ||
    /econn(ec|ect|ected)|timeout|etimedout/i.test(msg)
  );
};

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Allow disabling email sending entirely (useful for local dev / when SMTP is blocked)
  if (String(process.env.EMAIL_SENDING_DISABLED).toLowerCase() === 'true') {
    return {
      sendMail: async (options) => {
        console.log('\n📧 EMAIL DISABLED (dev fallback):');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.text || options.html);
        console.log('---\n');
        return { messageId: 'email-disabled-' + Date.now() };
      }
    };
  }

  // For production, use environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USERNAME || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // 465 is usually secure; 587 typically uses STARTTLS
      auth: { user: smtpUser, pass: smtpPass }
    });
  }
  
  // For development/testing, use console logging only
  if (process.env.NODE_ENV === 'development') {
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
  
  // Fallback: Gmail with explicit host/port (prefer 587 over 465)
  const gmailUser = process.env.EMAIL_USER || '';
  const gmailPass = process.env.EMAIL_PASS || '';
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: gmailUser, pass: gmailPass }
    });
  }

  // Last resort: do not crash with an empty transporter; throw a clearer error instead.
  throw new Error('Email transporter is not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USERNAME/SMTP_PASSWORD (or EMAIL_USER/EMAIL_PASS) and ensure network access to SMTP.');
};

// Send OTP email
export const sendOTPEmail = async (email, otp, firstName = 'User') => {
  const mailOptions = {
    from: getFromHeader(),
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

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);

    // Retry with Gmail if SMTP connectivity fails (e.g., wrong SMTP_HOST IP or firewall).
    const gmailTransporter = await createGmailTransporter();
    if (gmailTransporter && isSmtpTimeoutError(error)) {
      try {
        const info = await gmailTransporter.sendMail(mailOptions);
        console.log('✅ OTP email sent via Gmail fallback:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (fallbackError) {
        console.error('❌ Gmail fallback also failed:', fallbackError);
      }
    }

    throw new Error('Failed to send verification email');
  }
};

// Send password reset email (for future use)
export const sendPasswordResetEmail = async (email, resetToken, firstName = 'User') => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: getFromHeader(),
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

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);

    const gmailTransporter = await createGmailTransporter();
    if (gmailTransporter && isSmtpTimeoutError(error)) {
      try {
        const info = await gmailTransporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent via Gmail fallback:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (fallbackError) {
        console.error('❌ Gmail fallback also failed:', fallbackError);
      }
    }

    throw new Error('Failed to send password reset email');
  }
};

export default { sendOTPEmail, sendPasswordResetEmail };

