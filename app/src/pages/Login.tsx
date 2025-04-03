/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await axios.post("http://localhost:3002/api/auth/login", formData);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role || "user");
            onLogin();
            navigate(response.data.role === "admin" ? "/admin" : "/user-dashboard");
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="enhanced-login-container">
            <div className="enhanced-login-card">
                <h1 className="enhanced-login-title">Login</h1>
                <form onSubmit={handleSubmit} className="enhanced-login-form">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="enhanced-login-input"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="enhanced-login-input"
                        required
                    />
                    {error && <p className="enhanced-login-error">{error}</p>}
                    <button
                        type="submit"
                        className="enhanced-login-button"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="enhanced-login-footer">
                    Don’t have an account?{" "}
                    <a href="/signup" className="enhanced-login-signup-link">
                        Sign up here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;