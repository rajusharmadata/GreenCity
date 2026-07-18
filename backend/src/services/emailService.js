import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────────────────────────────────
// Config resolution — happens once at module load, not per-request.
// This means a misconfigured environment fails LOUDLY at server startup
// (visible in your Render deploy logs) instead of silently swallowing every
// email send attempt for however long it takes someone to notice.
// ─────────────────────────────────────────────────────────────────────────────

const isSendingDisabled =
  String(process.env.EMAIL_SENDING_DISABLED).toLowerCase() === 'true';

const getSenderEmail = () =>
  process.env.SMTP_USERNAME || process.env.EMAIL_USER || 'noreply@greencity.com';

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

// Timeouts are the whole point of this rewrite: without them, a stalled SMTP
// connection hangs the underlying socket indefinitely rather than failing
// fast. These numbers are generous but bounded — worst case, a send attempt
// fails within ~20s instead of hanging until the platform kills it for you.
const TRANSPORT_TIMEOUTS = {
  connectionTimeout: 10_000, // time to establish the TCP connection
  greetingTimeout: 10_000,   // time to receive the SMTP greeting after connecting
  socketTimeout: 20_000      // time allowed for the whole send once connected
};

const buildStubTransport = (label) => ({
  sendMail: async (options) => {
    console.log(`\n📧 EMAIL (${label} — not actually sent):`);
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('---\n');
    return { messageId: `${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` };
  }
});

const buildTransporter = () => {
  if (isSendingDisabled) {
    return buildStubTransport('disabled');
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ;
  const smtpUser =  process.env.EMAIL_USER;
  const smtpPass = process.env.EMAIL_PASS;

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user: smtpUser, pass: smtpPass },
      ...TRANSPORT_TIMEOUTS
    });
  }

  // Gmail via EMAIL_USER/EMAIL_PASS (an App Password, not the account
  // password) is a legitimate production path, not just a dev fallback —
  // this is what GreenCity actually runs on. Keep it usable outside dev.
  const gmailUser = process.env.EMAIL_USER;
  const gmailPass = process.env.EMAIL_PASS;
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS on 587
      auth: { user: gmailUser, pass: gmailPass },
      ...TRANSPORT_TIMEOUTS
    });
  }

  // Local dev convenience only — never reached if any real credentials
  // (SMTP_* or EMAIL_USER/EMAIL_PASS) are set.
  if (process.env.NODE_ENV === 'development') {
    return buildStubTransport('dev mode');
  }

  throw new Error(
    'Email transporter is not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USERNAME/SMTP_PASSWORD, ' +
    'or EMAIL_USER/EMAIL_PASS for Gmail (or EMAIL_SENDING_DISABLED=true for local testing).'
  );
};

// Built once at module load and reused across requests — avoids re-creating
// a TCP/TLS connection setup on every single email send.
const transporter = buildTransporter();

// Fire-and-verify at startup, not blocking, just visible in your logs so you
// know immediately on deploy whether SMTP auth actually works — rather than
// finding out from a user complaint later.
if (!isSendingDisabled && typeof transporter.verify === 'function') {
  transporter.verify()
    .then(() => console.log('✅ Email transporter verified and ready'))
    .catch((err) => console.error('❌ Email transporter verification failed:', err.message));
}

const otpEmailHtml = (otp, firstName) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0;">GreenCity Project</h1>
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
      <p style="color: #999; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} GreenCity Project. All rights reserved.</p>
    </div>
  </body>
  </html>
`;

const otpEmailText = (otp, firstName) => `
  GreenCity Project - Email Verification

  Hello ${firstName},

  Thank you for signing up! Please use the following OTP to verify your email address:

  OTP: ${otp}

  This OTP will expire in 10 minutes.

  If you didn't create an account, please ignore this email.

  (c) ${new Date().getFullYear()} GreenCity Project. All rights reserved.
`;

export const sendOTPEmail = async (email, otp, firstName = 'User') => {
  const mailOptions = {
    from: getFromHeader(),
    to: email,
    subject: 'Verify Your Email - GreenCity Project',
    html: otpEmailHtml(otp, firstName),
    text: otpEmailText(otp, firstName)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw new Error('Failed to send verification email');
  }
};

const passwordResetEmailHtml = (resetLink, firstName) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
  </head>
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
  const mailOptions = {
    from: getFromHeader(),
    to: email,
    subject: 'Reset Your Password - GreenCity Project',
    html: passwordResetEmailHtml(resetLink, firstName)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    throw new Error('Failed to send password reset email');
  }
};

export default { sendOTPEmail, sendPasswordResetEmail };