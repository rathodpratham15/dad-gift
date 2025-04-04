/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Signup.css";
// import { GoogleLogin } from "@react-oauth/google";
// import { jwtDecode } from "jwt-decode";

const Signup: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
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
            const response = await axios.post(
                "http://localhost:3002/api/auth/register",
                formData
            );
            if (response.status === 201) {
                alert("Signup successful! You can now log in.");
                navigate("/login");
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError("Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // const handleGoogleSuccess = async (credentialResponse: any) => {
    //     try {
    //         const decoded: any = jwtDecode(credentialResponse.credential);
    //         const { email, name } = decoded;

    //         const res = await axios.post("http://localhost:3002/api/auth/google-login", {
    //             email,
    //             name,
    //         });

    //         localStorage.setItem("token", res.data.token);
    //         localStorage.setItem("role", res.data.role);

    //         navigate(res.data.role === "admin" ? "/admin" : "/home");
    //     } catch (err) {
    //         console.error("Google signup error:", err);
    //         setError("Google signup failed.");
    //     }
    // };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h1 className="signup-title">Sign-Up</h1>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="signup-input"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="signup-input"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="signup-input"
                />

                {error && <p className="signup-error">{error}</p>}

                <button type="submit" className="signup-button" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>

                {/* <div style={{ margin: "1rem auto" }}>
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google signup failed")} />
                </div> */}

                <p className="signup-footer">
                    Already have an account?{" "}
                    <a href="/login" className="signup-link">
                        Login here
                    </a>
                </p>
            </form>
        </div>
    );
};

export default Signup;
