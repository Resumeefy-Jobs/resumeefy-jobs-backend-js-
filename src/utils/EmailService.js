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

export const sendApplicationSuccessEmail = async (toEmail, applicantName, jobTitle, companyName) => {
  const subject = `Application Received: ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h3>Hi ${applicantName},</h3>
      <p>Good news! Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully sent.</p>
      <p>The employer has been notified and will review your resume shortly.</p>
      <br/>
      <p>Best of luck,</p>
      <p><strong>The Resumeefy Team</strong></p>
    </div>
  `;
  await sendEmail(toEmail, subject, html);
};

export const sendNewApplicantNotification = async (employerEmail, employerName, jobTitle, applicantName, applicantLink) => {
  const subject = `New Applicant for ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h3>Hello ${employerName},</h3>
      <p>You have a new applicant for the <strong>${jobTitle}</strong> position!</p>
      <p><strong>Candidate:</strong> ${applicantName}</p>
      <br/>
      <a href="${applicantLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Application</a>
      <br/><br/>
      <p>Login to your dashboard to take action.</p>
    </div>
  `;
  await sendEmail(employerEmail, subject, html);
};