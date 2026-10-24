import nodemailer from "nodemailer";
import { env, isSmtpConfigured } from "../config/env.js";

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
}

export async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    if (env.nodeEnv !== "test") {
      console.log(`\n================== [MAILER (Dev Mock)] ==================`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text || html}`);
      console.log(`========================================================\n`);
    }
    return { mock: true, messageId: `mock_${Date.now()}` };
  }

  return transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
  });
}

export async function sendVerificationEmail(email, token, clientOrigin = env.clientOrigin) {
  const verifyUrl = `${clientOrigin}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Verify your email address - SocialConnect",
    text: `Welcome to SocialConnect! Please verify your email by clicking: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #4f46e5;">Welcome to SocialConnect</h2>
        <p>Thank you for joining our community. Please verify your email address to secure your account:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser: <br/><a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email, token, clientOrigin = env.clientOrigin) {
  const resetUrl = `${clientOrigin}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Reset your password - SocialConnect",
    text: `You requested a password reset. Please click this link to reset your password: ${resetUrl}. This link will expire in 1 hour.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p>We received a request to reset your password for SocialConnect. Click the button below to choose a new password:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">This link is valid for 1 hour. If you did not request this reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}
