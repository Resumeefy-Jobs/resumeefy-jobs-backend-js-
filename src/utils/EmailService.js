import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

export const sendEmail = async (to, subject, html) => {
    try {
        console.log('Preparing to send email...');
        
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM, 
            to,
            subject,
            html
        });

        console.log(`Email Successfully sent to ${to}: ${info.messageId}`);
    } catch (error) {
        console.error(`Error sending email to ${to}: ${error.message}`);
        throw error;
    }
};

export const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `https://resumeefy.com/reset-password?token=${token}`;

  const subject = "Reset Your Password - Resumeefy";
  const html = `
    <h3>Password Reset Request</h3>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    <p>This link expires in 1 hour.</p>
  `;

  await sendEmail(to, subject, html);
};