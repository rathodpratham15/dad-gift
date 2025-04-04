import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthEntry.css"; // optional for custom styles

const AuthEntry: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-entry-container">
            <h1 className="auth-entry-title">Welcome to Real Estate!</h1>
            <p className="auth-entry-sub">Sign up or log in to get started</p>
            <div className="auth-entry-buttons">
                <button className="auth-button" onClick={() => navigate("/signup")}>Sign Up</button>
                <button className="auth-button secondary" onClick={() => navigate("/login")}>Login</button>
            </div>
        </div>
    );
};

export default AuthEntry;
