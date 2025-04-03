/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import axios from "axios";

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Debugging: Log credentials being sent
            console.log("Submitting Login Data:", { email, password });

            const response = await axios.post("http://localhost:3002/api/auth/login", {
                email,
                password,
            });

            console.log("Login Response:", response.data);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            onLogin();
            navigate(response.data.role === "admin" ? "/admin" : "/home");
        } catch (err: any) {
            console.error("Login Error:", err.response?.data || err.message);
            setError("Invalid email or password!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="enhanced-login-container">
            <div className="enhanced-login-card">
                <h1 className="enhanced-login-title">Login</h1>
                <form className="enhanced-login-form" onSubmit={handleSubmit}>
                    <div className="enhanced-login-input-group">
                        <label htmlFor="email" className="enhanced-login-label">
                            Email
                        </label>
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
                        <label htmlFor="password" className="enhanced-login-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            className="enhanced-login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="enhanced-login-error">{error}</p>}
                    <button
                        type="submit"
                        className="enhanced-login-button"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
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
