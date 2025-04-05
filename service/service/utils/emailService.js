// service/service/utils/emailService.js
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config(); // ✅ Ensure environment variables are loaded

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_SENDER = process.env.EMAIL_SENDER;

sgMail.setApiKey(SENDGRID_API_KEY);

export const sendResetEmail = async (toEmail, resetLink) => {
    const msg = {
        to: toEmail,
        from: EMAIL_SENDER,
        subject: "Password Reset Request - Real Estate App",
        html: `
            <h2>Password Reset</h2>
            <p>You requested a password reset.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" style="padding: 10px 20px; background: #3b82f6; color: white; border-radius: 5px; text-decoration: none;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
        `,
    };

    try {
        console.log("Sending email to:", toEmail);
        console.log("Using sender:", EMAIL_SENDER);
        await sgMail.send(msg);
        console.log("✅ Password reset email sent to:", toEmail);
    } catch (error) {
        console.error("❌ SendGrid Error:", error.response?.body || error.message);
        throw new Error("Failed to send reset email");
    }
};
