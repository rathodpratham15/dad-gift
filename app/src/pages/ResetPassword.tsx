// ResetPassword.tsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/ForgetPassword.css";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";
import Lottie from "lottie-react";
import successAnimation from "../assets/success.json";

const ResetPassword: React.FC = () => {
    const [params] = useSearchParams();
    const token = params.get("token");
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const passwordStrength = (password: string): string => {
        const strongRegex = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
        );
        if (!password) return "";
        return strongRegex.test(password) ? "strong" : "weak";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Missing or invalid token.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        if (passwordStrength(newPassword) === "weak") {
            toast.error("Password must be strong (min 8 chars, upper, lower, number, symbol).");
            return;
        }

        try {
            setLoading(true);
            await axios.post("http://localhost:3002/api/auth/reset-password", {
                token,
                newPassword,
            });

            setSuccess(true);
            setTimeout(() => {
                toast.success("Password reset successful!");
                navigate("/login");
            }, 2000);
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            const message = err.response?.data?.message || err.message;
            console.error("Reset error:", message);
            toast.error(message || "Reset failed.");
        } finally {
            setLoading(false);
        }
    };

    const passwordStrengthLabel = passwordStrength(newPassword);

    return (
        <div className="enhanced-login-container">
            <div className="enhanced-login-card fade-in">
                <h1 className="enhanced-login-title">Reset Password</h1>

                {success ? (
                    <div className="lottie-success-container">
                        <Lottie animationData={successAnimation} loop={false} />
                        <p className="enhanced-login-footer">Password reset successful!</p>
                    </div>
                ) : (
                    <form className="enhanced-login-form" onSubmit={handleSubmit}>
                        <div className="enhanced-login-input-group">
                            <label htmlFor="newPassword" className="enhanced-login-label">New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    placeholder="Enter new password"
                                    className="enhanced-login-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <span
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </span>
                            </div>
                            {newPassword && (
                                <span className={`password-strength ${passwordStrengthLabel}`}>
                                    {passwordStrengthLabel === "strong" ? "✅ Strong password" : "⚠️ Weak password"}
                                </span>
                            )}
                        </div>

                        <div className="enhanced-login-input-group">
                            <label htmlFor="confirmPassword" className="enhanced-login-label">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                className="enhanced-login-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="enhanced-login-button" disabled={loading}>
                            {loading ? "Resetting..." : (
                                <>
                                    <Lock size={18} style={{ marginRight: "8px" }} />
                                    Reset Password
                                </>
                            )}
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="enhanced-login-footer">
                        <button
                            className="enhanced-signup-link"
                            onClick={() => navigate("/login")}
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
