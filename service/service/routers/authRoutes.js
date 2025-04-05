import express from 'express';
import { register, login, googleLogin } from '../controllers/authController.js';
import { sendResetEmail } from "../utils/emailService.js"; // adjust path if needed
import { requestPasswordReset } from '../controllers/resetPasswordController.js';



const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin); // 👈 Google Login Route
router.post('/reset-request', requestPasswordReset);



router.get("/test-email", async (req, res) => {
    try {
        await sendResetEmail("prathamrathod01@gmail.com", "https://yourapp.com/reset-password");
        res.send("✅ Email sent successfully");
    } catch (err) {
        console.error("❌ Test email error:", err);
        res.status(500).send("❌ Failed to send test email: " + err.message);
    }
});


export default router;
