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