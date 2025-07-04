/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Signup.css";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { UserPlus, Users, Shield, Clock, Award } from "lucide-react";
import { toast } from "react-toastify";
import { FaGoogle } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const Signup: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const passwordChecks = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        specialChar: /[!@#$%^&*]/.test(formData.password),
    };

    const allValid = Object.values(passwordChecks).every(Boolean);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!validateEmail(formData.email)) {
            setError("Please enter a valid email.");
            setLoading(false);
            return;
        }

        if (!allValid) {
            setError("Password does not meet all requirements.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API}/api/auth/register`, formData);
            if (response.status === 201) {
                toast.success("Account created successfully! Please log in.");
                navigate("/login");
            }
        } catch (err) {
            console.error("Signup error:", err);
            toast.error("Signup failed. Please try again.");
            setError("Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            const { email, name } = decoded;

            const res = await axios.post(`${API}/api/auth/google-login`, {
                email,
                name,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            toast.success(`Welcome, ${name}!`);
            navigate(res.data.role === "admin" ? "/admin" : "/home");
        } catch (err) {
            console.error("Google signup error:", err);
            toast.error("Google signup failed.");
            setError("Google signup failed.");
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-layout">
                {/* Left Side - Welcome Section */}
                <div className="signup-welcome-section">
                    <div className="signup-welcome-content">
                        <h1 className="signup-welcome-title">Join Us Today</h1>
                        <p className="signup-welcome-subtitle">
                            Create your account and unlock access to thousands of premium properties and exclusive real estate opportunities.
                        </p>
                        
                        <div className="signup-welcome-features">
                            <div className="signup-feature-item">
                                <Users className="signup-feature-icon" />
                                <span className="signup-feature-text">Join 50,000+ happy customers</span>
                            </div>
                            <div className="signup-feature-item">
                                <Shield className="signup-feature-icon" />
                                <span className="signup-feature-text">Bank-level security & privacy</span>
                            </div>
                            <div className="signup-feature-item">
                                <Clock className="signup-feature-icon" />
                                <span className="signup-feature-text">24/7 customer support</span>
                            </div>
                            <div className="signup-feature-item">
                                <Award className="signup-feature-icon" />
                                <span className="signup-feature-text">Award-winning platform</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Section */}
                <div className="signup-form-section">
                    <form className="signup-form fade-in" onSubmit={handleSubmit}>
                        <h1 className="signup-title">Create Account</h1>
                        <p className="signup-subtitle">
                            Start your real estate journey with us
                        </p>

                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="signup-input"
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="signup-input"
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Create Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="signup-input"
                            required
                        />

                        {formData.password && (
                            <div className="password-requirements">
                                <p>Password Requirements:</p>
                                <ul>
                                    <li className={passwordChecks.length ? "valid" : "invalid"}>
                                        At least 8 characters
                                    </li>
                                    <li className={passwordChecks.uppercase ? "valid" : "invalid"}>
                                        One uppercase letter
                                    </li>
                                    <li className={passwordChecks.lowercase ? "valid" : "invalid"}>
                                        One lowercase letter
                                    </li>
                                    <li className={passwordChecks.number ? "valid" : "invalid"}>
                                        One number
                                    </li>
                                    <li className={passwordChecks.specialChar ? "valid" : "invalid"}>
                                        One special character (!@#$%^&*)
                                    </li>
                                </ul>
                            </div>
                        )}

                        {error && <p className="signup-error">{error}</p>}

                        <button type="submit" className="signup-button" disabled={loading || !allValid}>
                            {loading ? (
                                "Creating Account..."
                            ) : (
                                <>
                                    <UserPlus size={18} style={{ marginRight: "8px" }} />
                                    Create Account
                                </>
                            )}
                        </button>

                        <div className="or-divider">OR</div>

                        <button 
                            type="button" 
                            className="google-btn"
                            onClick={() => {
                                // Trigger the hidden GoogleLogin component
                                const googleLoginButton = document.querySelector('.google-login-hidden button') as HTMLElement;
                                if (googleLoginButton) {
                                    googleLoginButton.click();
                                }
                            }}
                        >
                            <FaGoogle className="google-icon" />
                            Sign up with Google
                        </button>

                        <div className="google-login-hidden" style={{ display: 'none' }}>
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess} 
                                onError={() => {
                                    toast.error("Google signup failed");
                                    setError("Google signup failed");
                                }}
                            />
                        </div>

                        <div className="signup-footer">
                            <p>
                                Already have an account?
                                <button
                                    type="button"
                                    className="signup-link"
                                    onClick={() => navigate("/login")}
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
