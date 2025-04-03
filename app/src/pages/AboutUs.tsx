import React from "react";
import "../styles/AboutUs.css";

const AboutUs: React.FC = () => {
    return (
        <div className="enhanced-about-container">
            <div className="enhanced-about-header">
                <h1 className="enhanced-about-title">About Us</h1>
                <p className="enhanced-about-subtitle">
                    Your Trusted Partner in Real Estate
                </p>
            </div>
            <div className="enhanced-about-content">
                <p className="enhanced-about-text">
                    Welcome to <span className="highlight">Real Estate</span>! Our journey in the real estate world has been built on trust, dedication, and a commitment to helping our clients find their perfect spaces. Whether you’re looking for a warehouse, shop, or dream apartment, we’re here to make it happen.
                </p>
                <p className="enhanced-about-text">
                    With years of experience and a passion for delivering exceptional results, we pride ourselves on connecting people with the best real estate options available.
                </p>
                <p className="enhanced-about-thank-you">
                    Thank you for choosing us as your trusted partner in real estate!
                </p>
            </div>
            <div className="enhanced-about-image">
                <img
                    src="https://via.placeholder.com/600x400?text=Real+Estate+Team"
                    alt="Real Estate Team"
                />
            </div>
        </div>
    );
};

export default AboutUs;
