import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthEntry.css";
import { UserPlus, LogIn, Home, Shield, Users, Star, TrendingUp } from "lucide-react";

const AuthEntry: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-entry-container">
            <div className="auth-entry-content fade-in-up">
                <h1 className="auth-entry-title">Welcome to Real Estate!</h1>
                <p className="auth-entry-sub">
                    Discover your dream property with our premium real estate platform. 
                    Join thousands of satisfied customers in finding the perfect home.
                </p>

                <div className="auth-entry-stats fade-in-up-delay">
                    <div className="stat-item">
                        <span className="stat-number">50K+</span>
                        <span className="stat-label">Happy Customers</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">10K+</span>
                        <span className="stat-label">Properties Listed</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">98%</span>
                        <span className="stat-label">Success Rate</span>
                    </div>
                </div>

                <div className="auth-entry-features fade-in-up-delay">
                    <div className="feature-card">
                        <Home className="feature-icon" />
                        <h3 className="feature-title">Premium Properties</h3>
                        <p className="feature-description">
                            Access thousands of verified premium properties across prime locations
                        </p>
                    </div>
                    <div className="feature-card">
                        <Shield className="feature-icon" />
                        <h3 className="feature-title">Secure Platform</h3>
                        <p className="feature-description">
                            Bank-level security and complete transparency in all transactions
                        </p>
                    </div>
                    <div className="feature-card">
                        <Users className="feature-icon" />
                        <h3 className="feature-title">Expert Support</h3>
                        <p className="feature-description">
                            Professional real estate agents available 24/7 for assistance
                        </p>
                    </div>
                    <div className="feature-card">
                        <Star className="feature-icon" />
                        <h3 className="feature-title">5-Star Service</h3>
                        <p className="feature-description">
                            Award-winning customer service with highest satisfaction ratings
                        </p>
                    </div>
                </div>

                <div className="auth-entry-buttons fade-in-up-delay-2">
                    <button 
                        className="auth-button primary" 
                        onClick={() => navigate("/signup")}
                    >
                        <UserPlus size={20} />
                        Get Started
                    </button>
                    <button 
                        className="auth-button secondary" 
                        onClick={() => navigate("/login")}
                    >
                        <LogIn size={20} />
                        Sign In
                    </button>
                    <button 
                        className="auth-button skip" 
                        onClick={() => navigate("/home")}
                    >
                        <TrendingUp size={20} />
                        Browse Properties
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthEntry;
