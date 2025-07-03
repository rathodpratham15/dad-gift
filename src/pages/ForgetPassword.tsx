/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgetPassword.css";
import { toast } from "react-toastify";
import axios from "axios";
import Lottie from "lottie-react";
import successAnim from "../assets/success.json";

const API = import.meta.env.VITE_API_URL;

const ForgetPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [emailValid, setEmailValid] = useState(true);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setEmailValid(false);
            toast.error("Please enter a valid email.");
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API}/api/auth/reset-request`, { email });
            setSubmitted(true);
            toast.success("Reset instructions sent to your email!");
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setEmailValid(validateEmail(value));
    };

    return (
        <div className="enhanced-login-container">
            <div className="enhanced-login-card fade-in">
                {!submitted ? (
                    <>
                        <h1 className="enhanced-login-title">Forgot Password</h1>
                        <form className="enhanced-login-form" onSubmit={handleSubmit}>
                            <div className="enhanced-login-input-group">
                                <label htmlFor="email" className="enhanced-login-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    className="enhanced-login-input"
                                    value={email}
                                    onChange={handleChange}
                                    required
                                />
                                {!emailValid && (
                                    <span className="enhanced-login-error">Invalid email format</span>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="enhanced-login-button"
                                disabled={loading || !emailValid || !email}
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-feedback">
                        <Lottie animationData={successAnim} loop={false} style={{ height: 120 }} />
                        <p className="enhanced-login-footer success-text">
                            Reset link sent! Please check your email.
                        </p>
                    </div>
                )}

                <div className="enhanced-login-footer">
                    <button className="enhanced-signup-link" onClick={() => navigate("/login")}>
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgetPassword;
