// Login.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import axios from "axios";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

interface LoginProps {
    onLogin: () => void;
}

const API = import.meta.env.VITE_API_URL;

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedEmail = localStorage.getItem("remember_email");
        const savedPass = localStorage.getItem("remember_pass");
        if (savedEmail && savedPass) {
            setEmail(savedEmail);
            setPassword(savedPass);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(`${API}/api/auth/login`, {
                email,
                password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);

            if (rememberMe) {
                localStorage.setItem("remember_email", email);
                localStorage.setItem("remember_pass", password);
            } else {
                localStorage.removeItem("remember_email");
                localStorage.removeItem("remember_pass");
            }

            toast.success("Logged in successfully!");
            onLogin();
            navigate(response.data.role === "admin" ? "/admin" : "/home");
        } catch (err: any) {
            console.error("Login Error:", err.response?.data || err.message);
            toast.error("Invalid email or password!");
            setError("Invalid email or password!");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const decoded: any = jwtDecode(credentialResponse.credential);
            const googleEmail = decoded.email;
            const name = decoded.name;

            const res = await axios.post(`${API}/api/auth/google-login`, {
                email: googleEmail,
                name: name,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            toast.success(`Welcome back, ${name}!`);
            onLogin();
            navigate(res.data.role === "admin" ? "/admin" : "/home");
        } catch (err) {
            console.error("Google Login Failed", err);
            toast.error("Google Sign-In failed");
            setError("Google login failed");
        }
    };

    return (
        <div className="enhanced-login-container">
            <div className="enhanced-login-card fade-in">
                <h1 className="enhanced-login-title">Login</h1>
                <form className="enhanced-login-form" onSubmit={handleSubmit}>
                    <div className="enhanced-login-input-group">
                        <label htmlFor="email" className="enhanced-login-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            className="enhanced-login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="enhanced-login-input-group">
                        <label htmlFor="password" className="enhanced-login-label">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Enter your password"
                                className="enhanced-login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </span>
                        </div>
                    </div>

                    <div className="remember-me">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            id="remember"
                        />
                        <label htmlFor="remember">Remember me</label>
                        <button
                            className="forgot-password-link"
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot password?
                        </button>
                    </div>

                    {error && <p className="enhanced-login-error">{error}</p>}

                    <button type="submit" className="enhanced-login-button" disabled={loading}>
                        {loading ? "Logging in..." : (
                            <>
                                <LogIn size={18} style={{ marginRight: "8px" }} />
                                Login
                            </>
                        )}
                    </button>

                    <div className="or-divider">OR</div>

                    <div className="google-oauth-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => {
                                toast.error("Google Sign-In failed");
                                setError("Google Sign-In failed");
                            }}
                        />
                    </div>
                </form>

                <div className="enhanced-login-footer">
                    <p>
                        Don’t have an account?{" "}
                        <button
                            className="enhanced-signup-link"
                            onClick={() => navigate("/signup")}
                        >
                            Sign-up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
