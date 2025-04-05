import { sendResetEmail } from "./emailService.js";

// Test values
const testEmail = "your.email@example.com"; // ← ✅ Replace with your real email
const resetLink = "https://google.com";     // Can be anything for testing

(async () => {
    try {
        console.log("📤 Attempting to send test email...");
        await sendResetEmail(testEmail, resetLink);
        console.log("✅ Test email sent successfully!");
    } catch (err) {
        console.error("❌ Test email error:", err.message);
    }
})();
